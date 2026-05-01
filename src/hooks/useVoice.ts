'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  
  // Buffer utama yang sudah final
  const finalTranscriptRef = useRef('');
  // Buffer sementara sesi aktif
  const lastSessionTextRef = useRef('');
  // Timer untuk limit pengerjaan
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

    // Jika sudah ada sesi aktif, jangan buat baru
    if (recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false; 
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let sessionFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinal += text;
        } else {
          interimTranscript += text;
        }
      }

      const currentDisplay = [finalTranscriptRef.current, sessionFinal, interimTranscript]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      setTranscript(currentDisplay);
      
      if (sessionFinal) {
        lastSessionTextRef.current = sessionFinal;
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isListeningRef.current = false;
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      if (lastSessionTextRef.current) {
        const current = finalTranscriptRef.current.trim();
        const added = lastSessionTextRef.current.trim();
        
        if (!current.toLowerCase().endsWith(added.toLowerCase())) {
           finalTranscriptRef.current = (current + ' ' + added).trim();
        }
        lastSessionTextRef.current = '';
      }

      recognitionRef.current = null;
      
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current) createSession();
        }, 100);
      } else {
        setIsRecording(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Recognition start error', e);
      recognitionRef.current = null;
    }
  }, []);

  // ─── Public API ───────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    isListeningRef.current = false;
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { }
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    finalTranscriptRef.current = '';
    setTranscript('');
    lastSessionTextRef.current = '';
    isListeningRef.current = true;
    
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    recordingTimerRef.current = setTimeout(() => {
        stopRecording();
    }, 60000);
    
    createSession();
  }, [createSession, stopRecording]);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    lastSessionTextRef.current = '';
  }, []);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
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
