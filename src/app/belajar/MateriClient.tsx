'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { BookOpen, ChevronRight, X } from 'lucide-react'

type Materi = {
  id: number
  kategori: string
  judul: string
  konten: string
}

const KATEGORI_COLOR: Record<string, string> = {
  'Sejarah GMIM': 'badge-blue',
  'Tata Gereja': 'badge-amber',
  'Teologi': 'badge-green',
  'Pelayanan': 'badge-red',
  'Kepribadian': 'badge-purple',
  'Pengetahuan Alkitab': 'badge-blue',
  'Tata Gereja GMIM': 'badge-amber',
}

export default function MateriClient({ materiList }: { materiList: Materi[] }) {
  const [selected, setSelected] = useState<Materi | null>(null)
  const kategoriList = [...new Set(materiList.map((m) => m.kategori))]

  return (
    <div>
      {/* Daftar materi */}
      <div className="space-y-10">
        {kategoriList.map((kat, ki) => {
          const items = materiList.filter((m) => m.kategori === kat)
          return (
            <div key={ki} className="animate-fade-in" style={{ animationDelay: `${ki * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <span className={`badge ${KATEGORI_COLOR[kat] ?? 'badge-blue'} text-xs font-bold`}>{kat}</span>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{items.length} Topik</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="card bg-white text-left group hover:border-purple-300 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors mt-0.5">
                        <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors text-sm leading-tight mb-1">
                          {m.judul}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {m.konten.replace(/[#*`]/g, '').slice(0, 80)}...
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal reader */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-16 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0">
              <div className="space-y-1">
                <span className={`badge ${KATEGORI_COLOR[selected.kategori] ?? 'badge-blue'} text-[10px] uppercase font-bold`}>
                  {selected.kategori}
                </span>
                <h2 className="font-black text-gray-900 text-xl leading-tight">{selected.judul}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten markdown */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
              <div className="prose prose-sm max-w-none
                prose-headings:font-black prose-headings:text-gray-900
                prose-h2:text-xl prose-h3:text-lg prose-h3:text-purple-600
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-strong:text-gray-900 prose-strong:font-black
                prose-ul:space-y-2
              ">
                <ReactMarkdown>{selected.konten}</ReactMarkdown>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setSelected(null)} className="btn-primary w-full py-3 text-sm">
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
