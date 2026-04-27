'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  // Ref untuk mengetahui apakah user masih ingin merekam (belum klik stop)
  const isListeningRef = useRef(false);
  // Buffer final transcript yang terakumulasi antar sesi restart
  const finalBufferRef = useRef('');
  // Buffer sementara untuk final dari sesi AKTIF saja (mencegah komit interim)
  const lastSessionFinalRef = useRef('');
  // Array untuk menyimpan final per index agar bisa mengatasi bug Android yg me-replace index
  const sessionFinalsRef = useRef<string[]>([]);
  // Timer untuk memastikan batas waktu 60 detik
  const recordingTimerRef = useRef<any>(null);

  // ─── Text-to-Speech (TTS) ────────────────────────────────────────────────
  const speak = useCallback((text: string, voiceIndex: number = 0) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';

      const voices = window.speechSynthesis.getVoices();
      const idVoices = voices.filter(v => v.lang.includes('id'));

      if (idVoices.length > 0) {
        utterance.voice = idVoices[voiceIndex % idVoices.length];
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Helper untuk mencegah kata ganda saat menggabungkan string.
  // Terkadang API di HP mengulang kata terakhir dari final di awal interim.
  const mergeWithOverlapFix = useCallback((text1: string, text2: string) => {
    if (!text1) return text2;
    if (!text2) return text1;
    
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');
    
    let overlapCount = 0;
    const maxOverlap = Math.min(words1.length, words2.length);
    
    for (let i = 1; i <= maxOverlap; i++) {
        const suffix = words1.slice(-i).join(' ').toLowerCase();
        const prefix = words2.slice(0, i).join(' ').toLowerCase();
        if (suffix === prefix) {
            overlapCount = i;
        }
    }
    
    if (overlapCount > 0) {
        return text1 + ' ' + words2.slice(overlapCount).join(' ');
    }
    return text1 + ' ' + text2;
  }, []);

  // ─── Internal: buat satu sesi Recognition ────────────────────────────────
  const createSession = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: any) => {
      // Deteksi jika Android mereset resultIndex ke 0 secara internal tanpa onend
      if (event.resultIndex === 0 && sessionFinalsRef.current.length > 0) {
        // Komit sesi sebelumnya ke buffer utama untuk mencegah teks hilang
        const previousSession = sessionFinalsRef.current.filter(Boolean).join(' ').trim();
        if (previousSession) {
          finalBufferRef.current = mergeWithOverlapFix(finalBufferRef.current, previousSession);
        }
        // Reset array sesi ini
        sessionFinalsRef.current = [];
      }

      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          sessionFinalsRef.current[i] = transcript;
        } else {
          interim += transcript + ' ';
        }
      }

      const sessionFinal = sessionFinalsRef.current.filter(Boolean).join(' ').trim();
      lastSessionFinalRef.current = sessionFinal;

      let cleanInterim = interim.replace(/\s+/g, ' ').trim();

      // Menggabungkan dengan pintar untuk mencegah kata dobel di perbatasan
      const part1 = mergeWithOverlapFix(finalBufferRef.current, sessionFinal);
      const combined = mergeWithOverlapFix(part1, cleanInterim);
      
      setTranscript(combined);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      // 'no-speech' dan 'aborted' bukan error fatal — biarkan onend menangani restart
      // Ini memastikan walaupun diam (silence), proses restart terus berjalan
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        isListeningRef.current = false;
        setIsRecording(false);
        recognitionRef.current = null;
        if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Jika user BELUM klik stop (atau waktu belum 60 detik), komit final teks lalu restart otomatis
      if (isListeningRef.current) {
        
        // Cukup komit session final yang valid, buang interim yang hilang (mencegah double)
        if (lastSessionFinalRef.current.trim()) {
           finalBufferRef.current = mergeWithOverlapFix(finalBufferRef.current, lastSessionFinalRef.current);
           lastSessionFinalRef.current = '';
        }
        sessionFinalsRef.current = [];
        
        // Memastikan frontend merender sinkronisasi buffer terbaru
        setTranscript(finalBufferRef.current);
        
        // Restart setelah jeda singkat agar tidak bentrok sesi
        setTimeout(() => {
          if (isListeningRef.current) createSession();
        }, 200);
      } else {
        setIsRecording(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Recognition start error', e);
    }
  }, [mergeWithOverlapFix]);

  // ─── Public API ───────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    isListeningRef.current = false;
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Reset buffers dan mulai sesi baru
    finalBufferRef.current = '';
    lastSessionFinalRef.current = '';
    sessionFinalsRef.current = [];
    
    isListeningRef.current = true;
    
    // Set 60 detik hard limit (sesuai request)
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    recordingTimerRef.current = setTimeout(() => {
        stopRecording();
    }, 60000); // 60 detik absolute maks
    
    stopRecording();
    // Re-enable flag karena stopRecording mematikannya
    isListeningRef.current = true;
    
    setTimeout(() => createSession(), 100);
  }, [stopRecording, createSession]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    finalBufferRef.current = '';
    lastSessionFinalRef.current = '';
    sessionFinalsRef.current = [];
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  return {
    speak,
    isRecording,
    transcript,
    setTranscript,
    startRecording,
    stopRecording,
    clearTranscript
  };
}
