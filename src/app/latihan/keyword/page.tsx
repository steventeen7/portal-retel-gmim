import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import KeywordClient from './KeywordClient'

export default async function KeywordPage() {
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

    if (role !== 'admin' && !perms.includes('keyword')) {
      redirect('/dashboard?error=unauthorized&module=keyword')
    }

    return <KeywordClient user={user} />
  } catch (err) {
    // PENTING: Lempar kembali error redirect agar Next.js bisa memprosesnya
    if (isRedirectError(err)) throw err

    console.error('[KEYWORD PAGE ERROR]', err)
    redirect('/auth/login')
  }
}
