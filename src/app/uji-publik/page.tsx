import { Suspense } from 'react';
import { Search, Globe, ChevronRight, Activity, Calendar, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Uji Publik - Transparansi Data Peserta',
};

async function getUjiPublikData() {
  try {
    const res = await fetch('https://nevos.gmim.or.id/ujipublik.php', { next: { revalidate: 3600 } });
    const html = await res.text();
    
    const regex = /<td><strong>(.*?)<\/strong><\/td>\s*<td class='text-center'>(.*?)<\/td>\s*<td class='text-center'><span class='badge-kategori'>(.*?)<\/span><\/td>\s*<td class='text-center'><a href='(.*?)'/g;
    
    let match;
    const results = [];
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: match[1],
        date: match[2],
        category: match[3],
        link: `https://nevos.gmim.or.id/${match[4]}`,
      });
    }
    
    return results;
  } catch (error) {
    console.error('Failed to fetch uji publik data:', error);
    return [];
  }
}

export default async function UjiPublikPage() {
  const data = await getUjiPublikData();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 mb-6 shadow-inner">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
          Uji Publik Transparansi Data
        </h1>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Daftar kegiatan aktif dari sistem NEVOS. Data ini ditampilkan untuk transparansi dan uji kebenaran data peserta oleh publik.
        </p>
      </div>

      {/* Stats/Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Kegiatan Aktif</div>
               <div className="text-2xl font-black text-gray-900">{data.length}</div>
            </div>
         </div>
         <div className="md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-900/10 flex items-center gap-6">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/20 items-center justify-center shrink-0">
               <Search className="w-6 h-6 text-white" />
            </div>
            <div>
               <h3 className="font-bold text-lg mb-1">Kenapa Uji Publik?</h3>
               <p className="text-purple-100 text-sm leading-relaxed">
                  Kami membuka data peserta untuk memastikan tidak ada kesalahan input. 
                  Jika Anda menemukan ketidaksesuaian data pada rayon atau wilayah Anda, segera laporkan ke panitia setempat.
               </p>
            </div>
         </div>
      </div>

      {/* List Data */}
      <div className="space-y-4">
         {data.map((item, index) => (
            <a 
              key={index}
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white p-6 rounded-[24px] border border-gray-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-900/5 transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-2 h-full bg-purple-100 group-hover:bg-purple-500 transition-colors"></div>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                  <div className="flex-1">
                     <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                        {item.title}
                     </h3>
                     <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                           <Calendar className="w-3.5 h-3.5 text-gray-400" />
                           {item.date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl border border-purple-100">
                           <Award className="w-3.5 h-3.5" />
                           {item.category}
                        </span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-sm uppercase tracking-widest shrink-0">
                     Lihat Detail
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </a>
         ))}

         {data.length === 0 && (
           <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">Tidak dapat mengambil data Uji Publik saat ini.</p>
           </div>
         )}
      </div>
    </div>
  );
}
