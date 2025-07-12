interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  record(operation: string, duration: number, success: boolean, error?: string) {
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now(),
      success,
      error
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getStats(operation?: string) {
    const filtered = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filtered.length === 0) return null;

    const durations = filtered.map(m => m.duration);
    const successCount = filtered.filter(m => m.success).length;
    const errorCount = filtered.length - successCount;

    return {
      total: filtered.length,
      success: successCount,
      errors: errorCount,
      successRate: (successCount / filtered.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: this.percentile(durations, 95),
      p99Duration: this.percentile(durations, 99)
    };
  }

  getRecentErrors(limit: number = 10) {
    return this.metrics
      .filter(m => !m.success)
      .slice(-limit)
      .reverse();
  }

  getOperationBreakdown() {
    const operations = new Map<string, { total: number; success: number; errors: number; avgDuration: number }>();
    
    this.metrics.forEach(metric => {
      const existing = operations.get(metric.operation) || { total: 0, success: 0, errors: 0, avgDuration: 0 };
      existing.total++;
      if (metric.success) {
        existing.success++;
      } else {
        existing.errors++;
      }
      existing.avgDuration = (existing.avgDuration * (existing.total - 1) + metric.duration) / existing.total;
      operations.set(metric.operation, existing);
    });

    return Array.from(operations.entries()).map(([operation, stats]) => ({
      operation,
      ...stats,
      successRate: (stats.success / stats.total) * 100
    }));
  }

  private percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  clear() {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure performance
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    performanceMonitor.record(operation, duration, true);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    performanceMonitor.record(operation, duration, false, error instanceof Error ? error.message : String(error));
    throw error;
  }
}; 