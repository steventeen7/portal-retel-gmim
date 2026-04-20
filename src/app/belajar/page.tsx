import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import MateriClient from './MateriClient'

export default async function MateriPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const user = token ? await verifyToken(token) : null
  if (!user) redirect('/auth/login')

  const materiAll = await db.materi.findAll()

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">📚 Materi Belajar</h1>
        <p className="text-gray-600">
          {(materiAll || []).length} topik materi — klik untuk membaca konten lengkap.
        </p>
      </div>
      <MateriClient materiList={materiAll || []} />
    </div>
  )
}
