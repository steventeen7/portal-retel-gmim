import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  return await handleRequest(req, async (data) => {
    return await db.materi.create(data)
  })
}

export async function PUT(req: NextRequest) {
  return await handleRequest(req, async (data) => {
    const { id, ...updateData } = data
    if (!id) throw new Error('ID materi diperlukan')
    const updated = await db.materi.update(id, updateData)
    if (!updated) throw new Error('Materi tidak ditemukan')
    return updated
  })
}

export async function DELETE(req: NextRequest) {
  return await handleRequest(req, async (data) => {
    const { id } = data
    if (!id) throw new Error('ID materi diperlukan')
    const success = await db.materi.delete(id)
    if (!success) throw new Error('Gagal menghapus materi')
    return { success: true }
  })
}

async function handleRequest(req: NextRequest, action: (data: any) => Promise<any>) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const data = await req.json()
    const result = await action(data)

    if (db.logs) {
      await db.logs.create(payload.id, `Mengelola materi belajar: ${req.method}`)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
