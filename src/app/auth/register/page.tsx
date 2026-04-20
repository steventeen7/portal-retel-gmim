'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Eye, EyeOff, Cross, UserPlus, BookOpen, History, Phone } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    confirm: '',
    jemaat: '',
    wilayah: '',
    rayon: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Konfirmasi password tidak cocok.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: form.email, 
          password: form.password, 
          full_name: form.full_name,
          jemaat: form.jemaat,
          wilayah: form.wilayah,
          rayon: form.rayon,
          phone: form.phone
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Registrasi gagal.')
      } else {
        const waMsg = `Syalom%20Kak,%20Saya%20${form.full_name}%20dari%20Jemaat%20${form.jemaat}.%20Tolong%20diaktivasi%20untuk%20tesnya`;
        const waLink = `https://wa.me/6285256510571?text=${waMsg}`;
        
        toast.success(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-gray-900">Pendaftaran Berhasil!</span>
              <p className="text-xs text-gray-500">Aktivasi akun Anda sekarang dengan menghubungi Admin di WhatsApp.</p>
              <a 
                href={waLink}
                target="_blank"
                onClick={() => toast.dismiss(t.id)}
                className="mt-2 text-center py-2 bg-[#25D366] text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20"
              >
                Klik untuk Aktivasi WA
              </a>
            </div>
          ),
          { duration: 10000 }
        );
        router.push('/auth/login')
      }
    } catch {
      toast.error('Koneksi gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gray-50">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative w-full max-w-xl animate-fade-in-up">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-purple-900/10 border border-purple-50">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/30 mb-5 group">
              <Cross className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Halaman Pendaftaran</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Lengkapi data untuk diverifikasi oleh Admin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="Nama Lengkap"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Jemaat */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Jemaat</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="Contoh: Getsemani"
                    value={form.jemaat}
                    onChange={(e) => setForm({ ...form, jemaat: e.target.value })}
                  />
                </div>
              </div>

              {/* Wilayah */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Wilayah</label>
                <div className="relative">
                  <Cross className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="Contoh: Manado Utara"
                    value={form.wilayah}
                    onChange={(e) => setForm({ ...form, wilayah: e.target.value })}
                  />
                </div>
              </div>

              {/* Rayon */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Rayon</label>
                <div className="relative">
                  <History className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="Contoh: Manado"
                    value={form.rayon}
                    onChange={(e) => setForm({ ...form, rayon: e.target.value })}
                  />
                </div>
              </div>

              {/* No WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Nomor WA</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="0852..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input pl-11 pr-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="Min. 6 Karakter"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Konfirmasi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input pl-11 bg-gray-50/50 border-gray-100 h-12 text-sm font-medium"
                    placeholder="Ulangi password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-register"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-purple-500/20 active:scale-[0.98] mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-gray-400 mt-10 uppercase tracking-[0.2em]">
          © PORTAL RETEL GMIM
        </p>
      </div>
    </div>
  )
}
