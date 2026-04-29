import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const diagnostics = {
    mode: 'supabase',
    runtime: typeof window === 'undefined' ? 'server' : 'client',
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
      anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
      service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING',
      service_key_len: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    },
    anon_connection: 'UNKNOWN',
    admin_connection: 'UNKNOWN',
    errors: {
      anon: null as any,
      admin: null as any
    },
  };

  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    diagnostics.anon_connection = error ? 'FAILED' : 'SUCCESS';
    if (error) diagnostics.errors.anon = error.message;
  } catch (err: any) {
    diagnostics.anon_connection = 'ERROR';
    diagnostics.errors.anon = err.message;
  }

  try {
    const { error } = await getSupabaseAdmin().from('materi_belajar').select('count', { count: 'exact', head: true });
    diagnostics.admin_connection = error ? 'FAILED' : 'SUCCESS';
    if (error) diagnostics.errors.admin = error.message;
  } catch (err: any) {
    diagnostics.admin_connection = 'ERROR';
    diagnostics.errors.admin = err.message;
  }

  return NextResponse.json(diagnostics);
}
