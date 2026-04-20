import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Mencegah crash jika variabel tidak sengaja kosong di runtime Vercel tertentu
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
