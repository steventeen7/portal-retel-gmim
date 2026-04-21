import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// ─── Path & Cache helpers ────────────────────────────────────────────────────
const dataDir = path.join(process.cwd(), 'src', 'data')
const cache: Record<string, { data: any[], mtime: number }> = {}

function readJSON<T>(file: string): T[] {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) return []

  const stats = fs.statSync(filePath)
  const mtime = stats.mtimeMs

  // Return cached data if available and not stale
  if (cache[file] && cache[file].mtime === mtime) {
    return cache[file].data
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content) as T[]
  
  // Save to cache with mtime
  cache[file] = { data, mtime }
  return data
}

function writeJSON<T>(file: string, data: T[]): void {
  const filePath = path.join(dataDir, file)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  // Update cache on write
  cache[file] = { data, mtime: Date.now() }
}

// ─── Types ───────────────────────────────────────────────────────────────────
export type User = {
  id: string
  email: string
  password: string
  full_name: string
  role: string
  is_approved?: boolean
  permissions?: string[]
  jemaat?: string
  wilayah?: string
  rayon?: string
  phone?: string
  created_at: string
}

export type SoalTes = {
  id: number
  tahun: number
  nomor_soal: number
  teks_soal: string
  opsi_a: string
  opsi_b: string
  opsi_c: string
  opsi_d: string
  jawaban_benar: string
  tipe_soal: string
}

export type NilaiUser = {
  id: number
  user_id: string
  tahun: number
  skor: number
  jawaban: Record<string, string>
  created_at: string
}

export type SoalWawancara = {
  id: number
  kategori: string
  pertanyaan: string
}

export type Materi = {
  id: number
  kategori: string
  judul: string
  konten: string
}

