import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkqjeyedaeucfbrsvbyj.supabase.co'
// Hardcoded service role key as a definitive fix for Vercel env propagation issues
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                     process.env.SK || 
                     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcWpleWVkYWV1Y2ZicnN2YnlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY4MTE4MiwiZXhwIjoyMDkyMjU3MTgyfQ.g4BYoKvbfjI_jESI2_3vYUOGQN5QTUUNIlcXBAkewCM'

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const getSupabaseAdmin = () => supabaseAdmin
