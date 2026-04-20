import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import TesClient from './TesClient'

export default async function TesTertulisPage() {
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

    if (role !== 'admin' && !perms.includes('tes')) {
      redirect('/dashboard?error=unauthorized&module=tes')
    }

    return <TesClient user={user} />
  } catch (err) {
    if (isRedirectError(err)) throw err
    
    console.error('[TES PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
