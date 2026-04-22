import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { verifyToken } from '@/lib/auth'

// POST /api/nilai — Simpan skor tes tertulis ke Supabase
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 })

  try {
    const { tahun, skor, jawaban } = await req.json()

    if (!tahun || skor === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
    }

    // Simpan ke tabel nilai_user di Supabase
    const { data, error } = await supabase
      .from('nilai_user')
      .insert([{
        user_id: payload.id,
        tahun,
        skor,
        jawaban: jawaban ?? {},
        created_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error('[NILAI INSERT ERROR]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id, skor })
  } catch (err) {
    console.error('[NILAI ERROR]', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

// GET /api/nilai — Riwayat nilai user yang sedang login
export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 })

  const { data, error } = await supabase
    .from('nilai_user')
    .select('*')
    .eq('user_id', payload.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ riwayat: data || [] })
}
