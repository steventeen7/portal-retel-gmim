import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client menggunakan Service Role Key.
 * Menggunakan Proxy agar selalu mengambil nilai env terbaru saat runtime
 * dan menghindari caching 'placeholder' saat build.
 */
const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

  if (typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    console.error('[SUPABASE ADMIN] Runtime env vars missing!', {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Proxy agar tetap bisa import { supabaseAdmin } dan panggil .from()
export const supabaseAdmin: any = new Proxy({}, {
  get(target, prop) {
    const client = createAdminClient();
    return (client as any)[prop];
  }
});

// Helper function untuk penggunaan eksplisit
export const getSupabaseAdmin = () => createAdminClient();
