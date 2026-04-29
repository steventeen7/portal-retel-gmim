import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    test_var: process.env.TEST_VAR || 'missing',
    public_test_var: process.env.NEXT_PUBLIC_TEST_VAR || 'missing',
    sk: process.env.SK ? 'exists' : 'missing',
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'missing',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing',
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV
  });
}
