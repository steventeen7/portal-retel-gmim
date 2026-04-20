import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const payload = token ? await verifyToken(token) : null;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      node_env: process.env.NODE_ENV,
    },
    auth: {
      has_token: !!token,
      is_valid: !!payload,
      payload_id: payload?.id,
      payload_role: payload?.role,
    },
    headers: Object.fromEntries(req.headers.entries()),
  });
}
