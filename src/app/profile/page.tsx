'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Building2, Save, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    jemaat: '',
    wilayah: '',
    rayon: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const profile = data.user;
        if (!profile) return;
        
        setUser(profile);
        setFormData({
          full_name: profile.full_name || '',
          jemaat: profile.jemaat || '',
          wilayah: profile.wilayah || '',
          rayon: profile.rayon || '',
          phone: profile.phone || '',
        });
      } else {
        router.push('/auth/login');
      }
    } catch (err) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
        }),
      });

      if (res.ok) {
        toast.success('Profil berhasil diperbarui');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal memperbarui profil');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Memuat Profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in-up">
      <button 
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors font-bold text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-purple-900/5 border border-purple-100 overflow-hidden">
        {/* Header Profile */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black mb-1">{user.full_name}</h1>
              <p className="text-purple-100 text-sm font-medium opacity-80 uppercase tracking-widest">
                {user.role === 'admin' ? 'Administrator' : 'Peserta REMAJA TELADAN'}
              </p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                 <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-tighter border border-white/10">{user.email}</span>
                 {user.is_approved && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-500/30">Terverifikasi</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Nama Lengkap
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="Masukkan nama lengkap..."
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3 h-3" /> Nomor WhatsApp
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Jemaat */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Jemaat
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="Nama Jemaat..."
                value={formData.jemaat}
                onChange={(e) => setFormData({ ...formData, jemaat: e.target.value })}
              />
            </div>

            {/* Wilayah */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Wilayah
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="Nama Wilayah..."
                value={formData.wilayah}
                onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
              />
            </div>

            {/* Rayon */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Rayon
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="Nama Rayon..."
                value={formData.rayon}
                onChange={(e) => setFormData({ ...formData, rayon: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary min-w-[200px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> 
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
         Akun dibuat pada: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}
