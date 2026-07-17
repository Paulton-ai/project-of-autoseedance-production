import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabaseEnvMissing = false;

export const supabase = createClient<Database>(
  'https://vcercajwtbjbvjhzivjb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZXJjYWp3dGJqYnZqaHppdmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDczMjYsImV4cCI6MjA5NzA4MzMyNn0.cqIvDEmF6Yyz7bdFQBSrl5DTzcpv6YOxF2zbrFqAs1k',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);

export default supabase;
