'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, Activity, Calendar, Award, ChevronRight, Search,
  ArrowLeft, Users, RefreshCw, ExternalLink, AlertCircle
} from 'lucide-react';

type KegiatanItem = {
  no: string;
  title: string;
  date: string;
  category: string;
  detailUrl: string;
};

function parseDetailUrl(url: string) {
  // Bisa berupa path relatif seperti "ujipublik_detail.php?id=88&sig=abc..."
  // atau URL lengkap
  try {
    const fullUrl = url.startsWith('http')
      ? url
      : `https://nevos.gmim.or.id/${url}`;
    const u = new URL(fullUrl);
    return { id: u.searchParams.get('id') || '', sig: u.searchParams.get('sig') || '' };
  } catch {
    const m = url.match(/id=(\d+).*?sig=([a-f0-9]+)/i);
    if (m) return { id: m[1], sig: m[2] };
    return { id: '', sig: '' };
  }
}

export default function HasilTesRetelClient() {
  const [data, setData] = useState<KegiatanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<KegiatanItem | null>(null);
  const [proxyUrl, setProxyUrl] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/uji-publik');
      const json = await res.json();
      if (json.error && (!json.data || json.data.length === 0)) throw new Error(json.error);
      setData(json.data || []);
    } catch (e: any) {
      setError('Gagal memuat data. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  }

  function handleDetail(item: KegiatanItem) {
    const { id, sig } = parseDetailUrl(item.detailUrl);
    // Gunakan proxy lokal agar tidak ada masalah X-Frame-Options / refused to connect
    const url = `/api/uji-publik-detail?id=${id}&sig=${sig}`;
    setSelectedItem(item);
    setProxyUrl(url);
    setShowDetail(true);
  }

  const nevosDirectUrl = selectedItem
    ? (() => {
        const { id, sig } = parseDetailUrl(selectedItem.detailUrl);
        return `https://nevos.gmim.or.id/ujipublik_detail.php?id=${id}&sig=${sig}`;
      })()
    : '';

  const filtered = data.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.date.includes(searchTerm)
  );

  if (showDetail && selectedItem) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4 animate-fade-in">
        {/* Back Bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => { setShowDetail(false); setSelectedItem(null); }}
            className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-gray-200 text-gray-700 font-bold text-sm shadow-sm hover:border-purple-300 hover:text-purple-700 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-gray-900 truncate">{selectedItem.title}</h2>
            <p className="text-xs text-gray-400 font-medium">{selectedItem.category} • {selectedItem.date}</p>
          </div>
          <a
            href={nevosDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka di NEVOS
          </a>
        </div>

        {/* Iframe mengarah ke proxy lokal — tidak akan kena X-Frame-Options */}
        <div
          className="bg-white rounded-[32px] shadow-xl border border-purple-100 overflow-hidden"
          style={{ height: 'calc(100vh - 180px)' }}
        >
          <iframe
            src={proxyUrl}
            className="w-full h-full border-0"
            title={selectedItem.title}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 mb-6 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
          Hasil Tes Retel GMIM
        </h1>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Data peserta kegiatan Remaja Teladan yang diambil langsung dari sistem{' '}
          <a
            href="https://nevos.gmim.or.id/ujipublik.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 font-bold hover:underline"
          >
            NEVOS GMIM
          </a>{' '}
          untuk transparansi dan verifikasi publik.
        </p>
      </div>

      {/* Stats + Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kegiatan Retel Aktif</div>
            <div className="text-2xl font-black text-gray-900">
              {loading ? '...' : data.length}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-900/10 flex items-center gap-6">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/20 items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Transparansi Data Peserta</h3>
            <p className="text-purple-100 text-sm leading-relaxed">
              Data peserta Remaja Teladan dibuka untuk publik agar semua pihak dapat memverifikasi kebenaran data.
              Klik <strong>"Detail"</strong> untuk melihat daftar peserta per kategori kegiatan.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama kegiatan atau rayon..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl font-medium text-gray-700 outline-none focus:border-purple-400 transition-colors shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-24 space-y-4">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Mengambil data dari NEVOS...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-700">{error}</p>
            <button onClick={fetchData} className="mt-2 text-xs font-black text-red-600 uppercase tracking-widest hover:underline">
              Coba Lagi
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-[24px] border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-900/5 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-100 group-hover:bg-purple-500 transition-colors rounded-l-[24px]" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 pl-8">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-black text-sm flex items-center justify-center shrink-0 border border-purple-100">
                    {item.no}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-purple-700 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1.5 bg-purple-50 text-purple-600 px-2.5 py-1 rounded-xl border border-purple-100">
                        <Award className="w-3 h-3" />
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDetail(item)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md shadow-purple-500/20 hover:bg-purple-700 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                >
                  Lihat Detail
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">
                {searchTerm
                  ? `Tidak ada kegiatan yang cocok dengan "${searchTerm}"`
                  : 'Tidak ada data kegiatan Remaja Teladan aktif saat ini.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
