"use client";

import React from "react";
import { PRESET_JOBS } from "@/data/presets";
import { JobPreset } from "@/types/pivot";

interface JobPresetsProps {
  onSelectPreset: (preset: JobPreset) => void;
  selectedPresetId?: string;
}

export function JobPresets({ onSelectPreset, selectedPresetId }: JobPresetsProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Sample Pivot Trajectories
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Demo Examples
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Load a pre-configured sample profile to explore the analysis, study plan, and mock interview tools.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {PRESET_JOBS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <div
              key={preset.id}
              className={`p-4 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {preset.company}
                  </span>
                  <a
                    href={preset.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                    title={`View listing details from ${preset.sourceName}`}
                  >
                    <span>Listing source</span>
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {preset.targetRole}
                </h4>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {preset.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`mt-4 w-full py-1.5 px-3 rounded text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {isSelected ? "Active Sample Profile" : "Load Sample Profile"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
