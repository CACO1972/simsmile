import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  // Prefer environment variables, but fall back to preconfigured Cloud values
  const url = import.meta.env.VITE_SUPABASE_URL || "https://qdbldrlzabqcuadlkyoy.supabase.co";
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkYmxkcmx6YWJxY3VhZGxreW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDk3MTIsImV4cCI6MjA3NTUyNTcxMn0.BC0i9D6XSXndYXjNm0awOrrQMfwBEp2xtQNyfdWsXa8";

  if (!url || !key) {
    // Avoid crashing the whole app; throw a clear error that callers can catch
    throw new Error('Backend not configured: missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  client = createClient<Database>(url, key, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
}
