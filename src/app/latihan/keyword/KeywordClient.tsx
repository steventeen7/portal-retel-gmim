'use client';

import { useState, useEffect, useRef } from 'react';
import { useVoice } from '@/hooks/useVoice';
import { evaluateKeyword, EvalResult } from '@/lib/groq';
import { 
  Dices, Mic, MicOff, Volume2, Timer, Sparkles, 
  BarChart3, ArrowRight, Zap, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function KeywordClient({ user }: { user: any }) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { speak, isRecording, transcript, startRecording, stopRecording, clearTranscript } = useVoice();

  useEffect(() => {
    loadKeywords();
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleStop();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timeLeft]);

  async function loadKeywords() {
    try {
      const res = await fetch('/api/keywords');
      const json = await res.json();
      if (json.data) {
        setKeywords(json.data.map((k: any) => k.kata));
      } else {
        throw new Error('Data keywords kosong');
      }
    } catch (err) {
      console.warn('API Keywords error, fallback ke local');
      try {
        const fallbackRaw = await import('@/data/kata_kunci.json');
        const fallback = (fallbackRaw.default || fallbackRaw) as any[];
        setKeywords(fallback.map(k => k.kata));
      } catch (e) {
        toast.error('Gagal memuat kata kunci.');
      }
    }
  }

  function handleAcak() {
    if (keywords.length === 0) {
      toast.error('Mencoba memuat ulang kata kunci...');
      loadKeywords();
      return;
    }
    const shuffled = [...keywords].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, 1);
    setSelected(result);
    setEvalResult(null);
    clearTranscript();
    setTimeLeft(60);
    setIsTimerActive(false);
    
    setTimeout(() => {
       speak(`Tunjukkan kemampuan Anda. Bahas mendalam kata kunci berikut: ${result[0]}`);
    }, 500);
  }

  const handleStartSpeak = () => {
    startRecording();
    setIsTimerActive(true);
  };

  const handleStop = () => {
    stopRecording();
    setIsTimerActive(false);
  };

  const handleEvaluate = async () => {
    if (!transcript) return toast.error('Selesaikan rekaman terlebih dahulu.');
    setIsEvaluating(true);
    try {
      const result = await evaluateKeyword(selected, transcript);
      setEvalResult(result);

      await fetch('/api/simulasi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipe: 'keyword',
          judul: selected.join(', '),
          skor: {
            content: result.content,
            correlation: result.correlation,
            performance: result.performance
          },
          feedback: result.feedback,
          jawaban: transcript
        })
      });

      toast.success('Analisis AI selesai & tersimpan!');
    } catch (err) {
      toast.error('AI Gagal mengevaluasi.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up pb-20">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100 mb-2">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Keyword Challenge Mode</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Latihan Kata Kunci Final</h1>
        <p className="text-gray-500 font-medium">Bahas dan jabarkan 1 kata acak dalam narasi yang logis dan inspiratif dalam 60 detik.</p>
      </div>

      <div className="bg-white rounded-[40px] border border-purple-100 shadow-2xl shadow-purple-900/5 overflow-hidden">
        <div className="bg-gray-50/50 p-8 md:p-12 border-b border-gray-100">
           <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {selected.length > 0 ? (
                <>
                  {selected.map((word, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 animate-scale-in">
                       <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-white border-2 border-purple-100 shadow-lg flex items-center justify-center p-6 text-center group hover:border-purple-500 hover:scale-105 transition-all">
                          <span className="text-lg md:text-xl font-black text-purple-600 group-hover:text-purple-700">{word}</span>
                       </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-10 text-center">
                   <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-purple-600 animate-bounce">
                      <Dices className="w-10 h-10" />
                   </div>
                   <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Klik tombol Acak untuk mulai</p>
                </div>
              )}
           </div>

           <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleAcak}
                className="btn-primary py-4 px-10 rounded-2xl flex items-center gap-3 active:scale-95"
              >
                <Dices className="w-5 h-5" /> Acak Kata Kunci
              </button>
              {selected.length > 0 && (
                <button 
                  onClick={() => speak(`Bahas kata: ${selected[0]}`)}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  <Volume2 className="w-5 h-5" /> Bacakan
                </button>
              )}
           </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <div className={`p-2 rounded-lg ${isTimerActive ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                    <Timer className="w-5 h-5" />
                 </div>
                 <div className="text-3xl font-black tabular-nums tracking-tighter text-gray-900">
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sisa Waktu</div>
                 <div className="h-1.5 w-32 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${timeLeft < 15 ? 'bg-red-500' : 'bg-purple-600'}`} style={{ width: `${(timeLeft / 60) * 100}%` }} />
                 </div>
              </div>
           </div>

           <div className="relative">
              <textarea 
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-3xl p-8 text-gray-700 font-medium focus:bg-white focus:border-purple-400 outline-none h-48 transition-all resize-none"
                placeholder="Transkrip suara Anda akan muncul di sini saat Anda berbicara..."
                value={transcript}
                readOnly
              />
              {isRecording && <div className="absolute bottom-4 right-8 flex items-center gap-2 text-[10px] font-black text-red-500 animate-pulse uppercase tracking-[0.2em]">
                 <Mic className="w-3 h-3" /> System Listening...
              </div>}
           </div>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isRecording && !isTimerActive ? (
                <button 
                  onClick={handleStartSpeak}
                  disabled={selected.length === 0}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black text-sm shadow-xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Mic className="w-6 h-6" /> Mulai Bicara (60 Detik)
                </button>
              ) : (
                <button 
                  onClick={handleStop}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-[24px] font-black text-sm shadow-xl shadow-red-500/30 transition-all active:scale-95"
                >
                  <MicOff className="w-6 h-6" /> Selesai Lebih Cepat
                </button>
              )}

              <button 
                onClick={handleEvaluate}
                disabled={isEvaluating || !transcript || isRecording}
                className="flex items-center justify-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black text-sm shadow-xl shadow-emerald-500/30 transition-all disabled:opacity-50"
              >
                {isEvaluating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Evaluasi Juri AI
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
                 <h3 className="text-xl font-black text-gray-900">Skor Narasi Keyword</h3>
              </div>
              
              <div className="space-y-6">
                 {[
                   { label: 'Ketajaman Isi', val: evalResult.content, color: 'emerald' },
                   { label: 'Korelasi Spiritual', val: evalResult.correlation, color: 'blue' },
                   { label: 'Ketangkasan Bicara', val: evalResult.performance, color: 'violet' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end px-1">
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</div>
                         <div className={`text-xl font-black text-${item.color}-600`}>{item.val}</div>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                         <div className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-indigo-900 rounded-[40px] p-8 md:p-10 border border-indigo-800 shadow-xl text-white relative flex flex-col">
              <div className="space-y-4 flex-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/50 border border-indigo-700 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                    Final Feedback
                 </div>
                 <h3 className="text-2xl font-black tracking-tight">Catatan Juri AI</h3>
                 <p className="text-indigo-100/80 leading-relaxed font-medium italic">"{evalResult.feedback}"</p>
              </div>
              <div className="pt-8">
                 <button onClick={handleAcak} className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg active:scale-95">
                    Lakukan Simulasi Baru
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
