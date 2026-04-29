import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey && typeof window === 'undefined') {
  console.warn('[SUPABASE ADMIN] Warning: SUPABASE_SERVICE_ROLE_KEY is missing! Admin operations will fail.')
}

/**
 * Admin Supabase client menggunakan Service Role Key.
 * HANYA digunakan di sisi server (API routes / Server Components).
 * Client ini mem-bypass RLS — jangan pernah expose ke browser.
 */
export const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      serviceRoleKey || 'placeholder',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
