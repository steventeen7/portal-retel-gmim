import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client menggunakan Service Role Key.
 * Dibuat sebagai fungsi agar selalu mengambil nilai env terbaru saat runtime.
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Untuk kompatibilitas
export const supabaseAdmin: any = {
  from: (table: string) => getSupabaseAdmin().from(table),
}
