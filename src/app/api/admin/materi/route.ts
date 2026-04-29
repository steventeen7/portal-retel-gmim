import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  return await handleRequest(req, async (data) => {
    const { judul, kategori, konten } = data
    const { data: res, error } = await getSupabaseAdmin()
      .from('materi_belajar')
      .insert([{ judul, kategori, konten }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return res
  })
}

export async function PUT(req: NextRequest) {
  return await handleRequest(req, async (data) => {
    const { id, judul, kategori, konten } = data
    if (!id) throw new Error('ID materi diperlukan')
    const { data: res, error } = await getSupabaseAdmin()
      .from('materi_belajar')
      .update({ judul, kategori, konten })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    if (!res) throw new Error('Materi tidak ditemukan')
    return res
  })
}

export async function DELETE(req: NextRequest) {
  return await handleRequest(req, async (data) => {
    const { id } = data
    if (!id) throw new Error('ID materi diperlukan')
    const { error } = await getSupabaseAdmin()
      .from('materi_belajar')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  })
}

async function handleRequest(req: NextRequest, action: (data: any) => Promise<any>) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const data = await req.json()
    const result = await action(data)

    // Log aktivitas
    await getSupabaseAdmin().from('activity_logs').insert([{
      user_id: payload.id,
      activity: `Mengelola materi belajar: ${req.method}`,
      timestamp: new Date().toISOString()
    }])

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('[API /admin/materi]', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
