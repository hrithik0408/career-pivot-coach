"use client";

import React, { useState, useEffect, useRef } from "react";
import { WisprInput } from "@/app/components/WisprInput";
import { JobPresets } from "@/app/components/JobPresets";
import { SkillGapResults } from "@/app/components/SkillGapResults";
import { LearningPlanView } from "@/app/components/LearningPlanView";
import { MockInterviewView } from "@/app/components/MockInterviewView";
import { ApplicationTrackerView, SAMPLE_APPLICATIONS } from "@/app/components/ApplicationTrackerView";
import { ResumeUpload } from "@/app/components/ResumeUpload";
import {
  InterviewEvaluation,
  JobApplication,
  JobPreset,
  LearningPlan,
  MockInterviewQuestion,
  SkillGapAnalysis,
} from "@/types/pivot";

const STORAGE_KEY = "career_pivot_coach_v1";

type SectionKey = "profile" | "analysis" | "plan" | "interview" | "tracker";

interface SectionMeta {
  id: SectionKey;
  label: string;
  stepNumber: string;
  description: string;
}

const SECTIONS: SectionMeta[] = [
  {
    id: "profile",
    label: "Profile and Job",
    stepNumber: "Step 1",
    description: "Target role, background, job description, and resume",
  },
  {
    id: "analysis",
    label: "Skill Gap",
    stepNumber: "Step 2",
    description: "Evaluated competency match score and identified gaps",
  },
  {
    id: "plan",
    label: "Learning Plan",
    stepNumber: "Step 3",
    description: "Week-by-week study milestones and schedule diffs",
  },
  {
    id: "interview",
    label: "Mock Interview",
    stepNumber: "Step 4",
    description: "Role-specific interview rehearsal with rubric feedback",
  },
  {
    id: "tracker",
    label: "Application",
    stepNumber: "Step 5",
    description: "Application tracking and conversion pattern observations",
  },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const [viewMode, setViewMode] = useState<"tabbed" | "all">("tabbed");

  const [background, setBackground] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [previousLearningPlan, setPreviousLearningPlan] = useState<LearningPlan | null>(null);
  const [weeklyStudyHours, setWeeklyStudyHours] = useState<number>(10);
  const [interviewQuestions, setInterviewQuestions] = useState<MockInterviewQuestion[]>([]);
  const [selectedInterviewQuestion, setSelectedInterviewQuestion] = useState<MockInterviewQuestion | null>(null);
  const [interviewUserAnswer, setInterviewUserAnswer] = useState<string>("");
  const [interviewEvaluation, setInterviewEvaluation] = useState<InterviewEvaluation | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isRecalibratingPlan, setIsRecalibratingPlan] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluatingInterview, setIsEvaluatingInterview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [planErrorMsg, setPlanErrorMsg] = useState("");
  const [interviewErrorMsg, setInterviewErrorMsg] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const contentTopRef = useRef<HTMLDivElement>(null);

  // Load persisted inputs from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.background) setBackground(parsed.background);
        if (parsed.targetRole) setTargetRole(parsed.targetRole);
        if (parsed.resumeText) setResumeText(parsed.resumeText);
        if (parsed.jobDescription) setJobDescription(parsed.jobDescription);
        if (parsed.selectedPresetId) setSelectedPresetId(parsed.selectedPresetId);
        if (parsed.analysis) setAnalysis(parsed.analysis);
        if (parsed.learningPlan) setLearningPlan(parsed.learningPlan);
        if (parsed.previousLearningPlan) setPreviousLearningPlan(parsed.previousLearningPlan);
        if (parsed.weeklyStudyHours) setWeeklyStudyHours(parsed.weeklyStudyHours);
        if (parsed.interviewQuestions) setInterviewQuestions(parsed.interviewQuestions);
        if (parsed.selectedInterviewQuestion) setSelectedInterviewQuestion(parsed.selectedInterviewQuestion);
        if (parsed.interviewUserAnswer) setInterviewUserAnswer(parsed.interviewUserAnswer);
        if (parsed.interviewEvaluation) setInterviewEvaluation(parsed.interviewEvaluation);
        if (parsed.applications) setApplications(parsed.applications);
        if (parsed.activeSection && ["profile", "analysis", "plan", "interview", "tracker"].includes(parsed.activeSection)) {
          setActiveSection(parsed.activeSection);
        }
      }
    } catch (e) {
      console.warn("Could not load saved data from localStorage", e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      const state = {
        background,
        targetRole,
        resumeText,
        jobDescription,
        selectedPresetId,
        analysis,
        learningPlan,
        previousLearningPlan,
        weeklyStudyHours,
        interviewQuestions,
        selectedInterviewQuestion,
        interviewUserAnswer,
        interviewEvaluation,
        applications,
        activeSection,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setIsSaved(true);
      const timer = setTimeout(() => setIsSaved(false), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn("Could not write to localStorage", e);
    }
  }, [
    background,
    targetRole,
    resumeText,
    jobDescription,
    selectedPresetId,
    analysis,
    learningPlan,
    previousLearningPlan,
    weeklyStudyHours,
    interviewQuestions,
    selectedInterviewQuestion,
    interviewUserAnswer,
    interviewEvaluation,
    applications,
    activeSection,
    isClient,
  ]);

  const navigateTo = (section: SectionKey) => {
    setActiveSection(section);
    if (contentTopRef.current) {
      contentTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectPreset = (preset: JobPreset) => {
    setSelectedPresetId(preset.id);
    setTargetRole(preset.targetRole);
    setBackground(preset.sampleBackground);
    setResumeText(preset.sampleResume);
    setJobDescription(preset.sampleJobDescription);
    setErrorMsg("");
  };

  const handleClear = () => {
    if (confirm("Reset and clear all inputs, plans, and applications?")) {
      setBackground("");
      setTargetRole("");
      setResumeText("");
      setJobDescription("");
      setSelectedPresetId(undefined);
      setAnalysis(null);
      setLearningPlan(null);
      setPreviousLearningPlan(null);
      setWeeklyStudyHours(10);
      setInterviewQuestions([]);
      setSelectedInterviewQuestion(null);
      setInterviewUserAnswer("");
      setInterviewEvaluation(null);
      setApplications([]);
      setErrorMsg("");
      setPlanErrorMsg("");
      setInterviewErrorMsg("");
      setActiveSection("profile");
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleAnalyze = async () => {
    if (!background.trim() || !targetRole.trim()) {
      setErrorMsg("Please provide at least your current career background and target role.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          background,
          targetRole,
          resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze skill gap.");
      }

      setAnalysis(data);
      navigateTo("analysis");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!targetRole.trim() || !analysis || !analysis.skillGaps || analysis.skillGaps.length === 0) {
      setPlanErrorMsg("Please generate your skill gap analysis first to create a tailored curriculum.");
      return;
    }

    setPlanErrorMsg("");
    setIsGeneratingPlan(true);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          targetRole,
          background,
          skillGaps: analysis.skillGaps,
          weeklyStudyHours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate learning plan.");
      }

      setLearningPlan(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate learning plan.";
      setPlanErrorMsg(message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleRecalibratePlan = async () => {
    if (!learningPlan || !targetRole.trim() || !analysis) {
      return;
    }

    setPlanErrorMsg("");
    setIsRecalibratingPlan(true);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recalibrate",
          targetRole,
          background,
          skillGaps: analysis.skillGaps,
          weeklyStudyHours,
          currentPlan: learningPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to recalibrate plan.");
      }

      setPreviousLearningPlan(learningPlan);
      setLearningPlan(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to recalibrate plan.";
      setPlanErrorMsg(message);
    } finally {
      setIsRecalibratingPlan(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!learningPlan) return;
    const updatedWeeks = learningPlan.weeks.map((w) =>
      w.id === taskId ? { ...w, completed: !w.completed } : w
    );
    setLearningPlan({
      ...learningPlan,
      weeks: updatedWeeks,
    });
  };

  const handleGenerateInterviewQuestions = async () => {
    if (!targetRole.trim() || !analysis || !analysis.skillGaps || analysis.skillGaps.length === 0) {
      setInterviewErrorMsg("Please generate your skill gap analysis first to create tailored interview questions.");
      return;
    }

    setInterviewErrorMsg("");
    setIsGeneratingQuestions(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-question",
          targetRole,
          background,
          skillGaps: analysis.skillGaps,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate interview questions.");
      }

      setInterviewQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setSelectedInterviewQuestion(data.questions[0]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate interview questions.";
      setInterviewErrorMsg(message);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitInterviewAnswer = async () => {
    if (!selectedInterviewQuestion || !interviewUserAnswer.trim()) {
      setInterviewErrorMsg("Please type or dictate your answer before submitting.");
      return;
    }

    setInterviewErrorMsg("");
    setIsEvaluatingInterview(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate-answer",
          targetRole,
          background,
          question: selectedInterviewQuestion.question,
          targetSkillGap: selectedInterviewQuestion.targetSkillGap,
          userAnswer: interviewUserAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate answer.");
      }

      setInterviewEvaluation(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to evaluate interview answer.";
      setInterviewErrorMsg(message);
    } finally {
      setIsEvaluatingInterview(false);
    }
  };

  const handleAddApplication = (newApp: Omit<JobApplication, "id">) => {
    const app: JobApplication = {
      ...newApp,
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setApplications((prev) => [app, ...prev]);
  };

  const handleUpdateApplication = (updatedApp: JobApplication) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
    );
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const handleLoadSampleApplications = () => {
    setApplications(SAMPLE_APPLICATIONS);
  };

  const handleClearApplications = () => {
    if (confirm("Clear all recorded job applications?")) {
      setApplications([]);
    }
  };

  const getSectionBadge = (sectionId: SectionKey) => {
    switch (sectionId) {
      case "profile":
        if (targetRole && (resumeText || background)) {
          return { text: "Configured", color: "bg-slate-100 text-slate-700 border-slate-200" };
        }
        return null;
      case "analysis":
        if (analysis) {
          return { text: `${analysis.overallMatchScore}% Match`, color: "bg-blue-50 text-blue-700 border-blue-200" };
        }
        return null;
      case "plan":
        if (learningPlan) {
          const done = learningPlan.weeks.filter((w) => w.completed).length;
          return { text: `${done}/${learningPlan.weeks.length} Wks`, color: "bg-slate-100 text-slate-700 border-slate-200" };
        }
        return null;
      case "interview":
        if (interviewEvaluation) {
          return { text: `${interviewEvaluation.totalScore}% Scored`, color: "bg-blue-50 text-blue-700 border-blue-200" };
        }
        if (interviewQuestions.length > 0) {
          return { text: `${interviewQuestions.length} Qs`, color: "bg-slate-100 text-slate-700 border-slate-200" };
        }
        return null;
      case "tracker":
        if (applications.length > 0) {
          return { text: `${applications.length} Logged`, color: "bg-slate-100 text-slate-700 border-slate-200" };
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Compact Branded Desktop Header */}
      <header className="border-b border-slate-200/90 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-none block">
                Career Pivot Coach
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Professional Career Transition Platform
              </span>
            </div>
          </div>

          {/* Simple Navigation for the Five Existing Sections */}
          <nav className="hidden md:flex items-center gap-1">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              const badge = getSectionBadge(sec.id);

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => navigateTo(sec.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-bold border border-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span>{sec.label}</span>
                  {badge && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${badge.color}`}>
                      {badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Utility Controls */}
          <div className="flex items-center gap-2.5">
            {isSaved && (
              <span className="text-[11px] text-emerald-700 hidden sm:flex items-center gap-1 font-medium">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Saved</span>
              </span>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("tabbed")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  viewMode === "tabbed"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Focus on one section at a time"
              >
                Focused
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  viewMode === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="View all sections stacked"
              >
                All Sections
              </button>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-xs px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden border-t border-slate-100 overflow-x-auto bg-slate-50/70 px-4 py-1.5 flex gap-1">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => navigateTo(sec.id)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? "bg-white text-slate-900 font-bold border border-slate-200 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main ref={contentTopRef} className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Subtle Speech-to-Text Guidance Banner */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900">
                Speech-to-Text Enabled
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Focus on any text field and use your <strong>Wispr Flow desktop shortcut</strong>, or select the Dictate button to speak your thoughts naturally.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
            Voice Dictation Ready
          </span>
        </div>

        {/* =========================================================================
            SECTION 1: PROFILE AND JOB
            ========================================================================= */}
        {(viewMode === "all" || activeSection === "profile") && (
          <section id="section-profile" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Step 1: Profile and Job
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify your background, target position, and current resume. Upload a document (PDF, DOCX, TXT) or type/dictate directly.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Step 1 of 5
              </span>
            </div>

            {/* Sample Pivot Profiles (Demo Examples) */}
            <JobPresets
              onSelectPreset={handleSelectPreset}
              selectedPresetId={selectedPresetId}
            />

            {/* Core Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Target Role, Background, Resume */}
              <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Candidate Background &amp; Target Role
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define your current experience and the specific role you want to pivot into.
                  </p>
                </div>

                <WisprInput
                  id="target-role"
                  label="Target Role Title"
                  value={targetRole}
                  onChange={setTargetRole}
                  placeholder="e.g. AI Applications Engineer, Technical Product Manager, Staff Systems Engineer"
                  isTextarea={false}
                  helpText="Specify seniority and technical domain."
                />

                <WisprInput
                  id="career-background"
                  label="Career Background Summary"
                  value={background}
                  onChange={setBackground}
                  rows={4}
                  isTextarea={true}
                  placeholder="Summarize your professional experience, core technologies, architectures, and domain accomplishments..."
                  helpText="Speak naturally using your Wispr Flow desktop shortcut or type your summary."
                />

                {/* Resume Upload & Review Area */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Resume Text &amp; Document Upload
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      PDF, DOCX, TXT
                    </span>
                  </div>

                  <ResumeUpload
                    onTextExtracted={(text) => {
                      setResumeText(text);
                    }}
                    currentResumeLength={resumeText.length}
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Editable Resume Content (Review / Edit):
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {resumeText.split(/\s+/).filter(Boolean).length} words • {resumeText.length} chars
                      </span>
                    </div>

                    <textarea
                      rows={6}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Extracted text from uploaded resume appears here for your review. You can also paste text directly or dictate updates using your Wispr Flow desktop shortcut..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs font-mono leading-relaxed transition-colors shadow-2xs"
                    />

                    <p className="text-[11px] text-slate-500 leading-normal">
                      Focus on this field and press your Wispr Flow shortcut to add recent projects or context.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Target Job Description */}
              <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-5">
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Target Job Description (Provided by User)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paste the job description listing to benchmark your profile against.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900">
                        Job Description Text
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {jobDescription.length} characters
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description (responsibilities, required qualifications, tech stack, company mission)..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs font-mono leading-relaxed transition-colors shadow-2xs"
                    />
                    <p className="text-[11px] text-slate-500">
                      The AI coach evaluates stated requirements against your documented profile to identify gaps.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    {errorMsg}
                  </div>
                )}

                {/* Action Trigger */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleAnalyze}
                    className={`w-full py-2.5 px-5 rounded-lg font-bold text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isLoading
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Evaluating Trajectory &amp; Gaps with Gemini AI...</span>
                      </>
                    ) : (
                      <span>Generate Skill Gap Analysis</span>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    Takes ~3 seconds. Upon completion, you will be guided to Step 2.
                  </p>
                </div>
              </div>
            </div>

            {viewMode === "tabbed" && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo("analysis")}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Next: View Skill Gap</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            SECTION 2: SKILL GAP
            ========================================================================= */}
        {(viewMode === "all" || activeSection === "analysis") && (
          <section id="section-analysis" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Step 2: Skill Gap Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Objective assessment of transferable strengths and identified skill gaps for {targetRole || "your target role"}.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Step 2 of 5
              </span>
            </div>

            {!analysis && !isLoading ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-3 bg-white">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    No Skill Gap Assessment Generated Yet
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Enter your target role and resume in Step 1, or click below to return and generate your analysis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo("profile")}
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  ← Go to Step 1: Profile and Job
                </button>
              </div>
            ) : (
              <>
                <SkillGapResults analysis={analysis} isLoading={isLoading} />

                {viewMode === "tabbed" && analysis && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() => navigateTo("profile")}
                      className="text-xs text-slate-600 hover:underline cursor-pointer"
                    >
                      ← Back to Profile and Job
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo("plan")}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Step 3: Learning Plan</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* =========================================================================
            SECTION 3: LEARNING PLAN
            ========================================================================= */}
        {(viewMode === "all" || activeSection === "plan") && (
          <section id="section-plan" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Step 3: Learning Plan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Week-by-week curriculum tailored to your committed study hours and identified skill gaps.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Step 3 of 5
              </span>
            </div>

            <LearningPlanView
              plan={learningPlan}
              previousPlan={previousLearningPlan}
              skillGaps={analysis?.skillGaps || []}
              targetRole={targetRole || "Target Role"}
              weeklyStudyHours={weeklyStudyHours}
              onStudyHoursChange={setWeeklyStudyHours}
              onGeneratePlan={handleGeneratePlan}
              onRecalibratePlan={handleRecalibratePlan}
              onToggleTask={handleToggleTask}
              isGenerating={isGeneratingPlan}
              isRecalibrating={isRecalibratingPlan}
              errorMsg={planErrorMsg}
            />

            {viewMode === "tabbed" && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo("analysis")}
                  className="text-xs text-slate-600 hover:underline cursor-pointer"
                >
                  ← Back to Skill Gap
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("interview")}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Proceed to Step 4: Mock Interview</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            SECTION 4: MOCK INTERVIEW
            ========================================================================= */}
        {(viewMode === "all" || activeSection === "interview") && (
          <section id="section-interview" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Step 4: Mock Interview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Role-specific scenario questions with Wispr Flow speech dictation and rubric-based feedback.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Step 4 of 5
              </span>
            </div>

            <MockInterviewView
              targetRole={targetRole || "Target Role"}
              skillGaps={analysis?.skillGaps || []}
              background={background}
              questions={interviewQuestions}
              selectedQuestion={selectedInterviewQuestion}
              userAnswer={interviewUserAnswer}
              evaluation={interviewEvaluation}
              onSelectQuestion={setSelectedInterviewQuestion}
              onAnswerChange={setInterviewUserAnswer}
              onGenerateQuestions={handleGenerateInterviewQuestions}
              onSubmitAnswer={handleSubmitInterviewAnswer}
              isGeneratingQuestions={isGeneratingQuestions}
              isEvaluating={isEvaluatingInterview}
              errorMsg={interviewErrorMsg}
            />

            {viewMode === "tabbed" && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo("plan")}
                  className="text-xs text-slate-600 hover:underline cursor-pointer"
                >
                  ← Back to Learning Plan
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("tracker")}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Proceed to Step 5: Application</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            SECTION 5: APPLICATION
            ========================================================================= */}
        {(viewMode === "all" || activeSection === "tracker") && (
          <section id="section-tracker" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Step 5: Application
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record job search submissions, isolate in-review applications, and observe category conversion patterns.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Step 5 of 5
              </span>
            </div>

            <ApplicationTrackerView
              applications={applications}
              onAddApplication={handleAddApplication}
              onUpdateApplication={handleUpdateApplication}
              onDeleteApplication={handleDeleteApplication}
              onLoadSampleData={handleLoadSampleApplications}
              onClearAll={handleClearApplications}
            />

            {viewMode === "tabbed" && (
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo("interview")}
                  className="text-xs text-slate-600 hover:underline cursor-pointer"
                >
                  ← Back to Mock Interview
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("profile")}
                  className="text-xs text-blue-700 hover:underline font-bold cursor-pointer"
                >
                  Return to Step 1: Profile and Job ↑
                </button>
              </div>
            )}
          </section>
        )}

        {/* Platform Information & Privacy Footer */}
        <footer className="mt-12 p-6 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 space-y-3 shadow-2xs">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Platform Privacy &amp; Data Security Assurance
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your credentials and API keys are stored securely server-side in your local environment file and are never transmitted to client browsers. Career assessments, practice scores, and transition roadmaps are intended as advisory coaching tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="block text-slate-800 mb-1">
                Local Environment Configuration:
              </strong>
              <p className="text-slate-500">
                Configured securely in <code className="font-mono text-slate-800">.env.local</code>. Gemini reasoning models process evaluations server-side with failover resilience.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="block text-slate-800 mb-1">
                Supported Resume Document Formats:
              </strong>
              <p className="text-slate-500">
                Modern PDF (<code className="font-mono text-slate-800">.pdf</code>), Word (<code className="font-mono text-slate-800">.docx</code>), or plain text (<code className="font-mono text-slate-800">.txt</code>) up to 5MB. Note: Legacy .doc binary files and scanned image-only PDFs are not supported.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
