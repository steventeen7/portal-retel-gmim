import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkqjeyedaeucfbrsvbyj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcWpleWVkYWV1Y2ZicnN2YnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODExODIsImV4cCI6MjA5MjI1NzE4Mn0.ItHO_lypuEpssoxPW8JkoO3D49kOWxtJYyQDFiWrTX4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
