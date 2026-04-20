import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifyToken } from '@/lib/auth'
import KeywordClient from './KeywordClient'

export const dynamic = 'force-dynamic';

export default async function KeywordPage() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      redirect('/auth/login')
    }

    // Zero DB dependency: Verifikasi token dan ambil data langsung dari payload
    const payload = await verifyToken(token)
    
    if (!payload || !payload.id) {
      redirect('/auth/login')
    }

    const perms = Array.isArray(payload.permissions) ? payload.permissions : []
    const role = payload.role || 'user'

    // Check permission - Langsung dari Token
    if (role !== 'admin' && !perms.includes('keyword')) {
      redirect('/dashboard?error=unauthorized&module=keyword')
    }

    const { db } = await import('@/lib/db')
    const initialData = await db.keywords.findAll()

    return <KeywordClient user={payload} initialData={initialData} />
  } catch (err) {
    if (isRedirectError(err)) throw err
    console.error('[KEYWORD PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
