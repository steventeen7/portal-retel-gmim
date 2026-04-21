import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { dbMode } from '@/lib/db';

export async function GET(req: NextRequest) {
  const diagnostics = {
    mode: dbMode,
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
    },
    connection: 'UNKNOWN',
    error: null as any,
  };

  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      diagnostics.connection = 'FAILED';
      diagnostics.error = error;
    } else {
      diagnostics.connection = 'SUCCESSFUL';
    }
  } catch (err: any) {
    diagnostics.connection = 'ERROR';
    diagnostics.error = err.message || err;
  }

  return NextResponse.json(diagnostics);
}
