import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Debug log di runtime (server-side only)
if (typeof window === 'undefined') {
  console.log('[SUPABASE ADMIN] URL present:', !!supabaseUrl)
  console.log('[SUPABASE ADMIN] Service key present:', !!serviceRoleKey, '| length:', serviceRoleKey.length)
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[SUPABASE ADMIN] CRITICAL: Missing env vars! supabaseUrl:', !!supabaseUrl, '| serviceRoleKey:', !!serviceRoleKey)
}

/**
 * Admin Supabase client menggunakan Service Role Key.
 * HANYA digunakan di sisi server (API routes / Server Components).
 * Client ini mem-bypass RLS — jangan pernah expose ke browser.
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
