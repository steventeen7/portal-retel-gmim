'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BarChart3, Search, Trash2, ArrowLeft, ClipboardList, Mic, Package } from 'lucide-react';
import Link from 'next/link';

function formatPaketLabel(tahun: number): string {
  if (tahun === 2091) return 'Rangkuman 1 (2019-2025)';
  if (tahun === 2092) return 'Rangkuman 2 (2019-2025)';
  if (tahun === 2093) return 'Rangkuman 3 (2019-2025)';
  return `Paket Tahun ${tahun}`;
}

export default function HasilTesAdminClient({ initialTertulis, initialSimulasi }: { initialTertulis: any[], initialSimulasi: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tertulis'|'simulasi'>('tertulis');
  const [tertulisList, setTertulisList] = useState(initialTertulis);
  const [simulasiList, setSimulasiList] = useState(initialSimulasi);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: number, type: 'tertulis' | 'simulasi') => {
    if (!confirm('Hapus riwayat tes ini secara permanen?')) return;
    try {
      const res = await fetch('/api/admin/hasil-tes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Riwayat dihapus!');
      
      if (type === 'tertulis') {
        setTertulisList(prev => prev.filter(item => item.id !== id));
      } else {
        setSimulasiList(prev => prev.filter(item => item.id !== id));
      }
      router.refresh();
    } catch {
      toast.error('Gagal hapus data nilai.');
    }
  };

  const getFilteredData = (list: any[]) => {
    return list.filter(item => {
       const user = item.profiles;
       const searchLow = searchTerm.toLowerCase();
       if (!user) return false;
       return (user.full_name?.toLowerCase().includes(searchLow) || user.jemaat?.toLowerCase().includes(searchLow));
    });
  };

  const filteredTertulis = getFilteredData(tertulisList);
  const filteredSimulasi = getFilteredData(simulasiList);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-8 rounded-[32px] shadow-sm border border-purple-50 gap-6">
        <div className="flex items-center gap-4">
           <Link href="/admin" className="p-3 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors">
              <ArrowLeft className="w-6 h-6" />
           </Link>
           <div>
             <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
               <BarChart3 className="w-8 h-8 text-purple-600" />
               Laporan Hasil Tes
             </h1>
             <p className="text-gray-500 font-medium">Lacak skor dan riwayat pengerjaan tes seluruh peserta.</p>
           </div>
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari Nama / Jemaat..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-700 outline-none focus:border-purple-500 transition-colors"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
         <button onClick={() => setActiveTab('tertulis')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tertulis' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
           <ClipboardList className="w-4 h-4" /> Tes Tertulis ({filteredTertulis.length})
         </button>
         <button onClick={() => setActiveTab('simulasi')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'simulasi' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
           <Mic className="w-4 h-4" /> Tes Simulasi/Lisan ({filteredSimulasi.length})
         </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu Pengerjaan</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Peserta</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Latihan</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Skor Akhir</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {activeTab === 'tertulis' && filteredTertulis.map((d: any) => (
                  <tr key={d.id} className="hover:bg-purple-50/10 transition-colors">
                     <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {new Date(d.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                     </td>
                     <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{d.profiles?.full_name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{d.profiles?.jemaat || 'Tanpa Jemaat'}</div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 w-fit">
                           <Package className="w-3 h-3" />
                           {formatPaketLabel(d.tahun)}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-xl bg-purple-600 text-white font-black text-sm shadow-md">
                           {d.skor}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(d.id, 'tertulis')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors inline-block"><Trash2 className="w-4 h-4" /></button>
                     </td>
                  </tr>
               ))}
               {activeTab === 'simulasi' && filteredSimulasi.map((d: any) => (
                  <tr key={d.id} className="hover:bg-indigo-50/10 transition-colors">
                     <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {new Date(d.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                     </td>
                     <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{d.profiles?.full_name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{d.profiles?.jemaat || 'Tanpa Jemaat'}</div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                           SIMULASI GLOBAL
                        </span>
                        <div className="text-[10px] font-semibold text-gray-400 mt-1">Waktu Tempuh: {d.waktu_tempuh}d</div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-md">
                           {Math.round(d.skor)}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(d.id, 'simulasi')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors inline-block"><Trash2 className="w-4 h-4" /></button>
                     </td>
                  </tr>
               ))}
               {((activeTab === 'tertulis' && filteredTertulis.length === 0) || (activeTab === 'simulasi' && filteredSimulasi.length === 0)) && (
                  <tr>
                     <td colSpan={5} className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data pencarian / riwayat.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
