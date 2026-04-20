'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useVoice } from '@/hooks/useVoice';
import { evaluateAnswer, EvalResult } from '@/lib/groq';
import { 
  Mic, MicOff, Volume2, ChevronLeft, ChevronRight, 
  MessageSquare, Sparkles, Trophy, Target, Play, BarChart3, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WawancaraClient({ user, initialData = [] }: { user: any, initialData?: any[] }) {
  const [pertanyaan, setPertanyaan] = useState<any[]>(() => {
    return [...initialData].sort(() => Math.random() - 0.5);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const { speak, isRecording, transcript, startRecording, stopRecording, clearTranscript } = useVoice();

  const currentQ = pertanyaan[currentIdx];

  const handleNext = () => {
    if (currentIdx < pertanyaan.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setEvalResult(null);
      clearTranscript();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setEvalResult(null);
      clearTranscript();
    }
  };

  const handleEvaluate = async () => {
    if (!transcript.trim()) {
      toast.error('Gunakan mikrofon untuk menjawab terlebih dahulu.');
      return;
    }
    
    setIsEvaluating(true);
    try {
      const result = await evaluateAnswer(currentQ.kategori, currentQ.pertanyaan, transcript);
      setEvalResult(result);
      
      await fetch('/api/simulasi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipe: 'wawancara',
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

      toast.success('Penilaian AI selesai & tersimpan!');
    } catch (err) {
      toast.error('Gagal melakukan penilaian AI.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Menyiapkan Sesi Wawancara...</p>
    </div>
  );

  if (pertanyaan.length === 0) return (
    <div className="text-center py-20">
      <HelpCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-500 font-bold">Belum ada soal wawancara di database.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Mic className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Wawancara AI Simulator</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Simulasi Wawancara</h1>
          <p className="text-gray-500 text-sm">Gunakan Mic untuk menjawab, AI Groq akan menilai kesesuaian jawaban Anda.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
           <div className="text-right">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Soal</div>
              <div className="text-sm font-black text-purple-600">{currentIdx + 1} / {pertanyaan.length}</div>
           </div>
           <button 
             onClick={() => speak(currentQ.pertanyaan)}
             className="p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
             title="Bacakan Soal"
           >
             <Volume2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[36px] blur opacity-10"></div>
        <div className="relative bg-white rounded-[32px] shadow-xl border border-purple-50 overflow-hidden">
          <div className="px-8 py-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-purple-200 text-[10px] font-black text-purple-700 uppercase tracking-tighter">
              Kategori: {currentQ.kategori}
            </span>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            <div className="text-center space-y-4">
               <p className="text-2xl md:text-3xl font-black text-gray-900 leading-tight italic">
                 "{currentQ.pertanyaan}"
               </p>
               <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => speak(currentQ.pertanyaan)}
                    className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:underline"
                  >
                    <Play className="w-3 h-3" /> Dengarkan Soal Lagi
                  </button>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jawaban Anda (Audio Transkrip)</div>
                  {isRecording && <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 animate-pulse">
                     <span className="w-2 h-2 rounded-full bg-red-500" /> Recording...
                  </div>}
               </div>

               <div className="relative group/answer">
                  <textarea
                    rows={4}
                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-3xl p-6 text-gray-700 font-medium focus:bg-white focus:border-purple-400 outline-none resize-none transition-all pr-12"
                    placeholder="Klik tombol Mikrofon di bawah untuk mulai berbicara..."
                    value={transcript}
                    readOnly
                  />
                  <div className="absolute top-6 right-6">
                     <MessageSquare className="w-5 h-5 text-gray-200" />
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-500/30 transition-all active:scale-95"
                    >
                      <Mic className="w-5 h-5" /> Mulai Menjawab
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-500/30 transition-all active:scale-95"
                    >
                      <MicOff className="w-5 h-5" /> Berhenti & Simpan
                    </button>
                  )}

                  <button 
                    onClick={handleEvaluate}
                    disabled={isEvaluating || !transcript}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isEvaluating ? <UpdateIcon className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Minta Penilaian AI
                  </button>
               </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button onClick={handlePrev} disabled={currentIdx === 0} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-purple-600 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-5 h-5" /> Sebelumnya
            </button>
            <div className="flex gap-1.5">
               {pertanyaan.slice(0, 10).map((_, i) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'w-6 bg-purple-600' : 'w-1.5 bg-gray-200'}`} />
               ))}
            </div>
            <button onClick={handleNext} disabled={currentIdx === pertanyaan.length - 1} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-purple-600 disabled:opacity-30 transition-colors">
              Berikutnya <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {evalResult && (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
          <div className="bg-white rounded-[40px] p-8 md:p-10 border border-purple-50 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
                  <BarChart3 className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-black text-gray-900">Skor Penilaian AI</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
               {[
                 { label: 'Content (Isi)', val: evalResult.content, color: 'emerald', icon: <Target className="w-4 h-4" /> },
                 { label: 'Correlation (Alkitab)', val: evalResult.correlation, color: 'blue', icon: <Play className="w-4 h-4" /> },
                 { label: 'Performance (Sikap)', val: evalResult.performance, color: 'violet', icon: <Trophy className="w-4 h-4" /> },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                       <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {item.icon} {item.label}
                       </div>
                       <div className={`text-xl font-black text-${item.color}-600`}>{item.val}</div>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                       <div className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-[40px] p-8 md:p-10 border border-indigo-800 shadow-xl text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles className="w-32 h-32" />
             </div>
             <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/50 border border-indigo-700 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                   Feedback Juri AI
                </div>
                <h3 className="text-2xl font-black tracking-tight">Analisis Jawaban</h3>
                <p className="text-indigo-100/80 leading-relaxed font-medium">"{evalResult.feedback}"</p>
                <div className="pt-6">
                   <button onClick={handleNext} className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg active:scale-95">
                      Lanjut ke Soal Berikutnya
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UpdateIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
