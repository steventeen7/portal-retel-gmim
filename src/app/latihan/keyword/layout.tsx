import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function KeywordLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/auth/login');

  const payload = await verifyToken(token);
  if (!payload) redirect('/auth/login');

  const perms = Array.isArray(payload.permissions) ? payload.permissions : [];

  if (payload.role !== 'admin' && !perms.includes('keyword')) {
    redirect('/dashboard?error=no-permission&module=keyword');
  }

  return <>{children}</>;
}
