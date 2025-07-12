import { createClient } from '@supabase/supabase-js';
import { performanceMonitor, measurePerformance } from './performance';

// Enhanced database client with performance monitoring
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Performance-monitored database operations
export const db = {
  async query(operation: string, queryFn: () => Promise<any>) {
    return measurePerformance(`database_${operation}`, queryFn);
  },

  async insert(table: string, data: any) {
    return this.query('insert', async () => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    });
  },

  async update(table: string, id: string, data: any) {
    return this.query('update', async () => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    });
  },

  async select(table: string, options?: { limit?: number; orderBy?: string; filters?: any }) {
    return this.query('select', async () => {
      let query = supabase.from(table).select('*');
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: false });
      }
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    });
  },

  async delete(table: string, id: string) {
    return this.query('delete', async () => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    });
  }
}; 