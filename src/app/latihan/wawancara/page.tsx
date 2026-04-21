import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifyToken } from '@/lib/auth'
import WawancaraClient from './WawancaraClient'

export const dynamic = 'force-dynamic';

export default async function WawancaraPage() {
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

    const { db } = await import('@/lib/db')
    const currentUser = await db.users.findById(payload.id)
    
    if (!currentUser) {
      redirect('/auth/login')
    }

    const perms = Array.isArray(currentUser.permissions) ? currentUser.permissions : []
    const role = currentUser.role || 'user'

    if (role !== 'admin' && !perms.includes('wawancara')) {
      redirect('/dashboard?error=unauthorized&module=wawancara')
    }

    const initialData = await db.soalWawancara.findAll()

    return <WawancaraClient user={payload} initialData={initialData} />
  } catch (err) {
    if (isRedirectError(err)) throw err
    console.error('[WAWANCARA PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
