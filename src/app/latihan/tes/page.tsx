import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifyToken } from '@/lib/auth'
import TesClient from './TesClient'

export const dynamic = 'force-dynamic';

export default async function TesTertulisPage() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      redirect('/auth/login')
    }

    const payload = await verifyToken(token)
    
    if (!payload || !payload.id) {
      redirect('/auth/login')
    }

    const perms = Array.isArray(payload.permissions) ? payload.permissions : []
    const role = payload.role || 'user'

    if (role !== 'admin' && !perms.includes('tes')) {
      redirect('/dashboard?error=unauthorized&module=tes')
    }

    return <TesClient user={payload} />
  } catch (err) {
    if (isRedirectError(err)) throw err
    console.error('[TES PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
