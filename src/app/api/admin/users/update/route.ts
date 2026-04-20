import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Akses ditolak. Anda bukan Admin.' }, { status: 403 })
  }

  try {
    const { userId, permissions, isApproved, full_name, email, jemaat, wilayah, rayon, phone, role } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'ID Pengguna wajib diisi.' }, { status: 400 })
    }

    const updated = await db.users.update(userId, { 
      permissions, 
      is_approved: isApproved,
      full_name,
      email,
      jemaat,
      wilayah,
      rayon,
      phone,
      role
    })

    if (db.logs) {
      await db.logs.create(payload.id, `Melakukan update pada pengguna: ${full_name}`)
    }

    return NextResponse.json({ message: 'Akses pengguna berhasil diperbarui.', user: updated })
  } catch (err) {
    console.error('[ADMIN UPDATE ERROR]', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
