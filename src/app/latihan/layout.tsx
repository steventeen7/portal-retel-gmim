import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

// Parent layout: hanya cek auth & approval.
// Pengecekan izin modul spesifik dilakukan di sub-layout masing-masing
// (tes/layout.tsx, wawancara/layout.tsx, keyword/layout.tsx, tiga-besar/layout.tsx)
// yang membaca langsung dari DB — tidak bergantung pada JWT yang bisa kadaluarsa.

export default async function LatihanLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect('/auth/login');
  }

  // Baca user dari DB untuk cek approval terbaru
  const user = await db.users.findById(payload.id);

  if (!user) {
    redirect('/auth/login');
  }

  if (!user.is_approved && user.role !== 'admin') {
    redirect('/dashboard?error=pending');
  }

  return <>{children}</>;
}
