import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tipe, judul, skor, feedback, jawaban } = body;

    const newHistory = await db.simulationHistory.create({
      user_id: user.id,
      tipe,
      judul,
      skor,
      feedback,
      jawaban
    });

    return NextResponse.json({ success: true, data: newHistory });
  } catch (error) {
    console.error('Save Simulation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
