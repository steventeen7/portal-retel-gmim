import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const results: any = {
    env: {
      url_exists: !!url,
      url_value: url ? (url.substring(0, 10) + '...') : 'missing',
      service_key_exists: !!serviceKey,
      service_key_length: serviceKey?.length,
      anon_key_exists: !!anonKey,
      anon_key_length: anonKey?.length,
    },
    tests: {}
  };

  try {
    const admin = getSupabaseAdmin();
    const { data: profiles, error: pError } = await admin.from('profiles').select('count').limit(1);
    results.tests.admin_profiles = pError ? { status: 'error', message: pError.message } : { status: 'ok', count: profiles };
    
    const { data: materi, error: mError } = await admin.from('materi_belajar').select('count').limit(1);
    results.tests.admin_materi = mError ? { status: 'error', message: mError.message } : { status: 'ok', count: materi };
  } catch (err: any) {
    results.tests.crash = err.message;
  }

  return NextResponse.json(results);
}
