import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      )
    }

    const user = await db.users.findByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      )
    }

    const isApproved = user.role === 'admin' || user.is_approved === true;
    if (!isApproved) {
      return NextResponse.json(
        { error: 'Akun Anda belum disetujui oleh Admin. Mohon bersabar.' },
        { status: 403 }
      )
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      )
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      is_approved: user.is_approved
    })

    const response = NextResponse.json(
      { message: 'Login berhasil!', user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } },
      { status: 200 }
    )
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    if (db.logs) {
      await db.logs.create(user.id, `Login dari ${email}`)
    }

    return response
  } catch (err: any) {
    console.error('[LOGIN ERROR]', err)
    return NextResponse.json({ 
      error: 'Terjadi kesalahan server.', 
      details: err.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 })
  }
}
