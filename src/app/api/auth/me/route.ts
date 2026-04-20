import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Token tidak valid atau sudah kadaluarsa.' }, { status: 401 })
  }

  return NextResponse.json({ user: payload })
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logout berhasil.' })
  response.cookies.set('token', '', { maxAge: 0, path: '/' })
  return response
}
