'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ClipboardList, BookOpen, Mic, Trophy, ArrowRight, TrendingUp, 
  Lock, MessageCircle, Star, BarChart3, Package
} from 'lucide-react';

function formatPaketLabel(tahun: number): string {
  if (tahun === 2091) return 'Rangkuman 1 (2019-2025)';
  if (tahun === 2092) return 'Rangkuman 2 (2019-2025)';
  if (tahun === 2093) return 'Rangkuman 3 (2019-2025)';
  return `Paket Tahun ${tahun}`;
}

type DashboardProps = {
  user: any;
  riwayat: any[];
  avgSkor: number | null;
  bestSkor: number | null;
  tahunList: any[];
  soalCount: number;
  wawancaraCount: number;
  materiCount: number;
  nilaiTertulis: any[];
};

export default function DashboardClient({ 
  user, riwayat, avgSkor, bestSkor, tahunList, soalCount, wawancaraCount, materiCount, nilaiTertulis 
}: DashboardProps) {
  const searchParams = useSearchParams();
  const [showDenied, setShowDenied] = useState(false);
  const [deniedModule, setDeniedModule] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized' || error === 'no-permission') {
      setShowDenied(true);
      const mod = searchParams.get('module') || 'Modul';
      const labels: Record<string, string> = {
        'tes': 'Tes Tertulis',
        'wawancara': 'Wawancara',
        'keyword': 'Kata Kunci',
        'tiga-besar': '3 Besar'
      };
      setDeniedModule(labels[mod] || mod);
    } else if (error === 'pending') {
      setShowDenied(true);
      setDeniedModule('Penuh');
    }
  }, [searchParams]);

  const isPending = user && user.is_approved === false && user.role !== 'admin';
  const waNumber = "6285256510571";
  const waLink = `https://wa.me/${waNumber}?text=Syalom%20Kak,%20Saya%20ingin%20meminta%20izin%20akses%20untuk%20modul%20${deniedModule}%20di%20Portal%20RETEL.%20Terima%20kasih.`;
  const waActivationLink = `https://wa.me/${waNumber}?text=Syalom%20Kak,%20Saya%20${user?.full_name}%20dari%20Jemaat%20${user?.jemaat}.%20Tolong%20diaktivasi%20akun%20saya%20untuk%20persiapan%20tes.`;

  const menuItems = [
    {
      href: '/latihan/tes',
      icon: <ClipboardList className="w-8 h-8" />,
      title: 'Latihan Tes Tertulis',
      desc: `${soalCount} soal tersedia — jawab, kirim, dan lihat koreksi otomatis`,
      color: 'from-blue-600/20 to-blue-500/10',
      border: 'border-blue-500/30',
      badge: `${tahunList.length} tahun`,
      badgeClass: 'bg-blue-500/20 text-blue-400',
    },
    {
      href: '/latihan/wawancara',
      icon: <Mic className="w-8 h-8" />,
      title: 'Bank Soal Wawancara',
      desc: `${wawancaraCount} pertanyaan dari berbagai kategori`,
      color: 'from-amber-600/20 to-amber-500/10',
      border: 'border-amber-500/30',
      badge: 'Latihan Orasi',
      badgeClass: 'bg-amber-500/20 text-amber-400',
    },
    {
       href: '/latihan/keyword',
       icon: <Star className="w-8 h-8" />,
       title: 'Tantangan Kata Kunci',
       desc: 'Latih kemampuan improvisasi Anda melalui 3 kata kunci acak',
       color: 'from-purple-600/20 to-purple-500/10',
       border: 'border-purple-500/30',
       badge: 'AI Powered',
       badgeClass: 'bg-purple-500/20 text-purple-400',
    },
    {
      href: '/latihan/tiga-besar',
      icon: <Trophy className="w-8 h-8" />,
      title: 'Simulasi 3 Besar',
      desc: 'Siapkan diri Anda untuk babak final — pidato dan respon cepat',
      color: 'from-emerald-600/20 to-emerald-500/10',
      border: 'border-emerald-500/30',
      badge: 'Final Stage',
      badgeClass: 'bg-emerald-500/20 text-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto py-10 px-4">
        {/* Welcome */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
            Selamat datang, <span className="text-purple-600">{user.full_name}</span> 👋
          </h1>
          <p className="text-gray-500 font-medium">Siap lanjutkan persiapan Remaja Teladan hari ini?</p>
        </div>

        {/* Pending Notice Banner */}
        {isPending && (
          <div className="mb-10 bg-amber-50 border-2 border-amber-200 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 animate-fade-in shadow-xl shadow-amber-900/5">
             <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                <Lock className="w-8 h-8 text-amber-600" />
             </div>
             <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-black text-amber-900 mb-1">Akun Anda Belum Aktif</h3>
                <p className="text-amber-700 text-sm font-medium leading-relaxed">
                   Maaf, akses modul latihan saat ini masih dikunci. Silakan hubungi Admin untuk proses aktivasi akun Anda. 
                   <a href={waActivationLink} target="_blank" className="ml-2 font-black underline decoration-2 underline-offset-4 hover:text-amber-900 transition-colors">Hubungi Admin Klik disini</a>
                </p>
             </div>
             <a 
               href={waActivationLink} 
               target="_blank"
               className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-600/30 hover:bg-amber-700 hover:scale-[1.02] active:scale-95 transition-all"
             >
                Aktivasi Sekarang
             </a>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: <ClipboardList className="w-6 h-6 text-purple-600" />,
              label: 'Total Latihan',
              value: riwayat.length,
              suffix: 'kali',
              color: 'text-purple-600',
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
              label: 'Rata-rata Skor',
              value: avgSkor ?? '—',
              suffix: avgSkor ? '%' : '',
              color: 'text-indigo-600',
            },
            {
              icon: <Trophy className="w-6 h-6 text-amber-500" />,
              label: 'Skor Terbaik',
              value: bestSkor ?? '—',
              suffix: bestSkor ? '%' : '',
              color: 'text-amber-500',
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">{stat.icon}</div>
              <div>
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <div className={`text-3xl font-black ${stat.color}`}>
                  {stat.value}
                  <span className="text-sm text-gray-400 font-bold ml-1 uppercase">{stat.suffix}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-purple-600 rounded-full" />
          Pilih Aktivitas Latihan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={isPending ? '/dashboard?error=pending' : item.href}
              className={`group bg-white p-8 rounded-[32px] border-2 ${item.border} hover:border-purple-400 transition-all shadow-sm hover:shadow-xl hover:shadow-purple-900/5 relative overflow-hidden ${isPending ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                    {item.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-2 group-hover:text-purple-600 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 lg:max-w-sm">{item.desc}</p>
                <div className="flex items-center text-xs font-black uppercase tracking-widest text-purple-600">
                  {isPending ? 'Akses Terkunci' : 'Mulai Latihan'}
                  {isPending ? <Lock className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Riwayat */}
        {riwayat.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
               <span className="w-2 h-8 bg-indigo-600 rounded-full" />
               Riwayat Latihan Terbaru
            </h2>
            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kategori</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Skor</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {riwayat.slice(0, 5).map((n, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                         <div className="text-gray-900 font-bold">{n.judul || 'Latihan'}</div>
                         <div className="text-[10px] text-gray-400 font-black uppercase mt-1">Modul {n.tipe}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-xl font-black ${n.skor.content >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {Math.round((n.skor.content + n.skor.correlation + n.skor.performance) / 3)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold ml-1">%</span>
                      </td>
                      <td className="px-8 py-5 text-right text-gray-400 text-sm font-medium">
                        {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rekap Nilai Tes Tertulis */}
        {nilaiTertulis && nilaiTertulis.length > 0 && (
          <div className="animate-fade-in-up mt-10">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-purple-600 rounded-full" />
              Rekap Nilai Tes Tertulis
            </h2>
            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-50/50 border-b border-purple-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Paket / Tahun</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Skor</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {nilaiTertulis.slice(0, 8).map((n: any, idx: number) => (
                    <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="text-gray-900 font-bold flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-purple-400" />
                          {formatPaketLabel(n.tahun)}
                        </div>
                        <div className="text-[10px] text-gray-400 font-black uppercase mt-1">Tes Tertulis</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-xl font-black ${n.skor >= 50 ? 'text-purple-600' : 'text-amber-500'}`}>
                          {n.skor}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold ml-1">poin</span>
                      </td>
                      <td className="px-8 py-5 text-right text-gray-400 text-sm font-medium">
                        {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {nilaiTertulis.length > 8 && (
                <div className="px-8 py-4 border-t border-gray-50 text-center">
                  <a href="/laporan" className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center justify-center gap-1">
                    Lihat semua {nilaiTertulis.length} riwayat <BarChart3 className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 mb-4 text-center">
          <a href="/laporan" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
            <BarChart3 className="w-4 h-4" /> Lihat Laporan Lengkap
          </a>
        </div>
      </main>

      {/* Access Denied Modal */}
      {showDenied && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowDenied(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl animate-scale-in text-center overflow-hidden border border-red-50">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-amber-500" />
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
               {deniedModule === 'Penuh' ? 'Akun Belum Aktif' : 'Akses Terkunci'}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-10 font-medium">
               {deniedModule === 'Penuh' 
                 ? 'Maaf, akun Anda sedang menunggu verifikasi dari Admin. Silakan hubungi Admin untuk aktivasi paket latihan Anda.'
                 : <>Mohon maaf, Anda belum memiliki izin untuk mengakses modul <span className="text-red-500 font-bold">{deniedModule}</span>. Silakan hubungi Admin untuk aktivasi paket latihan Anda.</>
               }
            </p>
            
            <a 
              href={deniedModule === 'Penuh' ? waActivationLink : waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-green-500/30 hover:scale-[1.03] active:scale-95 transition-all mb-6"
            >
              <MessageCircle className="w-6 h-6" />
              Hubungi Admin
            </a>
            
            <button 
              onClick={() => setShowDenied(false)}
              className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-gray-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
