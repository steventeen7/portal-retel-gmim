import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import MateriAdminClient from './MateriAdminClient'

export default async function AdminMateriPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = token ? verifyToken(token) : null
  
  if (!payload || payload.role !== 'admin') redirect('/dashboard')

  const materiList = await db.materi.findAll()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-7xl mx-auto py-12 px-4">
        <MateriAdminClient initialMateri={materiList} />
      </main>
    </div>
  )
}
