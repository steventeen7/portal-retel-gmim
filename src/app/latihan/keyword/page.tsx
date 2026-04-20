import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
      // Jika user tidak ditemukan (mungkin ID lama di cookie), paksa logout/login ulang
      redirect('/auth/login')
    }

    // Check permission - Tambahkan pengecekan Array.isArray untuk keamanan
    const perms = Array.isArray(user.permissions) ? user.permissions : []
    if (user.role !== 'admin' && !perms.includes('keyword')) {
      redirect('/dashboard?error=unauthorized&module=keyword')
    }

    return <KeywordClient user={user} />
  } catch (err) {
    console.error('[KEYWORD PAGE ERROR]', err)
    // Jika ada error apa pun (salah format UUID dsb), arahkan ke login agar sesi segar
    redirect('/auth/login')
  }
}
