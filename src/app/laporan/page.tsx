import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { BarChart3, TrendingUp, Calendar, CheckCircle2, Award, ClipboardList, ArrowUpRight, Mic } from 'lucide-react'

export default async function LaporanPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const user = token ? await verifyToken(token) : null
  if (!user) redirect('/auth/login')

  const riwayat = await db.nilaiUser.findByUser(user.id)
  const simHistory = await db.simulationHistory.findByUser(user.id)
  
  // Grouping data per tahun untuk ringkasan
  const summaryPerTahun = riwayat.reduce((acc: any, curr: any) => {
    if (!acc[curr.tahun] || acc[curr.tahun].skor < curr.skor) {
      acc[curr.tahun] = curr
    }
    return acc
  }, {})

  const tahunList = Object.keys(summaryPerTahun).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1 animate-fade-in-up">
            <div className="flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-widest">
              <BarChart3 className="w-4 h-4" /> Performance Analytics
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Laporan Hasil Latihan</h1>
            <p className="text-gray-500 font-medium font-medium">Pantau perkembangan skor Anda dari tahun ke tahun.</p>
          </div>

          <div className="flex gap-4 p-2 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="px-6 py-3 text-center border-r border-gray-50">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tes Selesai</div>
                <div className="text-2xl font-black text-purple-600 tracking-tight">{riwayat.length}</div>
             </div>
             <div className="px-6 py-3 text-center">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Skor Tertinggi</div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                   {riwayat.length > 0 ? Math.max(...riwayat.map((n:any) => n.skor)) : 0}
                </div>
             </div>
          </div>
        </div>

        {riwayat.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 animate-fade-in-up">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-gray-200" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Belum Ada Riwayat Tes</h3>
             <p className="text-gray-400 font-medium mb-8">Anda belum mengerjakan simulasi tes tertulis apa pun.</p>
             <a href="/latihan/tes" className="btn-primary px-8 py-4 rounded-2xl inline-flex items-center gap-2">
                Mulai Tes Sekarang <ArrowUpRight className="w-4 h-4" />
             </a>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
               {tahunList.map((tahun) => {
                 const data = summaryPerTahun[tahun]
                 return (
                   <div key={tahun} className="group bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                         <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                            <Calendar className="w-6 h-6" />
                         </div>
                         <div className="text-3xl font-black text-gray-900 tracking-tighter">TAHUN {tahun}</div>
                      </div>
                      <div className="space-y-4">
                         <div className="p-4 rounded-2xl bg-gray-50 border border-gray-50">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Skor Terbaik</div>
                            <div className="flex items-end gap-2">
                               <span className="text-4xl font-black text-purple-600 leading-none">{data.skor}</span>
                               <span className="text-xs font-bold text-gray-400 mb-1">POIN</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                            Peserta Telah Menyelesaikan Tes
                         </div>
                      </div>
                   </div>
                 )
               })}
            </div>

            {/* Full History Table */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 px-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Detail Riwayat Pengerjaan</h2>
               </div>
               <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-purple-900/5 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal / Waktu</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Materi Tahun</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skor Akhir</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {riwayat.map((n: any) => (
                           <tr key={n.id} className="hover:bg-purple-50/10 transition-colors group">
                              <td className="px-8 py-5 text-sm font-bold text-gray-700">
                                 {new Date(n.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-8 py-5">
                                 <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black tracking-widest uppercase">
                                    Soal {n.tahun}
                                 </span>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2">
                                    <div className="text-lg font-black text-gray-900">{n.skor}</div>
                                    <div className={`h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden relative`}>
                                       <div className="absolute inset-0 bg-purple-600 rounded-full" style={{ width: `${Math.min(100, (n.skor / 200) * 100)}%` }}></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <button className="text-xs font-black text-purple-600 hover:text-purple-800 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Lihat Detail Soal</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Simulation History Table */}
            <div className="space-y-6 mt-16 pb-20">
               <div className="flex items-center gap-2 px-2">
                  <Mic className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Detail Riwayat Latihan Tambahan & Simulasi Akhir</h2>
               </div>
               {simHistory.length === 0 ? (
                 <div className="bg-gray-50 rounded-3xl p-10 text-center border border-gray-100">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada riwayat pengerjaan simulasi / tes lisan.</p>
                 </div>
               ) : (
                 <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-purple-900/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-indigo-50/50 border-b border-indigo-100">
                             <th className="px-8 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tanggal / Waktu</th>
                             <th className="px-8 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Durasi Tempuh</th>
                             <th className="px-8 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Skor Akhir (100)</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {simHistory.map((n: any) => (
                             <tr key={n.id} className="hover:bg-indigo-50/10 transition-colors group">
                                <td className="px-8 py-5 text-sm font-bold text-gray-700">
                                   {new Date(n.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-8 py-5">
                                   <span className="px-3 py-1 bg-white border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                                      {n.waktu_tempuh} detik
                                   </span>
                                </td>
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-2">
                                      <div className="text-lg font-black text-gray-900">{Math.round(n.skor)}</div>
                                      <div className={`h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden relative`}>
                                         <div className="absolute inset-0 bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, n.skor)}%` }}></div>
                                      </div>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
