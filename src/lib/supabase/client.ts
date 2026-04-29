import { createClient } from '@supabase/supabase-js'

/**
 * Public Supabase client.
 * Menggunakan Proxy untuk memastikan nilai process.env diambil saat runtime
 * dan tidak terkena cache 'placeholder' saat build.
 */
const createDynamicClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  
  if (typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    // Hanya log di server agar tidak bocor ke client console jika tidak perlu
    console.warn('[SUPABASE] Warning: Runtime environment variables are missing! Using placeholders.');
  }

  return createClient(url, key)
}

// Proxy untuk mempertahankan API 'supabase.from(...)' tapi tetap dinamis
export const supabase: any = new Proxy({}, {
  get(target, prop) {
    const client = createDynamicClient();
    return (client as any)[prop];
  }
});
