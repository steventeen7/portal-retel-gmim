import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// POST /api/nilai — Submit jawaban dan dapatkan skor
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 })

  try {
    const { tahun, jawaban } = await req.json()
    // jawaban: { "1": "A", "2": "C", ... } (nomor_soal => pilihan)

    if (!tahun || !jawaban) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
    }

    const soalList = db.soalTes.findByTahun(tahun)
    if (soalList.length === 0) {
      return NextResponse.json({ error: 'Soal untuk tahun tersebut tidak ditemukan.' }, { status: 404 })
    }

    // Hitung skor
    let poin = 0
    let benarCount = 0
    let salahCount = 0
    let kosongCount = 0
    const detail: Record<string, { jawaban_user: string; jawaban_benar: string; status: 'benar' | 'salah' | 'kosong' }> = {}

    for (const soal of soalList) {
      const userJawab = jawaban[soal.nomor_soal]?.toUpperCase()
      const correct = soal.jawaban_benar.toUpperCase()
      
      let status: 'benar' | 'salah' | 'kosong' = 'salah'
      if (!userJawab || userJawab === '-') {
        status = 'kosong'
        kosongCount++
      } else if (userJawab === correct) {
        status = 'benar'
        benarCount++
        poin += 2
      } else {
        status = 'salah'
        salahCount++
        poin -= 1
      }

      detail[soal.nomor_soal] = {
        jawaban_user: userJawab ?? '-',
        jawaban_benar: correct,
        status,
      }
    }

    // Skor akhir (tidak boleh negatif, tapi untuk latihan kita biarkan saja atau atasi)
    const skor = poin

    const hasil = db.nilaiUser.create({
      user_id: payload.id,
      tahun,
      skor,
      jawaban,
    })

    return NextResponse.json({ 
      skor, 
      benar: benarCount, 
      salah: salahCount, 
      kosong: kosongCount, 
      total: soalList.length, 
      detail, 
      id: hasil.id 
    })
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

  const riwayat = db.nilaiUser.findByUser(payload.id)
  return NextResponse.json({ riwayat })
}
