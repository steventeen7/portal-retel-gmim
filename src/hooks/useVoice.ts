'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // ─── Text-to-Speech (TTS) ────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
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
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // Hanya tambahkan hasil final ke buffer utama jika diinginkan, 
          // tapi biasanya kita proses ulang semua untuk akurasi.
        }
      }
      
      // Cara paling aman: Membangun ulang dari semua results di event saat ini
      let currentFull = '';
      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (text) {
          currentFull += text.trim() + ' ';
        }
      }
      setTranscript(currentFull.trim());
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
