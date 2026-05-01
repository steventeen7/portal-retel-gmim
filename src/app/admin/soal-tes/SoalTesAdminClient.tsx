'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  ClipboardList, Plus, Save, Trash2, Edit3, XCircle, RefreshCw, 
  ArrowLeft, ToggleLeft, ToggleRight, Power, Layers, Search
} from 'lucide-react';
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
  paket: string;
};

type PaketAktif = {
  id: number;
  tahun: number;
  paket: string;
  label: string;
  is_active: boolean;
};

export default function SoalTesAdminClient({ initialSoal }: { initialSoal: SoalTes[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'soal' | 'paket'>('paket');
  const [soalList, setSoalList] = useState<SoalTes[]>(initialSoal);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterTahun, setFilterTahun] = useState<number | ''>('');
  const [filterSearch, setFilterSearch] = useState('');

  // Paket state
  const [paketList, setPaketList] = useState<PaketAktif[]>([]);
  const [paketLoading, setPaketLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    tahun: 2026,
    nomor_soal: 1,
    teks_soal: '',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    jawaban_benar: 'a',
    tipe_soal: 'pilihan_ganda',
    paket: 'A'
  });

  useEffect(() => {
    fetchPaket();
  }, []);

  async function fetchPaket() {
    setPaketLoading(true);
    try {
      const res = await fetch('/api/admin/paket-aktif');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPaketList(json.data || []);
    } catch (err: any) {
      toast.error('Gagal memuat paket: ' + err.message);
    } finally {
      setPaketLoading(false);
    }
  }

  async function syncPaket() {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/paket-aktif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPaketList(json.data || []);
      toast.success(`Sync berhasil! ${json.synced} paket baru ditambahkan.`);
    } catch (err: any) {
      toast.error('Gagal sync: ' + err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function togglePaket(paket: PaketAktif) {
    setTogglingId(paket.id);
    try {
      const newStatus = !paket.is_active;
      const res = await fetch('/api/admin/paket-aktif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', tahun: paket.tahun, label: paket.label, is_active: newStatus }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPaketList(prev => prev.map(p => (p.tahun === paket.tahun && p.paket === paket.paket) ? { ...p, is_active: newStatus } : p));
      toast.success(`Paket "${paket.label}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`);
    } catch (err: any) {
      toast.error('Gagal mengubah status: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  }

  const resetForm = () => {
    setForm({ tahun: 2026, nomor_soal: 1, teks_soal: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', jawaban_benar: 'a', tipe_soal: 'pilihan_ganda', paket: 'A' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (s: SoalTes) => {
    setForm({ tahun: s.tahun, nomor_soal: s.nomor_soal, teks_soal: s.teks_soal || '', opsi_a: s.opsi_a || '', opsi_b: s.opsi_b || '', opsi_c: s.opsi_c || '', opsi_d: s.opsi_d || '', jawaban_benar: s.jawaban_benar, tipe_soal: s.tipe_soal || 'pilihan_ganda', paket: s.paket || 'A' });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      const res = await fetch('/api/admin/soal-tes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Soal dihapus!');
      setSoalList(prev => prev.filter(s => s.id !== id));
      router.refresh();
    } catch { toast.error('Gagal hapus soal.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = { ...form, id: editingId };
      const res = await fetch('/api/admin/soal-tes', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
    } finally { setLoading(false); }
  };

  const uniqueYears = Array.from(new Set(soalList.map(s => s.tahun))).sort((a,b) => b - a);
  const filteredSoal = soalList.filter(s => {
    const matchTahun = filterTahun ? s.tahun === filterTahun : true;
    const matchSearch = filterSearch ? s.teks_soal.toLowerCase().includes(filterSearch.toLowerCase()) : true;
    return matchTahun && matchSearch;
  });

  const activePaketCount = paketList.filter(p => p.is_active).length;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
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
            <p className="text-gray-500 font-medium">Kelola soal dan atur paket aktif untuk peserta.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('paket')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'paket' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Power className="w-4 h-4" /> Kelola Paket ({activePaketCount} aktif)
        </button>
        <button
          onClick={() => setActiveTab('soal')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'soal' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Layers className="w-4 h-4" /> Bank Soal ({soalList.length} soal)
        </button>
      </div>

      {/* === TAB: KELOLA PAKET === */}
      {activeTab === 'paket' && (
        <div className="space-y-6">
          {/* Info & Sync Button */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-amber-900 mb-1">Kontrol Paket yang Tersedia untuk Peserta</h3>
              <p className="text-amber-700 text-sm font-medium">
                Paket yang <strong>dinonaktifkan</strong> tidak akan muncul di halaman Latihan Tes Tertulis peserta.
                Gunakan tombol "Sync" untuk menyinkronkan paket dari bank soal.
              </p>
            </div>
            <button
              onClick={syncPaket}
              disabled={syncing}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-amber-700 transition-all shrink-0 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              Sync dari Bank Soal
            </button>
          </div>

          {/* Paket Grid */}
          {paketLoading ? (
            <div className="text-center py-20">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Memuat daftar paket...</p>
            </div>
          ) : paketList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Power className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold mb-4">Belum ada paket. Klik "Sync" untuk mengambil dari bank soal.</p>
              <button onClick={syncPaket} disabled={syncing} className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-purple-700 transition-all">
                Sync Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paketList.map(paket => {
                const soalCount = soalList.filter(s => s.tahun === paket.tahun && (s.paket || 'A') === (paket.paket || 'A')).length;
                return (
                  <div
                    key={paket.id}
                    className={`relative bg-white rounded-[24px] p-6 border-2 transition-all shadow-sm ${
                      paket.is_active 
                        ? 'border-emerald-200 shadow-emerald-900/5' 
                        : 'border-gray-100 opacity-60'
                    }`}
                  >
                    {/* Status badge */}
                    <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      paket.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>
                      {paket.is_active ? '● Aktif' : '○ Nonaktif'}
                    </div>

                    <div className="mb-4 pr-20">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${paket.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-gray-900 text-base leading-tight">{paket.label}</h3>
                      <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
                        {soalCount > 0 ? `${soalCount} soal` : 'Belum ada soal'}
                      </p>
                    </div>

                    <button
                      onClick={() => togglePaket(paket)}
                      disabled={togglingId === paket.id}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        paket.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                      }`}
                    >
                      {togglingId === paket.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : paket.is_active ? (
                        <><ToggleRight className="w-4 h-4" /> Nonaktifkan</>
                      ) : (
                        <><ToggleLeft className="w-4 h-4" /> Aktifkan</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === TAB: BANK SOAL === */}
      {activeTab === 'soal' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari teks soal..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl font-medium text-gray-700 outline-none focus:border-purple-400"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
              />
            </div>
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

          <div className="grid grid-cols-1 gap-4">
            {filteredSoal.map(s => (
              <div key={s.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 group hover:border-purple-200 transition-colors">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black px-3 py-1 bg-purple-50 text-purple-600 rounded-full uppercase tracking-widest">Tahun {s.tahun}</span>
                    <span className="text-[10px] font-black px-3 py-1 bg-amber-50 text-amber-600 rounded-full uppercase tracking-widest">Paket {s.paket || 'A'}</span>
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
              <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">Kosong / Tidak ada soal yang cocok</div>
            )}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[32px] shadow-2xl animate-scale-in">
            <div className="sticky top-0 z-10 bg-purple-600 px-8 py-6 flex items-center justify-between text-white shadow-md">
              <h3 className="text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Soal' : 'Buat Soal Baru'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-xl"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tahun</label>
                  <input type="number" required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" value={form.tahun} onChange={e => setForm({...form, tahun: Number(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Paket</label>
                  <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" value={form.paket} onChange={e => setForm({...form, paket: e.target.value})}>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(p => <option key={p} value={p}>Paket {p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nomor Soal</label>
                  <input type="number" required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-purple-500" value={form.nomor_soal} onChange={e => setForm({...form, nomor_soal: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Teks Pertanyaan</label>
                <textarea required className="w-full h-32 bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-medium text-sm text-gray-700 outline-none focus:border-purple-500" value={form.teks_soal} onChange={e => setForm({...form, teks_soal: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                {['a','b','c','d'].map(o => (
                  <div key={o} className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Opsi {o.toUpperCase()}</label>
                    <input required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-purple-500"
                      value={(form as any)[`opsi_${o}`]} onChange={e => setForm({...form, [`opsi_${o}`]: e.target.value})} />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jawaban Benar</label>
                <select className="w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-700 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 uppercase" value={form.jawaban_benar} onChange={e => setForm({...form, jawaban_benar: e.target.value})}>
                  <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
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
