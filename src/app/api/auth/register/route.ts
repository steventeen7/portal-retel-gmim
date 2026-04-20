import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, jemaat, wilayah, rayon, phone } = await req.json()

    if (!email || !password || !full_name || !jemaat || !wilayah || !rayon || !phone) {
      return NextResponse.json(
        { error: 'Seluruh field wajib diisi.' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah terdaftar
    const existing = await db.users.findByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar.' },
        { status: 409 }
      )
    }

    const hashed = await hashPassword(password)
    const newUser = await db.users.create({ 
      email, 
      password: hashed, 
      full_name,
      jemaat,
      wilayah,
      rayon,
      phone
    })

    // Karena sistem baru memerlukan approval, kita tidak memberikan token login langsung di sini
    // melainkan mengembalikan sukses agar user menunggu persetujuan
    return NextResponse.json(
      { message: 'Pendaftaran berhasil dikirim! Silakan tunggu persetujuan Admin.', user: { email: newUser.email } },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[REGISTER ERROR]', err)
    return NextResponse.json({ 
      error: 'Terjadi kesalahan server.', 
      details: err.message || 'Unknown error'
    }, { status: 500 })
  }
}
