"use client";

import React, { useState } from "react";
import { LearningPlan, SkillGap } from "@/types/pivot";

interface LearningPlanViewProps {
  plan: LearningPlan | null;
  previousPlan: LearningPlan | null;
  skillGaps: SkillGap[];
  targetRole: string;
  weeklyStudyHours: number;
  onStudyHoursChange: (hours: number) => void;
  onGeneratePlan: () => Promise<void>;
  onRecalibratePlan: () => Promise<void>;
  onToggleTask: (taskId: string) => void;
  isGenerating: boolean;
  isRecalibrating: boolean;
  errorMsg?: string;
}

export function LearningPlanView({
  plan,
  previousPlan,
  skillGaps,
  targetRole,
  weeklyStudyHours,
  onStudyHoursChange,
  onGeneratePlan,
  onRecalibratePlan,
  onToggleTask,
  isGenerating,
  isRecalibrating,
  errorMsg,
}: LearningPlanViewProps) {
  const [showComparison, setShowComparison] = useState(true);

  const completedCount = plan ? plan.weeks.filter((w) => w.completed).length : 0;
  const totalCount = plan ? plan.weeks.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Week-by-Week Learning Plan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured study plan organized around your identified skill gaps for {targetRole || "your target role"}.
            </p>
          </div>

          {/* Study Hours Selector */}
          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200 shrink-0">
            <label htmlFor="study-hours" className="text-xs font-semibold text-slate-700 pl-1">
              Weekly Hours:
            </label>
            <div className="flex items-center gap-1">
              {[5, 10, 15, 20].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => onStudyHoursChange(hrs)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    weeklyStudyHours === hrs
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {hrs}h
                </button>
              ))}
              <div className="flex items-center ml-1 border-l border-slate-300 pl-2">
                <input
                  id="study-hours"
                  type="number"
                  min={2}
                  max={60}
                  value={weeklyStudyHours}
                  onChange={(e) => onStudyHoursChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 px-1 py-0.5 rounded text-xs text-center border border-slate-300 bg-white font-mono text-slate-900"
                  title="Custom hours per week"
                />
                <span className="text-[11px] text-slate-500 ml-1">h/wk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button when no plan exists */}
        {!plan && (
          <div className="p-8 rounded-lg border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/40">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Ready to Generate Curriculum Schedule
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Creates a weekly roadmap addressing your {skillGaps.length} skill gap{skillGaps.length === 1 ? "" : "s"} at {weeklyStudyHours} study hours per week.
              </p>
            </div>
            <button
              type="button"
              disabled={isGenerating || skillGaps.length === 0}
              onClick={onGeneratePlan}
              className={`mt-2 py-2 px-5 rounded-lg font-bold text-xs text-white transition-all flex items-center gap-2 ${
                isGenerating || skillGaps.length === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] cursor-pointer shadow-xs"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Learning Plan with Gemini AI...</span>
                </>
              ) : (
                <span>Generate Week-by-Week Learning Plan</span>
              )}
            </button>
          </div>
        )}

        {/* Progress Tracker Bar (when plan exists) */}
        {plan && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">
                  Curriculum Progress:
                </span>
                <span className="font-semibold text-blue-700">
                  {completedCount} of {totalCount} weeks completed ({progressPercent}%)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Version {plan.version}
                </span>
              </div>

              {/* Recalibrate / Update plan option */}
              <div className="flex items-center gap-2">
                {previousPlan && (
                  <button
                    type="button"
                    onClick={() => setShowComparison(!showComparison)}
                    className="text-xs px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {showComparison ? "Hide Comparison" : "Compare with Previous Plan"}
                  </button>
                )}

                <button
                  type="button"
                  disabled={isRecalibrating}
                  onClick={onRecalibratePlan}
                  title="Recalculate remaining schedule based on current completed and pending tasks"
                  className={`py-1 px-3 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isRecalibrating
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-2xs"
                  }`}
                >
                  {isRecalibrating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Schedule...</span>
                    </>
                  ) : (
                    <span>Update Plan Based on Progress</span>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Check off tasks as you finish them. Click <strong>&ldquo;Update Plan Based on Progress&rdquo;</strong> to have Gemini re-adjust your remaining schedule around completed items.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Recalibration Summary Banner */}
      {plan?.recalibrationNotes && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900">
              Plan Recalibrated by Gemini AI (Version {plan.version})
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Adaptive Schedule
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed break-words">
            {plan.recalibrationNotes}
          </p>
        </div>
      )}

      {/* Side-by-Side Comparison View */}
      {plan && previousPlan && showComparison && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Plan Comparison: Version {previousPlan.version} vs Version {plan.version}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 break-words">
                Observe how the remaining schedule shifted in response to your completed milestones.
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-600 shrink-0">
              {plan.weeks.filter((w) => w.changeNote).length} adjustments made
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            {/* Left: Previous Plan */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Previous Plan (v{previousPlan.version})
                </span>
                <span className="text-[11px] text-slate-500 shrink-0">
                  {previousPlan.weeks.filter((w) => w.completed).length}/{previousPlan.weeks.length} completed
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {previousPlan.weeks.map((week) => (
                  <div
                    key={`prev-${week.id}`}
                    className={`p-2.5 rounded-lg border text-xs min-w-0 overflow-hidden ${
                      week.completed
                        ? "bg-slate-100/70 border-slate-200 text-slate-500"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between mb-1 gap-1 min-w-0">
                      <span className="font-bold break-words min-w-0 text-slate-900">
                        Week {week.weekNumber}: {week.title}
                      </span>
                      {week.completed && (
                        <span className="text-[10px] text-slate-500 font-semibold shrink-0">Done</span>
                      )}
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium break-words">
                      Skill: {week.skillDeveloped} ({week.estimatedHours}h)
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 break-words line-clamp-3">
                      {week.task}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Updated Plan */}
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/30 space-y-3 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Updated Plan (v{plan.version})
                </span>
                <span className="text-[11px] text-blue-700 font-medium shrink-0">
                  {completedCount}/{totalCount} completed
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {plan.weeks.map((week) => (
                  <div
                    key={`comp-${week.id}`}
                    className={`p-2.5 rounded-lg border text-xs min-w-0 overflow-hidden ${
                      week.completed
                        ? "bg-white/80 border-slate-200 text-slate-500"
                        : week.changeNote
                        ? "bg-white border-amber-300 text-slate-900 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between mb-1 gap-1 min-w-0">
                      <span className="font-bold break-words min-w-0 text-slate-900">
                        Week {week.weekNumber}: {week.title}
                      </span>
                      {week.changeNote ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          {week.changeNote}
                        </span>
                      ) : week.completed ? (
                        <span className="text-[10px] text-slate-500 font-semibold shrink-0">Completed</span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium break-words">
                      Skill: {week.skillDeveloped} ({week.estimatedHours}h)
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 break-words line-clamp-3">
                      {week.task}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Week-by-Week Interactive Plan Checklist */}
      {plan && (
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Weekly Milestones &amp; Action Items
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark tasks as completed. Gemini re-balances upcoming weeks when you click &ldquo;Update Plan Based on Progress&rdquo;.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {totalCount} Total Weeks
            </span>
          </div>

          <div className="space-y-3">
            {plan.weeks.map((week) => (
              <div
                key={week.id}
                className={`p-4 rounded-lg border transition-all ${
                  week.completed
                    ? "bg-slate-50/70 border-slate-200 opacity-80"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <label className="mt-0.5 flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={week.completed}
                      onChange={() => onToggleTask(week.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Week {week.weekNumber}
                        </span>
                        <h5
                          className={`text-sm font-bold ${
                            week.completed
                              ? "line-through text-slate-400"
                              : "text-slate-900"
                          }`}
                        >
                          {week.title}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2">
                        {week.changeNote && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {week.changeNote}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-mono">
                          {week.estimatedHours} hrs
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-xs leading-relaxed ${
                        week.completed
                          ? "text-slate-400"
                          : "text-slate-700"
                      }`}
                    >
                      {week.task}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-semibold text-slate-800">Skill Target:</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200">
                          {week.skillDeveloped}
                        </span>
                      </div>

                      {week.resourcesOrDeliverables && (
                        <div className="text-slate-500">
                          <span className="font-semibold text-slate-700">Deliverable:</span>{" "}
                          {week.resourcesOrDeliverables}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
