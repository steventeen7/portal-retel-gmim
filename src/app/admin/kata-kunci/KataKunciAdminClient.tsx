'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Key, Plus, Save, Trash2, Edit3, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type KataKunci = {
  id: number;
  kata: string;
  materi: string;
  jawaban: string;
  penjelasan: string;
};

export default function KataKunciAdminClient({ initialData }: { initialData: KataKunci[] }) {
  const router = useRouter();
  const [dataList, setDataList] = useState<KataKunci[]>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    kata: '',
    materi: 'Pengetahuan Alkitab',
    jawaban: '',
    penjelasan: ''
  });

  const materis = ['Pengetahuan Alkitab', 'Sejarah GMIM', 'Ajaran Gereja', 'Keremajaan', 'Pengetahuan Umum'];

  const resetForm = () => {
    setForm({ kata: '', materi: 'Pengetahuan Alkitab', jawaban: '', penjelasan: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (d: KataKunci) => {
    setForm({ 
      kata: d.kata,
      materi: d.materi || 'Pengetahuan Alkitab', 
      jawaban: d.jawaban || '', 
      penjelasan: d.penjelasan || '' 
    });
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kata kunci ini?')) return;
    try {
      const res = await fetch('/api/admin/kata-kunci', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Kata kunci dihapus!');
      setDataList(prev => prev.filter(d => d.id !== id));
      router.refresh();
    } catch {
      toast.error('Gagal hapus kata kunci.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = { ...form, id: editingId };
      const res = await fetch('/api/admin/kata-kunci', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const { data, error } = await res.json();
      if (error) throw new Error(error);

      if (editingId) {
        setDataList(prev => prev.map(d => d.id === editingId ? data : d));
        toast.success('Kata Kunci diperbarui!');
      } else {
        setDataList(prev => [...prev, data]);
        toast.success('Kata Kunci ditambahkan!');
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
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between bg-white p-8 rounded-[32px] shadow-sm border border-purple-50">
        <div className="flex items-center gap-4">
           <Link href="/admin" className="p-3 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors">
              <ArrowLeft className="w-6 h-6" />
           </Link>
           <div>
             <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
               <Key className="w-8 h-8 text-purple-600" />
               Kata Kunci
             </h1>
             <p className="text-gray-500 font-medium">Kelola tebakan kata kunci dan penjelasan AI.</p>
           </div>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary py-3 px-6 h-auto text-sm shadow-xl shadow-purple-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Kata Kunci
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataList.map(d => (
          <div key={d.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col gap-4 group hover:border-purple-200 transition-colors">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black px-3 py-1 bg-purple-50 text-purple-600 rounded-full uppercase tracking-widest">{d.materi}</span>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleEdit(d)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Edit3 className="w-4 h-4" /></button>
                 <button onClick={() => handleDelete(d.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>
            
            <div className="bg-gray-900 text-white rounded-2xl p-6 text-center shadow-inner mt-2">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tebakan Utama</div>
               <h3 className="text-xl font-black">{d.kata}</h3>
            </div>

            <div className="space-y-2 mt-2">
               <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Expected Answer</div>
                  <p className="text-sm text-emerald-800 font-medium">{d.jawaban || '-'}</p>
               </div>
               {d.penjelasan && (
                 <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Penjelasan AI</div>
                    <p className="text-sm text-amber-800 font-medium line-clamp-2">{d.penjelasan}</p>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[32px] shadow-2xl animate-scale-in">
            <div className="sticky top-0 z-10 bg-purple-600 px-8 py-6 flex items-center justify-between text-white shadow-md">
              <h3 className="text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Kata Kunci' : 'Buat Kata Kunci'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-xl"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Kata Kunci (Huruf Kapital)</label>
                   <input 
                     required type="text"
                     className="w-full bg-gray-900 border-2 border-gray-800 text-white rounded-2xl p-4 font-black uppercase tracking-widest outline-none focus:border-purple-500" 
                     value={form.kata} onChange={e => setForm({...form, kata: e.target.value.toUpperCase()})}
                     placeholder="CONTOH"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Kategori Materi</label>
                   <select 
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                     value={form.materi} onChange={e => setForm({...form, materi: e.target.value})}
                   >
                     {materis.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Jawaban</label>
                <textarea 
                  required 
                  className="w-full h-24 bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 font-medium text-sm text-emerald-800 outline-none focus:border-emerald-500" 
                  value={form.jawaban} onChange={e => setForm({...form, jawaban: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Penjelasan AI</label>
                <textarea 
                  className="w-full h-24 bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 font-medium text-sm text-amber-800 outline-none focus:border-amber-500" 
                  value={form.penjelasan} onChange={e => setForm({...form, penjelasan: e.target.value})}
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingId ? 'Simpan Perubahan' : 'Tambah Modul Kata'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
