import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const onlineUsers = await db.presence.getOnlineUsers();
    return NextResponse.json({ users: onlineUsers });
  } catch (err) {
    console.error('API Presence Get Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    await db.presence.ping(payload.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API Presence Post Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
