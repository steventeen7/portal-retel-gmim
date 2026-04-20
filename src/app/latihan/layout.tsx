import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LatihanLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  // Zero DB dependency: Cek approval dari Token
  const payload = await verifyToken(token);
  if (!payload) {
    redirect('/auth/login');
  }

  // User harus disetujui atau admin
  if (!payload.is_approved && payload.role !== 'admin') {
    redirect('/dashboard?error=pending');
  }

  return <>{children}</>;
}
