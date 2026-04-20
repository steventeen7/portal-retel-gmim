'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ChevronLeft, Send, RotateCcw, Trophy, Info, BookOpen } from 'lucide-react';
import { verifyToken, getCookie } from '@/lib/auth';

type Soal = {
  id: number;
  tahun: number;
  nomor_soal: number;
  teks_soal: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: string;
};

type HasilDetail = {
  jawaban_user: string;
  jawaban_benar: string;
  status: 'benar' | 'salah' | 'kosong';
};

type Hasil = {
  skor: number;
  benar: number;
  salah: number;
  kosong: number;
  total: number;
  detail: Record<string, HasilDetail>;
};

const OPSI = ['a', 'b', 'c', 'd'] as const;
const TAHUN_LIST = [2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025, '2026 - Paket A', '2026 - Paket B', '2026 - Paket C', '2026 - Paket D', '2026 - Paket E', '2026 - Paket F', '2026 - Paket G', '2026 - Paket H', '2026 - Paket I', '2026 - Paket J'];

export default function TesTertulisPage() {
  const [selectedTahun, setSelectedTahun] = useState<number | string | null>(null);
  const [soal, setSoal] = useState<Soal[]>([]);
  const [jawaban, setJawaban] = useState<Record<number, string>>({});
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      const user = verifyToken(token);
      if (user && user.role !== 'admin' && !user.permissions?.includes('tes')) {
        toast.error('Akses Ditolak: Anda tidak memiliki izin untuk modul ini.');
        window.location.href = '/dashboard';
        return;
      }
    }
    if (selectedTahun) {
      loadSoal();
    }
  }, [selectedTahun]);

  async function loadSoal() {
    setLoading(true);
    let fetchedData: Soal[] = [];
    const actualTahun = typeof selectedTahun === 'string'
      ? 2026
      : selectedTahun;

    try {
      const { data, error } = await supabase
        .from('soal_tes')
        .select('*')
        .eq('tahun', actualTahun)
        .order('id');
      
      if (error) throw error;
      fetchedData = data || [];
    } catch (e: any) {
      console.warn('Gagal memuat dari Supabase, menggunakan JSON lokal:', e.message);
      try {
        const fallbackRaw = await import('@/data/soal_tes.json');
        const fallback = (fallbackRaw.default || fallbackRaw) as Soal[];
        fetchedData = fallback.filter((s) => s.tahun === actualTahun);
      } catch (err) {
        toast.error('Gagal memuat soal sama sekali.');
      }
    }

    const paketSlices: Record<string, [number, number]> = {
      '2026 - Paket A': [0, 50],
      '2026 - Paket B': [50, 100],
      '2026 - Paket C': [100, 150],
      '2026 - Paket D': [150, 200],
      '2026 - Paket E': [200, 250],
      '2026 - Paket F': [250, 300],
      '2026 - Paket G': [300, 350],
      '2026 - Paket H': [350, 400],
      '2026 - Paket I': [400, 450],
      '2026 - Paket J': [450, 500],
    };
    if (typeof selectedTahun === 'string' && paketSlices[selectedTahun]) {
      const [start, end] = paketSlices[selectedTahun];
      fetchedData = fetchedData.slice(start, end);
    }

    setSoal(fetchedData);
    setLoading(false);
  }

  function handlePilih(nomor: number, opsi: string) {
    if (hasil) return;
    setJawaban((prev) => ({ ...prev, [nomor]: opsi }));
  }

  function hitungSkor() {
    let benar = 0, salah = 0, kosong = 0;
    const detail: Record<string, HasilDetail> = {};

    soal.forEach(s => {
      const userJawab = jawaban[s.nomor_soal];
      const correct = s.jawaban_benar.toLowerCase();
      
      let status: 'benar' | 'salah' | 'kosong' = 'salah';
      if (!userJawab) {
        status = 'kosong';
        kosong++;
      } else if (userJawab === correct) {
        status = 'benar';
        benar++;
      } else {
        status = 'salah';
        salah++;
      }

      detail[s.nomor_soal] = {
        jawaban_user: userJawab ?? '-',
        jawaban_benar: correct,
        status,
      };
    });

    const skor = (benar * 2) + (salah * -1);
    return { skor, benar, salah, kosong, total: soal.length, detail };
  }

  async function submitTes() {
    setIsSubmitting(true);
    const res = hitungSkor();
    setHasil(res);
    toast.success(`Skor Anda: ${res.skor} poin`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSubmitting(false);
  }

  function handleReset() {
    setHasil(null);
    setJawaban({});
    setSelectedTahun(null);
    setSoal([]);
  }

  const totalJawab = Object.keys(jawaban).length;
  const progress = soal.length > 0 ? (totalJawab / soal.length) * 100 : 0;

  // ─── Tampilan Seleksi Tahun ────────────────────────────────────────────────
  if (!selectedTahun) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">📝 Tes Tertulis</h1>
          <p className="text-gray-600">Pilih tahun soal untuk mulai simulasi ujian Remaja Teladan.</p>
          <div className="mt-3 inline-flex items-center gap-2 badge badge-amber text-[10px]">
            Aturan: Benar (+2), Salah (-1), Kosong (0)
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TAHUN_LIST.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTahun(t)}
              className="group relative bg-white p-6 rounded-3xl border-2 border-purple-50 hover:border-purple-400 transition-all shadow-sm hover:shadow-xl hover:shadow-purple-900/5 overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-purple-50 rounded-full group-hover:scale-[3] transition-transform duration-500" />
              <div className="relative">
                <div className="text-3xl font-black text-purple-600 mb-1">{t}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Tahun Soal</div>
              </div>
            </button>
          ))}
        </div>

        <div className="card bg-purple-50 border-purple-100 p-6 flex items-start gap-4">
          <BookOpen className="w-6 h-6 text-purple-600 shrink-0" />
          <div className="text-sm text-purple-800 leading-relaxed font-medium">
            <strong>Tips:</strong> Luangkan waktu 90 menit tanpa gangguan untuk mensimulasikan kondisi tes yang sebenarnya di tingkat Rayon maupun Sinode.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Memuat Soal dari Supabase...</p>
      </div>
    );
  }

  // ─── Tampilan Hasil ────────────────────────────────────────────────────────
  if (hasil) {
    const isLulus = hasil.skor >= (hasil.total * 1); // Ambang batas lulus
    const grade = isLulus ? { label: 'Bagus Sekali!', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
      : { label: 'Ayo Belajar Lagi', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-20">
        <div className={`card border-2 ${grade.border} ${grade.bg} text-center py-10 shadow-sm rounded-[32px]`}>
          <Trophy className={`w-14 h-14 ${grade.color} mx-auto mb-4`} />
          <div className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Skor Akhir</div>
          <div className={`text-8xl font-black ${grade.color} mb-3 tracking-tighter`}>{hasil.skor}</div>
          <div className="flex justify-center gap-6 text-xs font-black uppercase tracking-wider text-gray-500">
            <div className="flex flex-col"><span className="text-emerald-600 text-xl">{hasil.benar}</span> Benar</div>
            <div className="flex flex-col"><span className="text-red-500 text-xl">{hasil.salah}</span> Salah</div>
            <div className="flex flex-col"><span className="text-gray-400 text-xl">{hasil.kosong}</span> Kosong</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900">🔍 Pembahasan</h2>
          <button onClick={handleReset} className="text-purple-600 text-sm font-black flex items-center gap-1 hover:underline">
            <RotateCcw className="w-4 h-4" /> Ulangi Simulasi
          </button>
        </div>

        <div className="space-y-4">
          {soal.map((s) => {
            const d = hasil.detail[s.nomor_soal];
            return (
              <div key={s.id} className={`card bg-white border-l-4 ${d.status === 'benar' ? 'border-l-emerald-500' : d.status === 'kosong' ? 'border-l-gray-300' : 'border-l-red-500'}`}>
                <div className="flex items-start gap-3 mb-4">
                  {d.status === 'benar' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : d.status === 'kosong' ? <Info className="w-5 h-5 text-gray-400 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  <p className="text-gray-800 font-bold text-sm leading-relaxed">
                    <span className="text-gray-400 mr-2">#{s.nomor_soal}</span>
                    {s.teks_soal}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-8">
                  {OPSI.map((o) => {
                    const key = `opsi_${o}` as keyof Soal;
                    const isCorrect = o === d.jawaban_benar;
                    const isUser = o === d.jawaban_user;
                    
                    let bgClass = 'bg-gray-50 text-gray-500 border-transparent';
                    if (isCorrect) bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (isUser && !isCorrect) bgClass = 'bg-red-50 text-red-700 border-red-200';

                    return (
                      <div key={o} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${bgClass}`}>
                        <span className="font-black uppercase">{o}.</span>
                        <span className="line-clamp-2">{s[key] as string}</span>
                        {isCorrect && <CheckCircle2 className="w-3 h-3 ml-auto shrink-0" />}
                        {isUser && !isCorrect && <XCircle className="w-3 h-3 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Tampilan Form Tes ─────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 sticky top-4 z-20">
        <button onClick={() => setSelectedTahun(null)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="font-black text-gray-900 leading-none">Tes {selectedTahun}</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Supabase Mode</p>
        </div>
        <div className="ml-auto flex items-center gap-4 w-1/3 md:w-1/4">
          <div className="h-2 flex-grow bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-black text-purple-600">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="space-y-6 pb-24">
        {soal.map((s, idx) => (
          <div key={s.id} className="card bg-white animate-fade-in-up shadow-sm border-gray-100 rounded-[24px]" style={{ animationDelay: `${idx * 0.05}s` }}>
            <p className="text-gray-800 font-bold leading-relaxed mb-6 flex gap-4">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center shrink-0 text-sm font-black">
                {s.nomor_soal}
              </span>
              <span>{s.teks_soal}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OPSI.map((opsi) => {
                const key = `opsi_${opsi}` as keyof Soal;
                const isSelected = jawaban[s.nomor_soal] === opsi;
                return (
                  <button
                    key={opsi}
                    onClick={() => handlePilih(s.nomor_soal, opsi)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-sm text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                        : 'border-gray-50 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${isSelected ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'border-gray-300 text-gray-400'}`}>
                      {opsi.toUpperCase()}
                    </span>
                    <span className={isSelected ? 'font-black' : 'font-medium'}>{s[key] as string}</span>
                  </button>
                );
              })}
            </div>
            {jawaban[s.nomor_soal] && (
              <button 
                onClick={() => {
                  const newJ = { ...jawaban };
                  delete newJ[s.nomor_soal];
                  setJawaban(newJ);
                }}
                className="text-[10px] font-black text-gray-400 mt-5 hover:text-red-500 uppercase tracking-[0.2em] pl-12"
              >
                Hapus Jawaban
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-30">
        <button
          onClick={submitTes}
          disabled={isSubmitting || soal.length === 0}
          className="btn-primary w-full py-5 text-base shadow-2xl shadow-purple-900/40 active:scale-[0.98] font-black tracking-widest uppercase"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Selesai & Hitung Skor ({totalJawab}/{soal.length})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
