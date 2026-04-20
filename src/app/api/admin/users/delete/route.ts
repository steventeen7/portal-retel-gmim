import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === payload.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const success = await db.users.delete(userId);
    if (!success) {
      return NextResponse.json({ error: 'User not found or deletion failed' }, { status: 404 });
    }
    
    // Log the deletion
    if (db.logs) {
       await db.logs.create(payload.id, `Menghapus akun pengguna dengan ID ${userId}`);
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('[DELETE USER]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
