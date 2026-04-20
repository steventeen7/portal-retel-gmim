import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function KeywordLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/auth/login');

  const payload = verifyToken(token);
  if (!payload) redirect('/auth/login');

  // Selalu baca dari DB — bukan dari JWT yang bisa kadaluarsa
  const user = await db.users.findById(payload.id);
  if (!user) redirect('/auth/login');

  if (!user.is_approved && user.role !== 'admin') {
    redirect('/dashboard?error=pending');
  }

  // Cek izin modul 'keyword'
  if (user.role !== 'admin' && !user.permissions?.includes('keyword')) {
    redirect('/dashboard?error=no-permission&module=keyword');
  }

  return <>{children}</>;
}
