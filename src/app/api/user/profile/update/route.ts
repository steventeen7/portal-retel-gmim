import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    const body = await req.json();
    const { userId, full_name, jemaat, wilayah, rayon, phone } = body;

    // Security check: Only allow updating own profile unless admin
    if (payload.role !== 'admin' && payload.id !== userId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const updated = await db.users.update(userId, {
      full_name,
      jemaat,
      wilayah,
      rayon,
      phone
    });

    return NextResponse.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
