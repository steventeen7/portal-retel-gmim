import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const results: any = {
    env: {
      url_exists: !!url,
      url_source: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'NEXT_PUBLIC' : (process.env.SUPABASE_URL ? 'SUPABASE_URL' : 'none'),
      service_key_exists: !!serviceKey,
      service_key_source: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : (process.env.SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'none'),
      anon_key_exists: !!anonKey,
    },
    tests: {}
  };

  try {
    const admin = getSupabaseAdmin();
    const { data: profiles, error: pError } = await admin.from('profiles').select('count', { count: 'exact' });
    results.tests.admin_profiles = pError ? { status: 'error', message: pError.message } : { status: 'ok', count: profiles?.[0]?.count };
  } catch (err: any) {
    results.tests.crash = err.message;
  }

  return NextResponse.json(results);
}
