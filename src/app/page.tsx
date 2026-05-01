'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Users, ClipboardList, Mic, Star, BookOpen, ChevronRight } from 'lucide-react';

export default function Home() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const res = await fetch('/api/ranking');
        const json = await res.json();
        setRanking(json.data || []);
      } catch (e) {
        console.error('Gagal fetch ranking');
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-16 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-[48px] overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white p-8 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
           <Trophy className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest mb-6">
             <Star className="w-3.5 h-3.5 text-amber-400" /> Edisi Pelayanan 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Persiapan <span className="text-amber-400">Remaja Teladan</span> GMIM
          </h1>
          <p className="text-lg md:text-xl text-purple-100 font-medium leading-relaxed mb-10">
            Platform latihan mandiri untuk membantu calon Remaja Teladan menguasai materi, 
            mengasah mental wawancara, dan mempersiapkan diri untuk babak final.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/register" className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-purple-50 transition-all shadow-xl shadow-purple-900/20 active:scale-95">
               Daftar Sekarang
            </Link>
            <Link href="/auth/login" className="px-8 py-4 bg-purple-800/50 text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-purple-800 transition-all active:scale-95">
               Masuk Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Ranking Nasional Section */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">🏆 Ranking Nasional Tes Tertulis</h2>
          <p className="text-gray-500 font-medium">Top 20 Nilai Tertinggi dari seluruh Rayon 2026 (Live NEVOS)</p>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden max-w-4xl mx-auto">
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Mengambil Data Terbaru...</p>
            </div>
          ) : ranking.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Peserta</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Jemaat / Rayon</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ranking.map((p, i) => (
                    <tr key={i} className={`hover:bg-purple-50/30 transition-colors ${i < 3 ? 'bg-amber-50/10' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-900">
                          {i + 1 === 1 ? <Medal className="w-5 h-5 text-yellow-500" /> : 
                           i + 1 === 2 ? <Medal className="w-5 h-5 text-slate-400" /> :
                           i + 1 === 3 ? <Medal className="w-5 h-5 text-amber-600" /> : 
                           i + 1}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-black text-gray-900 text-sm">{p.name}</div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-lg text-[9px] font-bold text-gray-400 uppercase mt-1">
                           <Users className="w-3 h-3" /> {p.event.replace('Pemilihan Remaja Teladan ', '')}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xs font-bold text-gray-700">{p.jemaat}</div>
                        <div className="text-[10px] font-black text-purple-500 uppercase mt-0.5 tracking-wider">{p.rayon}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-2xl font-black text-gray-900">{p.score}</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase">Poin</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-24 text-center">
               <Trophy className="w-16 h-16 text-gray-100 mx-auto mb-4" />
               <p className="text-gray-400 font-bold">Data ranking belum dipublikasikan di NEVOS.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            href: "/latihan/tes",
            icon: <ClipboardList className="w-8 h-8 text-blue-600" />,
            title: "Tes Tertulis",
            desc: "Latihan soal tahun 2014-2026 dengan sistem penilaian akurat.",
            color: "border-blue-100 hover:border-blue-400"
          },
          {
            href: "/latihan/wawancara",
            icon: <Mic className="w-8 h-8 text-amber-600" />,
            title: "Simulasi Wawancara",
            desc: "7 kategori materi wawancara dengan feedback AI.",
            color: "border-amber-100 hover:border-amber-400"
          },
          {
            href: "/belajar",
            icon: <BookOpen className="w-8 h-8 text-emerald-600" />,
            title: "Materi Belajar",
            desc: "Bank materi Alkitab, Tata Gereja, dan Pengetahuan Umum.",
            color: "border-emerald-100 hover:border-emerald-400"
          }
        ].map((feat, i) => (
          <Link key={i} href={feat.href} className={`bg-white p-8 rounded-[32px] border-2 ${feat.color} shadow-sm hover:shadow-xl transition-all group`}>
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
               {feat.icon}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{feat.title}</h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">{feat.desc}</p>
            <div className="flex items-center text-xs font-black text-purple-600 uppercase tracking-widest">
              Pelajari <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
