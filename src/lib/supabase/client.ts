import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;

/**
 * Public Supabase client (Lazy Singleton).
 * Memastikan URL dan Key diambil dari environment saat pertama kali diakses di runtime.
 */
export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

// Proxy yang lebih aman: hanya meneruskan properti ke instance asli
export const supabase: any = new Proxy({}, {
  get(target, prop) {
    const instance = getSupabase();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
