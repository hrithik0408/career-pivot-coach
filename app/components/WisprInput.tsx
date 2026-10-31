"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface WisprInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  isTextarea?: boolean;
  helpText?: string;
}

export function WisprInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  isTextarea = true,
  helpText,
}: WisprInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState("");

  // Refs for bulletproof synchronous lifecycle management
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const sessionCounterRef = useRef<number>(0);
  const latestValueRef = useRef<string>(value);
  const baseTextAtStartRef = useRef<string>("");
  const accumulatedFinalRef = useRef<string>("");

  // Keep latestValueRef synchronized with external value changes without re-creating recognition
  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  // Check speech recognition capability on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  // Safe internal helper to remove and detach any active recognition instance
  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {
        // Ignore errors during abort
      }
      recognitionRef.current = null;
    }
  }, []);

  // Stop recognition immediately, cancel audio capture, and discard trailing results
  const stopListening = useCallback(() => {
    // 1. Mark as not listening synchronously
    isListeningRef.current = false;
    // 2. Invalidate current session ID so any in-flight results are discarded
    sessionCounterRef.current += 1;
    // 3. Update React UI state
    setIsListening(false);
    setAudioFeedback("");
    // 4. Abort recognition and detach listeners
    cleanupRecognition();
  }, [cleanupRecognition]);

  // Clean up recognition session when component unmounts or navigates away
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      sessionCounterRef.current += 1;
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  // Start a fresh, isolated speech recognition session
  const startListening = useCallback(() => {
    // Clean up any stale recognition session
    stopListening();

    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in this browser. You can still focus this field and use your Wispr Flow desktop shortcut, or type directly.");
      return;
    }

    // Set up a new session token
    sessionCounterRef.current += 1;
    const currentSessionId = sessionCounterRef.current;
    isListeningRef.current = true;
    setIsListening(true);
    setAudioFeedback("Listening... Speak into your microphone.");

    // Capture base text at the start of this dictation turn
    baseTextAtStartRef.current = latestValueRef.current || "";
    accumulatedFinalRef.current = "";

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        // Discard late results if the session was stopped or session token changed
        if (!isListeningRef.current || sessionCounterRef.current !== currentSessionId) {
          return;
        }

        let newFinalText = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || "";
          if (res.isFinal) {
            newFinalText += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (newFinalText.trim()) {
          const trimmedFinal = newFinalText.trim();
          accumulatedFinalRef.current = accumulatedFinalRef.current
            ? `${accumulatedFinalRef.current} ${trimmedFinal}`
            : trimmedFinal;

          const base = baseTextAtStartRef.current.trim();
          const combined = base
            ? `${base} ${accumulatedFinalRef.current}`
            : accumulatedFinalRef.current;

          latestValueRef.current = combined;
          onChange(combined);
        }

        // Display feedback to user
        if (currentInterim.trim()) {
          setAudioFeedback(`Listening: "${currentInterim.trim().slice(-40)}"`);
        } else if (accumulatedFinalRef.current) {
          setAudioFeedback(`Transcribed: "${accumulatedFinalRef.current.slice(-40)}"`);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        // If aborted intentionally or session expired, ignore
        if (!isListeningRef.current || sessionCounterRef.current !== currentSessionId) {
          return;
        }

        isListeningRef.current = false;
        setIsListening(false);

        if (event.error === "no-speech") {
          setAudioFeedback("No speech detected. Dictation paused.");
        } else if (event.error === "not-allowed") {
          setAudioFeedback("Microphone access denied. Please allow microphone permissions in your browser.");
        } else if (event.error !== "aborted") {
          setAudioFeedback(`Recognition ended (${event.error}).`);
        } else {
          setAudioFeedback("");
        }

        cleanupRecognition();
      };

      recognition.onend = () => {
        // Only react if this is the active session
        if (sessionCounterRef.current === currentSessionId) {
          isListeningRef.current = false;
          setIsListening(false);
          // Do NOT automatically restart!
          cleanupRecognition();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
      isListeningRef.current = false;
      setIsListening(false);
      setAudioFeedback("Could not initialize microphone. Please check permissions.");
      cleanupRecognition();
    }
  }, [onChange, stopListening, cleanupRecognition]);

  const toggleListening = () => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          {label}
        </label>

        <div className="flex items-center gap-2">
          {/* Subtle Wispr Flow Desktop Shortcut Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-600 border border-slate-200"
            title="Wispr Flow is an external desktop dictation app. Focus this field and press your Wispr Flow desktop shortcut anytime to dictate hands-free."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Wispr Flow Shortcut
          </span>

          {/* Clean Dictate Trigger with explicit Start / Stop states */}
          <button
            type="button"
            onClick={toggleListening}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
              isListening
                ? "bg-rose-50 text-rose-700 border-rose-300 shadow-xs ring-1 ring-rose-400"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
            title={
              isListening
                ? "Click to immediately end speech recognition and release microphone"
                : "Toggle browser speech recognition into this field"
            }
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-xs bg-rose-600 animate-pulse" />
                <span>Stop Dictate</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span>Dictate (Browser)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {audioFeedback && (
        <p className="text-xs text-blue-700 italic">
          {audioFeedback}
        </p>
      )}

      {isTextarea ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs leading-relaxed transition-colors resize-y shadow-2xs font-sans"
        />
      ) : (
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs transition-colors shadow-2xs font-sans"
        />
      )}

      {helpText && (
        <p className="text-[11px] text-slate-500 leading-normal">
          {helpText}
        </p>
      )}
    </div>
  );
}
