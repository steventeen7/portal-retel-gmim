import { createClient, SupabaseClient } from '@supabase/supabase-js'

let adminInstance: SupabaseClient | null = null;

/**
 * Admin Supabase client (Lazy Singleton).
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (adminInstance) return adminInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.DATABASE_ADMIN_KEY || process.env.SK || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || 'placeholder-key'

  adminInstance = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminInstance;
}

export const supabaseAdmin: any = new Proxy({}, {
  get(target, prop) {
    const instance = getSupabaseAdmin();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
