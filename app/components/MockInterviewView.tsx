"use client";

import React, { useState } from "react";
import { InterviewEvaluation, MockInterviewQuestion, SkillGap } from "@/types/pivot";
import { WisprInput } from "@/app/components/WisprInput";

interface MockInterviewViewProps {
  targetRole: string;
  skillGaps: SkillGap[];
  background: string;
  questions: MockInterviewQuestion[];
  selectedQuestion: MockInterviewQuestion | null;
  userAnswer: string;
  evaluation: InterviewEvaluation | null;
  interviewTargetRole?: string;
  isProfileMismatch?: boolean;
  onSelectQuestion: (question: MockInterviewQuestion) => void;
  onAnswerChange: (answer: string) => void;
  onGenerateQuestions: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
  onStartFreshInterview?: () => void;
  isGeneratingQuestions: boolean;
  isEvaluating: boolean;
  errorMsg?: string;
}

export function MockInterviewView({
  targetRole,
  skillGaps,
  questions,
  selectedQuestion,
  userAnswer,
  evaluation,
  interviewTargetRole,
  isProfileMismatch,
  onSelectQuestion,
  onAnswerChange,
  onGenerateQuestions,
  onSubmitAnswer,
  onStartFreshInterview,
  isGeneratingQuestions,
  isEvaluating,
  errorMsg,
}: MockInterviewViewProps) {
  const isMismatch = Boolean(
    isProfileMismatch ||
    (interviewTargetRole && targetRole && interviewTargetRole.trim().toLowerCase() !== targetRole.trim().toLowerCase() && (questions.length > 0 || evaluation))
  );
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Advanced":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "Intermediate":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Practice Feedback Disclaimer */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Role-Specific Mock Interview Practice
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Practice answering questions tailored to your target role ({targetRole || "Target Role"}) and identified skill gaps.
            </p>
          </div>

          {/* Mandatory Practice Feedback Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Practice Feedback Only — Not a Hiring Prediction</span>
          </div>
        </div>

        {/* Profile Mismatch Warning Banner */}
        {isMismatch && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/90 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                !
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  Interview Prompts &amp; Scores Belong to Previous Profile: {interviewTargetRole}
                </h4>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  These practice questions and evaluation scores belong to <strong>{interviewTargetRole}</strong>. Your current active analysis is for <strong>{targetRole}</strong>.
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Prior questions, answers, and scores will not be counted toward {targetRole}. Synthesize fresh questions below.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isGeneratingQuestions || skillGaps.length === 0}
                onClick={onStartFreshInterview || onGenerateQuestions}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isGeneratingQuestions ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Prompts for {targetRole}...</span>
                  </>
                ) : (
                  <span>Generate Fresh Questions for {targetRole}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Generate / Refresh Questions Action */}
        {questions.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/40">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Ready to Generate Interview Practice Prompts
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Gemini AI will synthesize questions targeting your {skillGaps.length} skill gap{skillGaps.length === 1 ? "" : "s"} for {targetRole}.
              </p>
            </div>
            <button
              type="button"
              disabled={isGeneratingQuestions || skillGaps.length === 0}
              onClick={onGenerateQuestions}
              className={`mt-2 py-2 px-5 rounded-lg font-bold text-xs text-white transition-all flex items-center gap-2 ${
                isGeneratingQuestions || skillGaps.length === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] cursor-pointer shadow-xs"
              }`}
            >
              {isGeneratingQuestions ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Interview Prompts...</span>
                </>
              ) : (
                <span>Generate Tailored Questions ({targetRole})</span>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Select a Question to Practice:
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Role: {interviewTargetRole || targetRole}
                </span>
              </div>
              <button
                type="button"
                disabled={isGeneratingQuestions}
                onClick={onStartFreshInterview || onGenerateQuestions}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>{isGeneratingQuestions ? "Regenerating..." : isMismatch ? `Generate Fresh for ${targetRole}` : "Regenerate Questions"}</span>
              </button>
            </div>

            {/* Question Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {questions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onSelectQuestion(q)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[130px]">
                          {q.targetSkillGap}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-3 leading-snug">
                        {q.question}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700">
                      {isSelected ? "Currently Selected" : "Practice This Prompt →"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Question Details Banner */}
        {selectedQuestion && (
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Interview Prompt
              </span>
              <span className="text-[11px] text-slate-500">
                Evaluating: <strong>{selectedQuestion.targetSkillGap}</strong>
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              &ldquo;{selectedQuestion.question}&rdquo;
            </p>
            {selectedQuestion.context && (
              <p className="text-xs text-slate-600 leading-normal">
                <span className="font-semibold text-slate-700">Context:</span> {selectedQuestion.context}
              </p>
            )}
          </div>
        )}

        {/* Answer Input Area using Wispr Flow */}
        {selectedQuestion && (
          <div className="space-y-3 pt-2">
            <WisprInput
              id="interview-answer"
              label="Your Spoken or Written Response"
              value={userAnswer}
              onChange={onAnswerChange}
              rows={6}
              isTextarea={true}
              placeholder="Speak your response using your Wispr Flow desktop shortcut, or type your answer here..."
              helpText="Focus this field and press your Wispr Flow shortcut to dictate naturally, or click the Dictate button above."
            />

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isEvaluating || !userAnswer.trim()}
                onClick={onSubmitAnswer}
                className={`py-2 px-5 rounded-lg font-bold text-xs text-white transition-all flex items-center gap-2 ${
                  isEvaluating || !userAnswer.trim()
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] cursor-pointer shadow-xs"
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Response with Gemini Rubric...</span>
                  </>
                ) : (
                  <span>Submit Answer for Feedback</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rubric Evaluation Results Card */}
      {evaluation && (
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-6">
          {/* Header Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Rubric Assessment
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Role: {evaluation.targetRole || interviewTargetRole || targetRole}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Practice Feedback
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Practice Score: {evaluation.totalScore} / 100
              </h4>
            </div>

            <div className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-center shrink-0">
              <span className="text-lg font-extrabold text-slate-900 block leading-tight">
                {evaluation.totalScore}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Practice Rating
              </span>
            </div>
          </div>

          {/* Prominent Practice Disclaimer */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-700 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-0.5">
              <strong className="font-semibold text-slate-900">Coaching Disclaimer:</strong>
              <p className="text-[11px] leading-relaxed text-slate-600">
                This score is generated as a formative learning feedback tool to identify gap areas in your technical narrative. It is strictly a rehearsal exercise and <strong>not an official hiring prediction or guarantee of interview success</strong>.
              </p>
            </div>
          </div>

          {/* Criterion-wise Scoring Grid */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Rubric Dimension Breakdown (25 pts each)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.criteria.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {c.name}
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {c.score} / {c.maxScore}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.score >= 20 ? "bg-blue-600" : c.score >= 15 ? "bg-amber-600" : "bg-rose-600"
                      }`}
                      style={{ width: `${(c.score / c.maxScore) * 100}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {c.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Actionable Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Strengths Highlighted
              </h5>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Feedback */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Areas for Improvement
              </h5>
              <ul className="space-y-1.5">
                {evaluation.actionableFeedback.map((f, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 font-bold shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improved Model Answer Snippet */}
          {evaluation.improvedAnswerSnippet && (
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Exemplary Response Framing
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Staff / Senior Level Benchmark
                </span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                {evaluation.improvedAnswerSnippet}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
