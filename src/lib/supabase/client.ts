import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Public Supabase client.
 * Dibuat sebagai fungsi agar selalu mengambil nilai env terbaru saat runtime.
 */
export const getSupabase = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  return createClient(url, key)
}

// Untuk kompatibilitas dengan kode lama, kita buat proxy sederhana
export const supabase: any = {
  from: (table: string) => getSupabase().from(table),
  auth: {
    getSession: () => getSupabase().auth.getSession(),
    getUser: () => getSupabase().auth.getUser(),
    signInWithPassword: (data: any) => getSupabase().auth.signInWithPassword(data),
    signOut: () => getSupabase().auth.signOut(),
    onAuthStateChange: (cb: any) => getSupabase().auth.onAuthStateChange(cb),
  }
}
