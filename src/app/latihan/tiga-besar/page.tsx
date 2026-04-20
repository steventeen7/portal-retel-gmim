import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import TigaBesarClient from './TigaBesarClient'

export default async function TigaBesarPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = token ? verifyToken(token) : null
  
  if (!payload) redirect('/auth/login')

  const user = await db.users.findById(payload.id)
  if (!user) redirect('/auth/login')

  // Check permission
  if (user.role !== 'admin' && !user.permissions?.includes('tiga-besar')) {
    redirect('/dashboard?error=unauthorized&module=tiga-besar')
  }

  return <TigaBesarClient user={user} />
}
