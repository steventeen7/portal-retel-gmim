import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Portal Persiapan Pemilihan Remaja Teladan GMIM</h1>
        <p className="text-lg">Persiapkan dirimu menjadi remaja teladan yang berakar, bertumbuh, dan berbuah bagi Kristus</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/latihan/tes" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-slate-800">
          <h2 className="text-2xl font-bold text-purple-700">📝 Tes Tertulis</h2>
          <p className="text-gray-600 mt-2">Latihan soal dari tahun 2014-2026 dengan sistem penilaian +2, -1, 0</p>
        </Link>
        <Link href="/latihan/wawancara" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-slate-800">
          <h2 className="text-2xl font-bold text-purple-700">🎤 Latihan Wawancara</h2>
          <p className="text-gray-600 mt-2">Simulasi wawancara dengan 7 kategori materi</p>
        </Link>
        <Link href="/latihan/keyword" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-slate-800">
          <h2 className="text-2xl font-bold text-purple-700">🔑 Latihan Kata Kunci</h2>
          <p className="text-gray-600 mt-2">Acak 3 kata kunci dan jelaskan di depan juri</p>
        </Link>
        <Link href="/latihan/tiga-besar" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-slate-800">
          <h2 className="text-2xl font-bold text-purple-700">🏆 Latihan 3 Besar</h2>
          <p className="text-gray-600 mt-2">Pertanyaan puncak untuk menentukan juara</p>
        </Link>
        <Link href="/belajar" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-slate-800">
          <h2 className="text-2xl font-bold text-purple-700">📚 Belajar</h2>
          <p className="text-gray-600 mt-2">Materi lengkap: Alkitab, Tata Gereja, Kepribadian, dll</p>
        </Link>
      </div>
    </div>
  );
}
