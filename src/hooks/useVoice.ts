'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // ─── Text-to-Speech (TTS) ────────────────────────────────────────────────
  const speak = useCallback((text: string, voiceIndex: number = 0) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      
      const voices = window.speechSynthesis.getVoices();
      const idVoices = voices.filter(v => v.lang.includes('id'));
      
      if (idVoices.length > 0) {
        // Pilih suara berdasarkan voiceIndex (modulus array length agar aman)
        utterance.voice = idVoices[voiceIndex % idVoices.length];
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // ─── Speech-to-Text (STT) ────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Browser Anda tidak mendukung Web Speech API.');
      return;
    }

    // Pastikan session lama mati
    stopRecording();

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      // 1. Ambil semua teks yang sudah final
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      // 2. Ambil HANYA interim result yang paling terakhir (mencegah bug duplikasi kata di beberapa browser)
      let interimTranscript = '';
      const lastResult = event.results[event.results.length - 1];
      if (lastResult && !lastResult.isFinal) {
        interimTranscript = lastResult[0].transcript;
      }
      
      const currentFull = finalTranscript + ' ' + interimTranscript;
      setTranscript(currentFull.replace(/\s+/g, ' ').trim());
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech') {
        stopRecording();
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Recognition start error', e);
    }
  }, [stopRecording]);

  const clearTranscript = useCallback(() => setTranscript(''), []);

  // Membersihkan recognition saat unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
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
