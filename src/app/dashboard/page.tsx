import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { Suspense } from 'react'
import { RefreshCw } from 'lucide-react'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = token ? await verifyToken(token) : null
  if (!payload) redirect('/auth/login')

  // Fetch real-time user data from DB
  const user = await db.users.findById(payload.id);
  if (!user) redirect('/auth/login');

  const riwayatRaw = await db.simulationHistory.findByUser(user.id);
  const riwayat = Array.isArray(riwayatRaw) ? [...riwayatRaw].reverse() : [];
  
  // Calculate stats from riwayat
  const avgSkor = riwayat.length > 0
    ? Math.round(riwayat.reduce((a: number, n: any) => {
        const avg = (n.skor.content + n.skor.correlation + n.skor.performance) / 3;
        return a + avg;
      }, 0) / riwayat.length)
    : null;

  const bestSkor = riwayat.length > 0 
    ? Math.max(...riwayat.map((n: any) => Math.round((n.skor.content + n.skor.correlation + n.skor.performance) / 3))) 
    : null;

  const tahunList = await db.soalTes.getTahunList();
  const allSoal = await db.soalTes.findAll();
  const soalCount = allSoal?.length || 0;
  const allWawancara = await db.soalWawancara.findAll();
  const wawancaraCount = allWawancara?.length || 0;
  // Fallback if materials not exist yet
  const materiCount = 0;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-8 h-8 text-purple-600 animate-spin" /></div>}>
      <DashboardClient 
        user={user}
        riwayat={riwayat}
        avgSkor={avgSkor}
        bestSkor={bestSkor}
        tahunList={tahunList}
        soalCount={soalCount}
        wawancaraCount={wawancaraCount}
        materiCount={materiCount}
      />
    </Suspense>
  )
}
