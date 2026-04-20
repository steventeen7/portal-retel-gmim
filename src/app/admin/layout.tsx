import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    redirect('/dashboard');
  }

  // Real-time check from DB (Node.js environment allows fs)
  const user = await db.users.findById(payload.id);
  
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
