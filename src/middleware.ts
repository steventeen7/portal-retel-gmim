import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'retel-secret-key-2026')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 1. Publik/Auth routes - izinkan
  if (pathname.startsWith('/auth') || pathname === '/') {
    return NextResponse.next()
  }

  // 2. Proteksi rute internal
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

// Hanya jalankan middleware pada rute yang membutuhkan proteksi
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/latihan/:path*',
    '/profile/:path*',
  ],
}
