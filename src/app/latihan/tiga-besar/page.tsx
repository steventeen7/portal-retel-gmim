import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import TigaBesarClient from './TigaBesarClient'

export default async function TigaBesarPage() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const payload = token ? verifyToken(token) : null
    
    if (!payload || !payload.id) {
      redirect('/auth/login')
    }

    const user = await db.users.findById(payload.id)
    if (!user) {
      redirect('/auth/login')
    }

    // Check permission
    const perms = Array.isArray(user.permissions) ? user.permissions : []
    if (user.role !== 'admin' && !perms.includes('tiga-besar')) {
      redirect('/dashboard?error=unauthorized&module=tiga-besar')
    }

    return <TigaBesarClient user={user} />
  } catch (err) {
    console.error('[TIGA BESAR PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
