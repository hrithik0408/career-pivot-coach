"use client";

import React, { useState, useRef } from "react";

interface ResumeUploadProps {
  onTextExtracted: (text: string, filename: string) => void;
  currentResumeLength: number;
}

export function ResumeUpload({
  onTextExtracted,
  currentResumeLength,
}: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<{
    filename: string;
    wordCount: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage("");
    setSuccessInfo(null);

    const name = file.name.toLowerCase();
    const isDoc = name.endsWith(".doc");
    const isDocx = name.endsWith(".docx");
    const isPdf = name.endsWith(".pdf");
    const isTxt = name.endsWith(".txt") || name.endsWith(".md");

    // Clear client-side pre-check for legacy .doc
    if (isDoc) {
      setErrorMessage(
        "Legacy Word (.doc) format is not supported. Please save your resume as modern .docx or .pdf, or paste your text directly."
      );
      return;
    }

    if (!isPdf && !isDocx && !isTxt) {
      setErrorMessage(
        "Unsupported file type. Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt)."
      );
      return;
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit. Please upload a smaller file or copy and paste your text directly.`
      );
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            "Unable to extract text from document. Scanned image-only PDFs and legacy .doc files are not supported."
        );
        return;
      }

      if (data.text) {
        onTextExtracted(data.text, data.filename || file.name);
        setSuccessInfo({
          filename: data.filename || file.name,
          wordCount: data.wordCount || 0,
        });
      } else {
        setErrorMessage(
          "No text was extracted. The document may be empty or an image-only scan. Scanned PDFs are not supported."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMessage(
        `Failed to upload file: ${msg}. Please check your connection or paste your resume text directly.`
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2.5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-600">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs">
            {isUploading ? (
              <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>

          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-800">
              {isUploading ? (
                <span className="text-blue-700 font-medium">Extracting text from resume...</span>
              ) : (
                <span>
                  <span className="text-blue-700 font-bold hover:underline">Click to upload</span> or drag and drop your resume
                </span>
              )}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supports PDF (.pdf), Word (.docx), or Text (.txt) up to 5MB.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-2">
          Notice: Scanned image-only PDFs and legacy .doc files are not supported.
        </p>
      </div>

      {/* Success banner */}
      {successInfo && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/90 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="truncate">
              Extracted <strong>{successInfo.wordCount} words</strong> from{" "}
              <span className="font-mono text-[11px] font-semibold">{successInfo.filename}</span>. You can review and edit below.
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSuccessInfo(null);
            }}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-1.5 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start justify-between gap-2 text-xs text-rose-900">
          <div className="flex items-start gap-2 min-w-0">
            <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="break-words leading-relaxed">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setErrorMessage("");
            }}
            className="text-rose-700 hover:text-rose-950 text-xs font-bold px-1.5 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
