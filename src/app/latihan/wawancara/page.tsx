import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import WawancaraClient from './WawancaraClient'

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

    const perms = Array.isArray(user.permissions) ? user.permissions : []
    const role = user.role || 'user'

    if (role !== 'admin' && !perms.includes('wawancara')) {
      redirect('/dashboard?error=unauthorized&module=wawancara')
    }

    return <WawancaraClient user={user} />
  } catch (err) {
    if (isRedirectError(err)) throw err
    
    console.error('[WAWANCARA PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
