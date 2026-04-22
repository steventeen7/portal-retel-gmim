'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ClipboardList, Plus, Save, Trash2, Edit3, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SoalTes = {
  id: number;
  tahun: number;
  nomor_soal: number;
  teks_soal: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: string;
  tipe_soal: string;
};

export default function SoalTesAdminClient({ initialSoal }: { initialSoal: SoalTes[] }) {
  const router = useRouter();
  const [soalList, setSoalList] = useState<SoalTes[]>(initialSoal);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterTahun, setFilterTahun] = useState<number | ''>('');
  
  const [form, setForm] = useState({
    tahun: 2026,
    nomor_soal: 1,
    teks_soal: '',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    jawaban_benar: 'a',
    tipe_soal: 'pilihan_ganda'
  });

  const resetForm = () => {
    setForm({ tahun: 2026, nomor_soal: 1, teks_soal: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', jawaban_benar: 'a', tipe_soal: 'pilihan_ganda' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (s: SoalTes) => {
    setForm({ 
      tahun: s.tahun, 
      nomor_soal: s.nomor_soal, 
      teks_soal: s.teks_soal || '', 
      opsi_a: s.opsi_a || '', 
      opsi_b: s.opsi_b || '', 
      opsi_c: s.opsi_c || '', 
      opsi_d: s.opsi_d || '', 
      jawaban_benar: s.jawaban_benar, 
      tipe_soal: s.tipe_soal || 'pilihan_ganda' 
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      const res = await fetch('/api/admin/soal-tes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Soal dihapus!');
      setSoalList(prev => prev.filter(s => s.id !== id));
      router.refresh();
    } catch {
      toast.error('Gagal hapus soal.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = { ...form, id: editingId };
      const res = await fetch('/api/admin/soal-tes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const { data, error } = await res.json();
      if (error) throw new Error(error);

      if (editingId) {
        setSoalList(prev => prev.map(s => s.id === editingId ? data : s));
        toast.success('Soal diperbarui!');
      } else {
        setSoalList(prev => [data, ...prev].sort((a,b) => b.tahun - a.tahun || a.nomor_soal - b.nomor_soal));
        toast.success('Soal ditambahkan!');
      }
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const filteredSoal = filterTahun ? soalList.filter(s => s.tahun === filterTahun) : soalList;
  const uniqueYears = Array.from(new Set(soalList.map(s => s.tahun))).sort((a,b) => b - a);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between bg-white p-8 rounded-[32px] shadow-sm border border-purple-50">
        <div className="flex items-center gap-4">
           <Link href="/admin" className="p-3 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors">
              <ArrowLeft className="w-6 h-6" />
           </Link>
           <div>
             <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
               <ClipboardList className="w-8 h-8 text-purple-600" />
               Bank Soal Tes Tertulis
             </h1>
             <p className="text-gray-500 font-medium">Kelola soal untuk modul Tes Tertulis.</p>
           </div>
        </div>
        <div className="flex gap-4">
          <select 
             className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-700 outline-none"
             value={filterTahun}
             onChange={e => setFilterTahun(e.target.value ? Number(e.target.value) : '')}
          >
             <option value="">Semua Tahun</option>
             {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary py-3 px-6 h-auto text-sm shadow-xl shadow-purple-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Tambah Soal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSoal.map(s => (
          <div key={s.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 group hover:border-purple-200 transition-colors">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black px-3 py-1 bg-purple-50 text-purple-600 rounded-full uppercase tracking-widest">Tahun {s.tahun}</span>
                <span className="text-[10px] font-black px-3 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-widest">No. {s.nomor_soal}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{s.teks_soal}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                 <div className={`p-2 rounded-xl border ${s.jawaban_benar.toLowerCase() === 'a' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>A. {s.opsi_a}</div>
                 <div className={`p-2 rounded-xl border ${s.jawaban_benar.toLowerCase() === 'b' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>B. {s.opsi_b}</div>
                 <div className={`p-2 rounded-xl border ${s.jawaban_benar.toLowerCase() === 'c' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>C. {s.opsi_c}</div>
                 <div className={`p-2 rounded-xl border ${s.jawaban_benar.toLowerCase() === 'd' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>D. {s.opsi_d}</div>
              </div>
            </div>
            <div className="flex justify-end items-start gap-2">
              <button onClick={() => handleEdit(s)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"><Edit3 className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(s.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
        {filteredSoal.length === 0 && (
          <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">Kosong</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[32px] shadow-2xl animate-scale-in">
            <div className="sticky top-0 z-10 bg-purple-600 px-8 py-6 flex items-center justify-between text-white shadow-md">
              <h3 className="text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Soal' : 'Buat Soal Baru'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-xl"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tahun/Paket</label>
                  <input 
                    type="number" required 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                    value={form.tahun} onChange={e => setForm({...form, tahun: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nomor Soal</label>
                  <input 
                    type="number" required 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" 
                    value={form.nomor_soal} onChange={e => setForm({...form, nomor_soal: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Teks Pertanyaan</label>
                <textarea 
                  required 
                  className="w-full h-32 bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-medium text-sm text-gray-700 outline-none focus:border-purple-500" 
                  value={form.teks_soal} onChange={e => setForm({...form, teks_soal: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Opsi A</label>
                   <input required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-purple-500" 
                     value={form.opsi_a} onChange={e => setForm({...form, opsi_a: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Opsi B</label>
                   <input required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-purple-500" 
                     value={form.opsi_b} onChange={e => setForm({...form, opsi_b: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Opsi C</label>
                   <input required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-purple-500" 
                     value={form.opsi_c} onChange={e => setForm({...form, opsi_c: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Opsi D</label>
                   <input required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-purple-500" 
                     value={form.opsi_d} onChange={e => setForm({...form, opsi_d: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jawaban Benar</label>
                 <select 
                   className="w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-700 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 uppercase"
                   value={form.jawaban_benar} onChange={e => setForm({...form, jawaban_benar: e.target.value})}
                 >
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                 </select>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingId ? 'Simpan Perubahan' : 'Tambah Soal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
