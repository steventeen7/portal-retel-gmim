'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Save, Trash2, Edit3, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Materi = {
  id: number;
  judul: string;
  kategori: string;
  konten: string;
};

export default function MateriAdminClient({ initialMateri }: { initialMateri: Materi[] }) {
  const router = useRouter();
  const [materiList, setMateriList] = useState<Materi[]>(initialMateri);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    judul: '',
    kategori: 'Sejarah GMIM',
    konten: ''
  });

  const categories = [
    'Sejarah GMIM', 'Dogmatika', 'Pola Baku', 'Alkitab', "Pengetahuan Umum", "Bahasa Inggris"
  ];

  const resetForm = () => {
    setForm({ judul: '', kategori: 'Sejarah GMIM', konten: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (m: Materi) => {
    setForm({ judul: m.judul, kategori: m.kategori, konten: m.konten });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus materi ini?')) return;
    try {
      const res = await fetch('/api/admin/materi', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Materi dihapus!');
      setMateriList(prev => prev.filter(m => m.id !== id));
      router.refresh();
    } catch {
      toast.error('Gagal hapus materi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = { ...form, id: editingId };
      const res = await fetch('/api/admin/materi', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const { data, error } = await res.json();
      if (error) throw new Error(error);

      if (editingId) {
        setMateriList(prev => prev.map(m => m.id === editingId ? data : m));
        toast.success('Materi diperbarui!');
      } else {
        setMateriList(prev => [...prev, data]);
        toast.success('Materi ditambahkan!');
      }
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between bg-white p-8 rounded-[32px] shadow-sm border border-purple-50">
        <div className="flex items-center gap-4">
           <Link href="/admin" className="p-3 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors">
              <ArrowLeft className="w-6 h-6" />
           </Link>
           <div>
             <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
               <BookOpen className="w-8 h-8 text-purple-600" />
               Kelola Materi Belajar
             </h1>
             <p className="text-gray-500 font-medium">Buat dan edit panduan materi untuk peserta.</p>
           </div>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary py-3 px-6 h-auto text-sm shadow-xl shadow-purple-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Materi Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materiList.map(m => (
          <div key={m.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-purple-900/5 group hover:border-purple-200 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <span className="text-[10px] font-black px-3 py-1 bg-purple-50 text-purple-600 rounded-full uppercase tracking-widest">{m.kategori}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(m)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-900 leading-snug">{m.judul}</h3>
            <p className="text-gray-500 text-sm mt-2 line-clamp-3 leading-relaxed">{m.konten}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-purple-600 px-8 py-6 flex items-center justify-between text-white">
              <h3 className="text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Materi' : 'Buat Materi Baru'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-xl"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Judul Materi</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                    placeholder="Contoh: Sejarah Singkat GMIM"
                    value={form.judul}
                    onChange={(e) => setForm({...form, judul: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Kategori</label>
                  <select 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                    value={form.kategori}
                    onChange={(e) => setForm({...form, kategori: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Konten (Markdown Supported)</label>
                <textarea 
                  required 
                  className="w-full h-64 bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-medium text-sm text-gray-700 outline-none focus:border-purple-500" 
                  placeholder="Gunakan markdown untuk format text...&#10;## Subheading&#10;- Poin 1&#10;- Poin 2"
                  value={form.konten}
                  onChange={(e) => setForm({...form, konten: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingId ? 'Simpan Perubahan' : 'Terbitkan Materi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
