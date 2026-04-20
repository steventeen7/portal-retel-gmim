import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const url = new URL(req.url);
  const targetId = url.searchParams.get('targetId');

  try {
    if (targetId) {
      // Find private messages between payload.id and targetId
      const messages = await db.chat.getPrivateMessages(payload.id, targetId);
      return NextResponse.json(messages);
    } else {
      // Find public messages
      const messages = await db.chat.getMessages();
      return NextResponse.json(messages);
    }
  } catch (err) {
    console.error('API Chat Get Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    const { message, toId } = await req.json();
    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const newMsg = await db.chat.createMessage(payload.id, payload.full_name, message, toId || null);
    
    if (db.logs) {
      const targetText = toId ? `ke user ${toId}` : 'di ruang publik';
      await db.logs.create(payload.id, `Mengirim pesan chat ${targetText}`);
    }
    
    return NextResponse.json(newMsg);
  } catch (err) {
    console.error('API Chat Post Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
