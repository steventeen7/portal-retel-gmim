import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env_keys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('KEY') || k.includes('VAR') || k === 'SK'),
    test_var: process.env.TEST_VAR || 'missing',
    sk_exists: !!process.env.SK,
    service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing'
  });
}
