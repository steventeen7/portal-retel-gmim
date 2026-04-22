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
      // Ambil semua hasil FINAL dari sesi ini
      let sessionFinal = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          sessionFinal += event.results[i][0].transcript.trim() + ' ';
        }
      }
      
      // Simpan sessionFinal agar tidak terbawa dengan interim saat restart
      lastSessionFinalRef.current = sessionFinal;

      // Ambil HANYA satu interim terbaru (anti-duplikasi Android)
      let interim = '';
      const last = event.results[event.results.length - 1];
      if (last && !last.isFinal) {
        interim = last[0].transcript.trim();
      }

      // Gabungkan: buffer permanen + final sesi aktif + interim saat ini
      const combined = (finalBufferRef.current + ' ' + sessionFinal + ' ' + interim)
        .replace(/\s+/g, ' ')
        .trim();
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
           finalBufferRef.current = (finalBufferRef.current + ' ' + lastSessionFinalRef.current).replace(/\s+/g, ' ').trim();
           lastSessionFinalRef.current = '';
        }
        
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
  }, []);

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
