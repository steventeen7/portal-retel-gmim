import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  const diagnostics = {
    env: {
      DB_MODE: process.env.DB_MODE || 'NOT SET (Defaults to local)',
      HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      HAS_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    },
    database: {
      status: 'testing...',
      error: null as any
    }
  }

  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    diagnostics.database.status = `Tersambung (Jumlah user: ${count})`
  } catch (err: any) {
    diagnostics.database.status = 'Gagal Tersambung'
    diagnostics.database.error = err.message || err
  }

  return NextResponse.json(diagnostics)
}
