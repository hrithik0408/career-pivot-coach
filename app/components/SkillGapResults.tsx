"use client";

import React from "react";
import { ProfileMismatchNotice, SkillGapAnalysis } from "@/types/pivot";

interface SkillGapResultsProps {
  analysis: SkillGapAnalysis | null;
  isLoading: boolean;
  targetRole?: string;
  mismatchNotice?: ProfileMismatchNotice | null;
  onStartFreshDownstream?: () => void;
  onDismissMismatchNotice?: () => void;
}

export function SkillGapResults({
  analysis,
  isLoading,
  targetRole,
  mismatchNotice,
  onStartFreshDownstream,
  onDismissMismatchNotice,
}: SkillGapResultsProps) {
  if (isLoading) {
    return (
      <div className="p-10 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Evaluating Skill Overlap &amp; Trajectory Gaps...
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzing your resume against the target role requirements using Gemini AI.
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-10 rounded-xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-2 text-slate-500 bg-white">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          No Skill Gap Assessment Generated Yet
        </h3>
        <p className="text-xs max-w-sm text-slate-500">
          Enter your background, target role, and resume in Step 1 or select a demo sample profile, then generate your analysis.
        </p>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "High":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Downstream Profile Mismatch Choice Banner */}
      {mismatchNotice && (
        <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/90 shadow-xs space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              !
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                New Profile Analysis: Start Fresh Downstream?
              </h4>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                You just generated a skill gap analysis for <strong>{mismatchNotice.newRole}</strong>. However, your current Learning Plan and Mock Interview data belong to <strong>{mismatchNotice.previousRole}</strong>.
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Completed milestones, prior interview questions, and scores from {mismatchNotice.previousRole} will not be carried over to {mismatchNotice.newRole}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStartFreshDownstream}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Start Fresh Plan &amp; Interview for {mismatchNotice.newRole}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onDismissMismatchNotice}
              className="px-3.5 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-all cursor-pointer"
            >
              Keep Previous Plan as Archived Reference
            </button>
          </div>
        </div>
      )}

      {/* Profile Association & Model Notice */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900">Analyzed Target Role:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            {analysis.targetRole || targetRole || "Target Role"}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">
            <strong>Advisory Guidance:</strong> AI-evaluated skill alignment for coaching purposes. Not a guaranteed hiring outcome.
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 shrink-0">
          Engine: {analysis.modelUsed}
        </span>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Match Score */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Match Score
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {analysis.overallMatchScore}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                analysis.overallMatchScore >= 70
                  ? "bg-blue-600"
                  : analysis.overallMatchScore >= 45
                  ? "bg-amber-600"
                  : "bg-rose-600"
              }`}
              style={{ width: `${analysis.overallMatchScore}%` }}
            />
          </div>
        </div>

        {/* Feasibility */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pivot Feasibility
          </span>
          <div className="my-2">
            <span className="inline-flex px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {analysis.feasibilityRating} Feasibility
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Based on foundational competency overlap and role selectivity.
          </p>
        </div>

        {/* Estimated Timeline */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Timeline
          </span>
          <div className="my-2">
            <span className="text-base font-bold text-slate-900">
              {analysis.estimatedTimeline}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Recommended window for focused skill bridge projects.
          </p>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Strategic Overview &amp; Evaluation
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {analysis.summary}
        </p>
      </div>

      {/* Transferable Skills vs Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transferable Skills */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Transferable Strengths ({analysis.transferableSkills.length})
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified background competencies that directly translate to the target role.
            </p>
          </div>

          <div className="space-y-3 mt-1">
            {analysis.transferableSkills.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50"
              >
                <h5 className="text-xs font-bold text-slate-900 mb-1">
                  {item.skill}
                </h5>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                  {item.relevance}
                </p>
                <div className="text-[11px] p-2 rounded bg-white border border-slate-200 text-slate-800 leading-normal">
                  <span className="font-semibold text-slate-900">How to pitch:</span> &ldquo;{item.howToPitch}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Identified Skill Gaps ({analysis.skillGaps.length})
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Specific capability gaps to address before applying or interviewing.
            </p>
          </div>

          <div className="space-y-3 mt-1">
            {analysis.skillGaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h5 className="text-xs font-bold text-slate-900">
                    {gap.skill}
                  </h5>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(
                      gap.priority
                    )}`}
                  >
                    {gap.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                  {gap.description}
                </p>
                <div className="text-[11px] p-2 rounded bg-white border border-slate-200 text-slate-800 leading-normal">
                  <span className="font-semibold text-slate-900">Recommended action:</span> {gap.recommendedResourceOrProject}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Bridge Projects */}
      {analysis.bridgeProjects?.length > 0 && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Recommended Bridge Projects
          </h4>
          <p className="text-[11px] text-slate-500 mb-4">
            Concrete portfolio projects to demonstrate practical capability to hiring teams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.bridgeProjects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 flex flex-col justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1">
                    {proj.title}
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {proj.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                  {proj.demonstratedSkills.map((tag, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-slate-700 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Screening Questions */}
      {analysis.interviewQuestions?.length > 0 && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Core Technical Screening Questions to Prepare
          </h4>
          <p className="text-[11px] text-slate-500 mb-3">
            Expect these prompts during initial recruiter and engineering manager screens.
          </p>

          <div className="space-y-2">
            {analysis.interviewQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 flex items-start gap-2.5"
              >
                <span className="text-blue-700 font-bold shrink-0">
                  Q{idx + 1}:
                </span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
