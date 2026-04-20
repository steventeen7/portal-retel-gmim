import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/soal?tahun=2024
export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tahunParam = searchParams.get('tahun')

  let soal
  if (tahunParam) {
    soal = db.soalTes.findByTahun(parseInt(tahunParam))
  } else {
    soal = db.soalTes.findAll()
  }

  // Hilangkan jawaban_benar untuk client-side (keamanan)
  const soalSafe = soal.map(({ jawaban_benar: _jb, ...rest }: import('@/lib/db/local').SoalTes) => rest)

  return NextResponse.json({ soal: soalSafe, tahun_list: db.soalTes.getTahunList() })
}
