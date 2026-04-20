import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import KeywordClient from './KeywordClient'

export default async function KeywordPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = token ? verifyToken(token) : null
  
  if (!payload) redirect('/auth/login')

  const user = await db.users.findById(payload.id)
  if (!user) redirect('/auth/login')

  // Check permission
  if (user.role !== 'admin' && !user.permissions?.includes('keyword')) {
    redirect('/dashboard?error=unauthorized&module=keyword')
  }

  return <KeywordClient user={user} />
}
