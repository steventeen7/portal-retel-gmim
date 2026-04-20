'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, Mail, BookOpen, Cross, History, Save, ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { getCookie, verifyToken } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    jemaat: '',
    wilayah: '',
    rayon: '',
    phone: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const payload = await verifyToken(token);
      if (!payload) {
        router.push('/auth/login');
        return;
      }

      const res = await fetch(`/api/user/profile?userId=${payload.id}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setForm({
          full_name: data.user.full_name || '',
          email: data.user.email || '',
          jemaat: data.user.jemaat || '',
          wilayah: data.user.wilayah || '',
          rayon: data.user.rayon || '',
          phone: data.user.phone || ''
        });
      }
    } catch (err) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...form
        }),
      });
      
      if (!res.ok) throw new Error('Update gagal');
      toast.success('Profil berhasil diperbarui!');
      // Update local storage/cookie info if needed, or just let them see it
    } catch (err) {
      toast.error('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
       </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-purple-600 font-black uppercase text-[10px] tracking-widest mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-purple-900/5 border border-purple-50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-10 py-12 text-white relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
           <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black shadow-xl">
                 {user?.full_name?.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                 <h1 className="text-3xl font-black tracking-tight">{user?.full_name}</h1>
                 <p className="opacity-80 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Mail className="w-4 h-4" /> {user?.email}
                 </p>
                 <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{user?.role}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.is_approved ? 'bg-emerald-400/30' : 'bg-amber-400/30'}`}>
                       {user?.is_approved ? 'Aktif / Approved' : 'Pending Activation'}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-10 md:p-12 bg-white">
           <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-purple-600 rounded-full" />
              Edit Data Diri
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                       type="text" 
                       required
                       className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all"
                       value={form.full_name}
                       onChange={(e) => setForm({...form, full_name: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2 opacity-60">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email (Unchangeable)</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                       type="email" 
                       readOnly
                       className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 cursor-not-allowed"
                       value={form.email}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Jemaat</label>
                 <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                       type="text" 
                       required
                       className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all"
                       value={form.jemaat}
                       onChange={(e) => setForm({...form, jemaat: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Wilayah</label>
                 <div className="relative">
                    <Cross className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                       type="text" 
                       required
                       className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all"
                       value={form.wilayah}
                       onChange={(e) => setForm({...form, wilayah: e.target.value})}
                    />
                 </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Rayon</label>
                 <div className="relative">
                    <History className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                       type="text" 
                       required
                       className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all"
                       value={form.rayon}
                       onChange={(e) => setForm({...form, rayon: e.target.value})}
                    />
                 </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nomor WhatsApp</label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r pr-2 border-gray-200 text-sm">
                       WA
                    </span>
                    <input 
                       type="text" 
                       required
                       className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all"
                       value={form.phone}
                       placeholder="0852..."
                       onChange={(e) => setForm({...form, phone: e.target.value})}
                    />
                 </div>
              </div>

              <div className="md:col-span-2 pt-6">
                 <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-5 bg-purple-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-purple-500/30 hover:bg-purple-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Simpan Perubahan Profil
                 </button>
              </div>

              <div className="md:col-span-2 flex items-center gap-4 bg-amber-50 p-6 rounded-3xl border border-amber-100 mt-4">
                 <Shield className="w-8 h-8 text-amber-500 shrink-0" />
                 <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed tracking-wider">
                    Beberapa data administratif (seperti izin modul dan status aktivasi) hanya dapat diubah oleh Administrator melalui Panel Admin.
                 </p>
              </div>
           </div>
        </form>
      </div>
    </div>
  );
}
