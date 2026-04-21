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

      // Ambil HANYA satu interim terbaru (anti-duplikasi Android)
      let interim = '';
      const last = event.results[event.results.length - 1];
      if (last && !last.isFinal) {
        interim = last[0].transcript.trim();
      }

      // Gabungkan: buffer sesi sebelumnya + final sesi ini + interim saat ini
      const combined = (finalBufferRef.current + ' ' + sessionFinal + ' ' + interim)
        .replace(/\s+/g, ' ')
        .trim();
      setTranscript(combined);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      // 'no-speech' dan 'aborted' bukan error fatal — biarkan onend menangani restart
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        isListeningRef.current = false;
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Jika user BELUM klik stop, simpan teks final lalu restart otomatis
      if (isListeningRef.current) {
        // Simpan teks final terbaru ke buffer permanen sebelum restart
        setTranscript(prev => {
          finalBufferRef.current = prev;
          return prev;
        });
        // Restart setelah jeda singkat agar tidak bentrok
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
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Reset buffer dan mulai sesi baru
    finalBufferRef.current = '';
    isListeningRef.current = true;
    stopRecording();
    setTimeout(() => createSession(), 100);
  }, [stopRecording, createSession]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    finalBufferRef.current = '';
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
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
