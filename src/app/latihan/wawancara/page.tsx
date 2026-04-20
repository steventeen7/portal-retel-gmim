import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import WawancaraClient from './WawancaraClient'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function WawancaraPage() {
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
    if (user.role !== 'admin' && !perms.includes('wawancara')) {
      redirect('/dashboard?error=unauthorized&module=wawancara')
    }

    return <WawancaraClient user={user} />
  } catch (err) {
    console.error('[WAWANCARA PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
