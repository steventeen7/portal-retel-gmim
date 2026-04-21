import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Mencegah crash jika variabel tidak sengaja kosong di runtime Vercel tertentu
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('[SUPABASE] Warning: NEXT_PUBLIC_SUPABASE_URL is missing!');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('[SUPABASE] Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
}

console.log('[SUPABASE] Initializing client with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
