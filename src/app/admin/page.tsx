import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { Shield, LayoutDashboard, Users, Activity, BookOpen } from 'lucide-react'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/dashboard')

  // Fetch asinkron dari Supabase (via db adapter)
  const users = await db.users.findAll()
  const logs = await db.logs.findAll()
  const stats = {
    totalUsers: users.length,
    pendingUsers: users.filter((u: any) => !u.is_approved).length,
    activeToday: 0 // Bisa ditingkatkan nanti
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-7xl mx-auto py-12">
        {/* Admin Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4 animate-fade-in-up">
            <div className="p-4 rounded-[24px] bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Pusat Kendali Admin</h1>
              <p className="text-gray-500 font-medium">Manajemen verifikasi peserta & izin akses modul</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center min-w-[140px]">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Peserta</div>
                <div className="text-2xl font-black text-gray-900">{stats.totalUsers}</div>
             </div>
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center min-w-[140px]">
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Menunggu</div>
                <div className="text-2xl font-black text-amber-500">{stats.pendingUsers}</div>
             </div>
             <div className="hidden md:block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center min-w-[140px]">
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Sistem</div>
                <div className="text-2xl font-black text-emerald-500">Aktif</div>
             </div>
          </div>
        </div>

        {/* Client Component for Interactivity */}
        <div className="mb-6 flex justify-end">
           <a href="/admin/materi" className="btn-primary py-3 px-6 shadow-xl shadow-purple-500/20 active:scale-95 font-bold text-sm bg-purple-600 text-white rounded-2xl flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Kelola Materi Belajar
           </a>
        </div>
        <AdminClient initialUsers={users} initialLogs={logs} />
      </main>

      {/* Footer Design */}
      <footer className="mt-20 py-10 border-t border-gray-100 opacity-50">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">PORTAL RESMI RETEL GMIM • ADVANCED ADMIN PANEL</p>
         </div>
      </footer>
    </div>
  )
}
