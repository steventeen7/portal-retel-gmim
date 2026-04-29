import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Akses eksplisit untuk mencegah tree-shaking
  const sk = process.env.SK;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    sk_status: sk ? `exists (length: ${sk.length})` : 'missing',
    service_key_status: serviceKey ? `exists (length: ${serviceKey.length})` : 'missing',
    anon_key_status: anonKey ? `exists (length: ${anonKey.length})` : 'missing',
    url_status: url ? `exists (${url.substring(0, 10)}...)` : 'missing',
    all_keys_count: Object.keys(process.env).length,
    env_snapshot: {
      SK: !!process.env.SK,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
  });
}
