"use client";

import React, { useState, useEffect, useRef } from "react";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser SpeechRecognition is available as fallback for Wispr Flow
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onChange(value ? `${value} ${transcript}` : transcript);
          setAudioFeedback(`Transcribed: "${transcript.slice(-30)}..."`);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAudioFeedback("Microphone paused. Click Dictate to resume, or speak via your Wispr Flow shortcut.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [value, onChange]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Tip: Focus this field and use your Wispr Flow desktop dictation shortcut anytime!");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAudioFeedback("");
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setAudioFeedback("Listening... Speak naturally.");
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          {label}
        </label>

        <div className="flex items-center gap-2">
          {/* Subtle Wispr Flow Shortcut Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-600 border border-slate-200"
            title="Focus this field and press your Wispr Flow desktop shortcut, or click Dictate."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Wispr Flow Shortcut
          </span>

          {/* Clean Dictate Trigger */}
          <button
            type="button"
            onClick={toggleListening}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
              isListening
                ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
            title="Toggle voice dictation into this field"
          >
            <svg
              className={`w-3.5 h-3.5 ${isListening ? "text-rose-600" : "text-slate-500"}`}
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
            {isListening ? "Listening..." : "Dictate"}
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
