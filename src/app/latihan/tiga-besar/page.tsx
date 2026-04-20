'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useVoice } from '@/hooks/useVoice';
import { evaluateAnswer, EvalResult } from '@/lib/groq';
import { 
  Trophy, Mic, MicOff, Volume2, Sparkles, 
  BarChart3, Target, Medal, Play, RotateCcw,
  Star, Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyToken, getCookie } from '@/lib/auth';

export default function TigaBesarPage() {
  const [soal, setSoal] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const { speak, isRecording, transcript, setTranscript, startRecording, stopRecording, clearTranscript } = useVoice();

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      const user = verifyToken(token);
      if (user && user.role !== 'admin' && !user.permissions?.includes('tiga-besar')) {
        toast.error('Akses Ditolak: Anda tidak memiliki izin untuk modul ini.');
        window.location.href = '/dashboard';
        return;
      }
    }
    loadSoal();
  }, []);

  async function loadSoal() {
    try {
      const { data, error } = await supabase.from('soal_tiga_besar').select('*');
      if (error) throw error;
      if (data) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setSoal(shuffled);
      }
    } catch (err: any) {
      console.warn('Gagal memuat dari Supabase, menggunakan JSON lokal:', err.message);
      try {
        const fallbackRaw = await import('@/data/soal_tiga_besar.json');
        const fallback = (fallbackRaw.default || fallbackRaw) as any[];
        setSoal(fallback.sort(() => Math.random() - 0.5));
      } catch (e) {
        toast.error('Gagal memuat soal 3 besar.');
      }
    } finally {
      setLoading(false);
    }
  }

  const currentQ = soal[currentIdx];

  const handleNext = () => {
    if (currentIdx < soal.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setEvalResult(null);
      clearTranscript();
    }
  };

  const handleEvaluate = async () => {
    if (!transcript) return toast.error('Berikan jawaban Anda terlebih dahulu.');
    setIsEvaluating(true);
    try {
      const result = await evaluateAnswer('Tahap 3 Besar', currentQ.pertanyaan, transcript);
      setEvalResult(result);
      
      // Auto-save to history
      await fetch('/api/simulasi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipe: 'tiga-besar',
          judul: currentQ.pertanyaan,
          skor: {
            content: result.content,
            correlation: result.correlation,
            performance: result.performance
          },
          feedback: result.feedback,
          jawaban: transcript
        })
      });

      toast.success('Penilaian Juri selesai & tersimpan!');
    } catch (err) {
      toast.error('Evaluasi AI Gagal.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Mempersiapkan Panggung 3 Besar...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          <Medal className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Grand Final Simulator</span>
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Simulasi 3 Besar</h1>
        <p className="text-gray-500 font-medium">Uji mentalitas Anda di depan juri AI dalam simulasi pertanyaan pamungkas.</p>
      </div>

      <div className="relative">
         <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-[50px] blur-2xl opacity-10"></div>
         <div className="relative bg-white rounded-[40px] shadow-2xl border border-amber-100 overflow-hidden">
            
            <div className="p-8 md:p-14 text-center space-y-10">
               {/* Question Section */}
               <div className="space-y-6">
                  <div className="inline-block p-4 rounded-3xl bg-amber-50 text-amber-600 mb-2">
                     <Star className="w-8 h-8 fill-current" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight italic px-4">
                    "{currentQ?.pertanyaan || 'Mempersiapkan pertanyaan...'}"
                  </h2>
                  <div className="flex justify-center gap-3">
                     <button 
                       onClick={() => speak(currentQ?.pertanyaan)}
                       className="btn bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 active:scale-95 shadow-lg shadow-amber-500/20"
                     >
                       <Volume2 className="w-5 h-5" /> Bacakan Pertanyaan
                     </button>
                  </div>
               </div>

               {/* Interaction Section */}
               <div className="space-y-6 pt-10 border-t border-gray-100">
                  <div className="flex items-center justify-between px-2">
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transkrip Pidato Jawaban</div>
                     {isRecording && <div className="text-xs font-bold text-red-500 animate-pulse uppercase">🔴 System Capturing Speech...</div>}
                  </div>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-8 min-h-[180px] flex items-center justify-center">
                     {transcript ? (
                       <p className="text-xl font-bold text-gray-700 leading-relaxed italic">"{transcript}"</p>
                     ) : (
                       <p className="text-gray-300 font-black uppercase tracking-widest text-xs">Klik Mikrofon untuk mulai orasi</p>
                     )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!isRecording ? (
                      <button 
                        onClick={startRecording}
                        className="group flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 hover:bg-black text-white rounded-[24px] font-black text-sm transition-all shadow-xl active:scale-95"
                      >
                        <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" /> Mulai Berbicara
                      </button>
                    ) : (
                      <button 
                        onClick={stopRecording}
                        className="flex items-center justify-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-[24px] font-black text-sm shadow-xl shadow-red-500/30 transition-all active:scale-95"
                      >
                        <MicOff className="w-6 h-6" /> Akhiri Orasi
                      </button>
                    )}

                    <button 
                      onClick={handleEvaluate}
                      disabled={isEvaluating || !transcript}
                      className="flex items-center justify-center gap-3 px-10 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-amber-500/30 transition-all disabled:opacity-50"
                    >
                      {isEvaluating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Minta Penilaian Juri
                    </button>
                  </div>
               </div>
            </div>

            {/* Navigation */}
            <div className="bg-amber-50/50 p-6 border-t border-amber-100 flex items-center justify-between">
               <button onClick={() => { if(currentIdx > 0) setCurrentIdx(currentIdx - 1); setEvalResult(null); clearTranscript(); }} className="text-xs font-black text-amber-600 uppercase tracking-widest hover:underline disabled:opacity-30" disabled={currentIdx === 0}>Back</button>
               <div className="text-xs font-black text-amber-500 uppercase tracking-[0.4em]">Tahap Penentuan</div>
               <button onClick={handleNext} className="text-xs font-black text-amber-600 uppercase tracking-widest hover:underline disabled:opacity-30" disabled={currentIdx === soal.length - 1}>Next Prompt</button>
            </div>
         </div>
      </div>

      {/* Evaluation Results */}
      {evalResult && (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
           <div className="bg-white rounded-[40px] p-10 border border-amber-100 shadow-xl space-y-8">
              <div className="flex items-center gap-3">
                 <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/40">
                    <BarChart3 className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Final Scoring</h3>
              </div>
              
              <div className="space-y-6">
                 {[
                   { label: 'Ketajaman Konten', val: evalResult.content, color: 'emerald' },
                   { label: 'Kedalaman Spiritual', val: evalResult.correlation, color: 'blue' },
                   { label: 'Wibawa & Sikap', val: evalResult.performance, color: 'amber' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end px-1">
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</div>
                         <div className={`text-2xl font-black text-${item.color}-600`}>{item.val}</div>
                      </div>
                      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50">
                         <div className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${item.val}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gray-900 rounded-[40px] p-10 border border-gray-800 shadow-2xl text-white relative flex flex-col">
              <div className="space-y-4 flex-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Juri AI Decision
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter uppercase text-amber-500">Komentar Panel Juri</h3>
                 <p className="text-gray-300 leading-relaxed font-medium italic text-lg leading-relaxed">
                   "{evalResult.feedback}"
                 </p>
              </div>
              <div className="pt-10">
                 <button onClick={handleNext} className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/30 active:scale-95">
                    Lanjut ke Simulasi Terakhir
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
