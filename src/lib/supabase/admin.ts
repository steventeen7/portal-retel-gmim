import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client menggunakan Service Role Key.
 * Dibuat sebagai getter agar selalu mengambil nilai env terbaru saat runtime
 * dan menghindari caching 'placeholder' saat build.
 */
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    if (typeof window === 'undefined') {
      console.error('[SUPABASE ADMIN] Missing env vars!', {
        url: !!supabaseUrl,
        key: !!serviceRoleKey
      })
    }
    // Fallback ke placeholder agar tidak crash saat build static
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      serviceRoleKey || 'placeholder-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export instance untuk kemudahan penggunaan (tapi getSupabaseAdmin lebih aman)
export const supabaseAdmin = getSupabaseAdmin()