export type SimulationHistory = {
  id: number
  user_id: string
  tipe: 'wawancara' | 'keyword' | 'tiga-besar'
  judul: string
  skor: {
    content: number
    correlation: number
    performance: number
  }
  feedback: string
  jawaban: string
  created_at: string
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const localDB = {
  users: {
    findByEmail(email: string): User | undefined {
      const users = readJSON<User>('users.json')
      return users.find((u) => u.email === email)
    },
    findById(id: string): User | undefined {
      const users = readJSON<User>('users.json')
      return users.find((u) => u.id === id)
    },
    create(data: Omit<User, 'id' | 'created_at'> & { role?: string }): User {
      const users = readJSON<User>('users.json')
      const newUser: User = {
        id: randomUUID(),
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role ?? 'user',
        is_approved: false,
        permissions: [],
        jemaat: data.jemaat,
        wilayah: data.wilayah,
        rayon: data.rayon,
        created_at: new Date().toISOString(),
      }
      users.push(newUser)
      writeJSON('users.json', users)
      return newUser
    },
    findAll(): Omit<User, 'password'>[] {
      const users = readJSON<User>('users.json')
      return users.map(({ password: _p, ...rest }: User) => rest)
    },
    update(id: string, data: Partial<User>): Omit<User, 'password'> | undefined {
      const users = readJSON<User>('users.json')
      const idx = users.findIndex((u) => u.id === id)
      if (idx === -1) return undefined
      users[idx] = { ...users[idx], ...data }
      writeJSON('users.json', users)
      const { password: _p, ...rest } = users[idx] as User
      return rest
    },
    async delete(id: string): Promise<boolean> {
      let users = readJSON<User>('users.json')
      const initialLength = users.length
      users = users.filter((u) => u.id !== id)
      if (users.length !== initialLength) {
        writeJSON('users.json', users)
        return true
      }
      return false
    },
  },

  // ─── Soal Tes ─────────────────────────────────────────────────────────────
  soalTes: {
    findByTahun(tahun: number): SoalTes[] {
      const soal = readJSON<SoalTes>('soal_tes.json')
      return soal.filter((s) => s.tahun === tahun)
    },
    findAll(): SoalTes[] {
      return readJSON<SoalTes>('soal_tes.json')
    },
    getTahunList(): number[] {
      const soal = readJSON<SoalTes>('soal_tes.json')
      return [...new Set(soal.map((s) => s.tahun))].sort((a, b) => b - a)
    },
    countAll(): number {
      return readJSON<SoalTes>('soal_tes.json').length
    }
  },

  // ─── Nilai User ───────────────────────────────────────────────────────────
  nilaiUser: {
    create(data: Omit<NilaiUser, 'id' | 'created_at'>): NilaiUser {
      const nilai = readJSON<NilaiUser>('nilai_user.json')
      const newNilai: NilaiUser = {
        id: nilai.length + 1,
        ...data,
        created_at: new Date().toISOString(),
      }
      nilai.push(newNilai)
      writeJSON('nilai_user.json', nilai)
      return newNilai
    },
    findByUser(userId: string): NilaiUser[] {
      const nilai = readJSON<NilaiUser>('nilai_user.json')
      return nilai.filter((n) => n.user_id === userId)
    },
    findAll(): NilaiUser[] {
      return readJSON<NilaiUser>('nilai_user.json')
    },
  },

  // ─── Soal Wawancara ───────────────────────────────────────────────────────
  soalWawancara: {
    findAll(): SoalWawancara[] {
      return readJSON<SoalWawancara>('soal_wawancara.json')
    },
    findByKategori(kategori: string): SoalWawancara[] {
      const soal = readJSON<SoalWawancara>('soal_wawancara.json')
      return soal.filter((s) => s.kategori === kategori)
    },
    countAll(): number {
      return readJSON<SoalWawancara>('soal_wawancara.json').length
    }
  },

  // ─── Materi Belajar ───────────────────────────────────────────────────────
  materi: {
    findAll(): Materi[] {
      return readJSON<Materi>('materi_belajar.json')
    },
    findByKategori(kategori: string): Materi[] {
      const materi = readJSON<Materi>('materi_belajar.json')
      return materi.filter((m) => m.kategori === kategori)
    },
    findById(id: number): Materi | undefined {
      const materi = readJSON<Materi>('materi_belajar.json')
      return materi.find((m) => m.id === id)
    },
    create(data: Omit<Materi, 'id'>): Materi {
      const materi = readJSON<Materi>('materi_belajar.json')
      const newMateri = { ...data, id: Date.now() }
      materi.push(newMateri)
      writeJSON('materi_belajar.json', materi)
      return newMateri
    },
    update(id: number, data: Partial<Materi>): Materi | null {
      const materi = readJSON<Materi>('materi_belajar.json')
      const idx = materi.findIndex(m => m.id === id)
      if (idx === -1) return null
      materi[idx] = { ...materi[idx], ...data }
      writeJSON('materi_belajar.json', materi)
      return materi[idx]
    },
    delete(id: number): boolean {
      let materi = readJSON<Materi>('materi_belajar.json')
      const initialLength = materi.length
      materi = materi.filter(m => m.id !== id)
      if (materi.length !== initialLength) {
        writeJSON('materi_belajar.json', materi)
        return true
      }
      return false
    }
  },

  // ─── Kata Kunci ────────────────────────────────────────────────────────────
  keywords: {
    findAll(): { id: number; kata: string; materi: string } [] {
      return readJSON<{ id: number; kata: string; materi: string }>('kata_kunci.json')
    },
  },

  // ─── Tiga Besar ─────────────────────────────────────────────────────────────
  tigaBesar: {
    findAll(): { id: number; pertanyaan: string; level: string }[] {
      return readJSON<{ id: number; pertanyaan: string; level: string }>('soal_tiga_besar.json')
    },
  },

  // ─── Simulation History ──────────────────────────────────────────────────────
  simulationHistory: {
    create(data: Omit<SimulationHistory, 'id' | 'created_at'>): SimulationHistory {
      const history = readJSON<SimulationHistory>('simulation_history.json')
      const newEntry: SimulationHistory = {
        id: history.length + 1,
        ...data,
        created_at: new Date().toISOString(),
      }
      history.push(newEntry)
      writeJSON('simulation_history.json', history)
      return newEntry
    },
    findByUser(userId: string): SimulationHistory[] {
      const history = readJSON<SimulationHistory>('simulation_history.json')
      return history.filter((h) => h.user_id === userId)
    },
  },



  // ─── Logs ────────────────────────────────────────────────────────────────
  logs: {
    findAll(): any[] {
      const logs = readJSON<any>('activity_logs.json')
      const users = readJSON<User>('users.json')
      return logs.map((log: any) => ({
        ...log,
        profiles: users.find(u => u.id === log.userId) || { full_name: 'Unknown User' }
      })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    create(userId: string, activity: string): void {
      const logs = readJSON<any>('activity_logs.json')
      logs.push({
        userId,
        activity,
        timestamp: new Date().toISOString()
      })
      writeJSON('activity_logs.json', logs)
    }
  },

  // ─── Online Presence ───────────────────────────────────────────────────────
  presence: {
    ping(userId: string): void {
      const dbPath = require('path').join(process.cwd(), 'src', 'data', 'online_presence.json')
      const fs = require('fs')
      let data: Record<string, string> = {}
      if (fs.existsSync(dbPath)) {
        data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      }
      data[userId] = new Date().toISOString()
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
    },
    getOnlineUsers(): any[] {
      const dbPath = require('path').join(process.cwd(), 'src', 'data', 'online_presence.json')
      const fs = require('fs')
      if (!fs.existsSync(dbPath)) return []
      const data: Record<string, string> = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      const users = readJSON<User>('users.json')
      
      const twoMinsAgo = Date.now() - 2 * 60 * 1000
      return Object.entries(data)
        .filter(([_, time]) => new Date(time).getTime() > twoMinsAgo)
        .map(([id]) => {
          const u = users.find(user => user.id === id)
          return { id, name: u?.full_name || 'User' }
        })
    }
  },

  // ─── Chat ──────────────────────────────────────────────────────────────────
  chat: {
    getMessages(): any[] {
      const messages = readJSON<any>('chat_messages.json')
      return messages.filter((m: any) => !m.to_id) // Only public messages
    },
    getPrivateMessages(userId: string, targetId: string): any[] {
      const messages = readJSON<any>('chat_messages.json')
      return messages.filter((m: any) => 
        (m.from_id === userId && m.to_id === targetId) || 
        (m.from_id === targetId && m.to_id === userId)
      )
    },
    createMessage(fromId: string, fromName: string, message: string, toId: string | null = null): any {
      const messages = readJSON<any>('chat_messages.json')
      const newMsg = {
        id: Date.now().toString(),
        from_id: fromId,
        from_name: fromName,
        to_id: toId,
        message,
        created_at: new Date().toISOString()
      }
      messages.push(newMsg)
      // Simpan hanya 1000 pesan terakhir (bertambah dari 100 untuk histori lebih baik)
      if (messages.length > 1000) {
        messages.shift()
      }
      writeJSON('chat_messages.json', messages)
      return newMsg
    }
  }
}
