import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const keywords = await db.keywords.findAll();
    return NextResponse.json({ data: keywords });
  } catch (error) {
    console.error('Fetch Keywords Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
