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
  const chatLogs = await db.chat.findAllLogs() // Fetch chat history

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <main className="max-w-7xl mx-auto px-6">
        <AdminClient 
          initialUsers={users} 
          initialLogs={logs} 
          initialChatLogs={chatLogs} 
        />
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
