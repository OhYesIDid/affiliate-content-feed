interface QueueItem {
  id: string;
  operation: 'summarize' | 'rewrite' | 'tag' | 'categorize';
  data: any;
  priority: number;
  createdAt: number;
  retries: number;
}

interface QueueConfig {
  maxRetries: number;
  retryDelay: number;
  maxConcurrent: number;
  priorityLevels: number;
}

class AIQueue {
  private queue: QueueItem[] = [];
  private processing: Set<string> = new Set();
  private config: QueueConfig;
  private isProcessing = false;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      maxConcurrent: 2,
      priorityLevels: 3,
      ...config
    };
  }

  async add(operation: QueueItem['operation'], data: any, priority: number = 1): Promise<string> {
    const id = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const item: QueueItem = {
      id,
      operation,
      data,
      priority: Math.min(priority, this.config.priorityLevels),
      createdAt: Date.now(),
      retries: 0
    };

    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
    
    console.log(`📋 Added ${operation} to queue (priority: ${priority})`);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.process();
    }

    return id;
  }

  private async process() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🚀 Starting queue processing...');

    while (this.queue.length > 0 && this.processing.size < this.config.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      if (this.processing.has(item.id)) continue;

      this.processing.add(item.id);
      this.processItem(item).finally(() => {
        this.processing.delete(item.id);
      });
    }

    this.isProcessing = false;
    
    // If there are still items in queue, process again after delay
    if (this.queue.length > 0) {
      setTimeout(() => this.process(), 1000);
    }
  }

  private async processItem(item: QueueItem) {
    console.log(`⚡ Processing ${item.operation} (ID: ${item.id})`);
    
    try {
      const startTime = Date.now();
      
      // Import AI functions dynamically to avoid circular dependencies
      const { summarizeContent, generateTags, categorizeContent, rewriteArticle } = await import('./ai-providers');
      
      let result: any;
      
      switch (item.operation) {
        case 'summarize':
          result = await summarizeContent(item.data.content);
          break;
        case 'rewrite':
          result = await rewriteArticle(item.data.content, item.data.title, item.data.source);
          break;
        case 'tag':
          result = await generateTags(item.data.content);
          break;
        case 'categorize':
          result = await categorizeContent(item.data.content);
          break;
        default:
          throw new Error(`Unknown operation: ${item.operation}`);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Completed ${item.operation} in ${duration}ms`);
      
      // Store result or trigger callback
      this.handleSuccess(item, result);
      
    } catch (error) {
      console.error(`❌ Error processing ${item.operation}:`, error);
      
      if (item.retries < this.config.maxRetries) {
        item.retries++;
        item.priority = Math.max(1, item.priority - 1); // Lower priority on retry
        
        console.log(`🔄 Retrying ${item.operation} (attempt ${item.retries}/${this.config.maxRetries})`);
        
        // Add back to queue with delay
        setTimeout(() => {
          this.queue.push(item);
          this.queue.sort((a, b) => b.priority - a.priority);
          if (!this.isProcessing) this.process();
        }, this.config.retryDelay * item.retries);
      } else {
        console.error(`💀 Failed ${item.operation} after ${this.config.maxRetries} retries`);
        this.handleFailure(item, error);
      }
    }
  }

  private handleSuccess(item: QueueItem, result: any) {
    // Store result in database or trigger callback
    console.log(`📊 Success: ${item.operation} completed for ${item.id}`);
    
    // You can implement result storage here
    // For now, just log the success
  }

  private handleFailure(item: QueueItem, error: any) {
    // Handle permanent failure
    console.error(`💀 Permanent failure: ${item.operation} failed for ${item.id}`, error);
    
    // You can implement failure handling here
    // For now, just log the failure
  }

  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      isProcessing: this.isProcessing,
      maxConcurrent: this.config.maxConcurrent
    };
  }

  clear() {
    this.queue = [];
    this.processing.clear();
    this.isProcessing = false;
  }
}

// Export singleton instance
export const aiQueue = new AIQueue();

// Utility function to add items to queue
export const queueAI = {
  async summarize(content: string, priority: number = 1) {
    return aiQueue.add('summarize', { content }, priority);
  },
  
  async rewrite(content: string, title: string, source: string, priority: number = 1) {
    return aiQueue.add('rewrite', { content, title, source }, priority);
  },
  
  async tag(content: string, priority: number = 1) {
    return aiQueue.add('tag', { content }, priority);
  },
  
  async categorize(content: string, priority: number = 1) {
    return aiQueue.add('categorize', { content }, priority);
  }
}; 