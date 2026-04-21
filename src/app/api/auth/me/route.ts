import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'Token tidak valid atau sudah kadaluarsa.' }, { status: 401 })
  }

  const { db } = await import('@/lib/db')
  const user = await db.users.findById(payload.id)

  if (!user) {
     return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 })
  }

  // Return the latest data from DB
  return NextResponse.json({ user })
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logout berhasil.' })
  response.cookies.set('token', '', { maxAge: 0, path: '/' })
  return response
}
