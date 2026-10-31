"use client";

import React, { useState, useMemo } from "react";
import {
  ApplicationOutcome,
  CategoryOutcomeStats,
  JobApplication,
} from "@/types/pivot";

export const SAMPLE_APPLICATIONS: JobApplication[] = [
  {
    id: "sample-1",
    company: "Scale AI",
    role: "AI Solutions Architect",
    roleCategory: "AI Solutions Engineering",
    applicationDate: "2026-10-15",
    outcome: "interview",
    notes: "Passed recruiter screen. Recruiter emphasized customer engineering track record.",
    isSampleData: true,
  },
  {
    id: "sample-2",
    company: "Databricks",
    role: "Enterprise Solutions Architect",
    roleCategory: "AI Solutions Engineering",
    applicationDate: "2026-10-18",
    outcome: "interview",
    notes: "System design assessment on RAG and vector retrieval.",
    isSampleData: true,
  },
  {
    id: "sample-3",
    company: "Anthropic",
    role: "Partner Solutions Engineer",
    roleCategory: "AI Solutions Engineering",
    applicationDate: "2026-10-22",
    outcome: "interview",
    notes: "Take-home API evaluation passed.",
    isSampleData: true,
  },
  {
    id: "sample-4",
    company: "Snowflake",
    role: "AI Specialist",
    roleCategory: "AI Solutions Engineering",
    applicationDate: "2026-10-28",
    outcome: "applied",
    notes: "Applied via referral. Currently in review (pending).",
    isSampleData: true,
  },
  {
    id: "sample-5",
    company: "OpenAI",
    role: "Forward Deployed Engineer",
    roleCategory: "AI Solutions Engineering",
    applicationDate: "2026-10-10",
    outcome: "rejected",
    notes: "Screened out at resume review.",
    isSampleData: true,
  },
  {
    id: "sample-6",
    company: "Meta",
    role: "Research Scientist, Generative AI",
    roleCategory: "Frontier ML Research",
    applicationDate: "2026-10-08",
    outcome: "rejected",
    notes: "Role requires PhD in machine learning or relevant publication record.",
    isSampleData: true,
  },
  {
    id: "sample-7",
    company: "Google DeepMind",
    role: "Research Engineer",
    roleCategory: "Frontier ML Research",
    applicationDate: "2026-10-12",
    outcome: "rejected",
    notes: "Heavy emphasis on core mathematical ML formalisms.",
    isSampleData: true,
  },
  {
    id: "sample-8",
    company: "Figma",
    role: "Technical Product Manager, AI Platforms",
    roleCategory: "Technical Product Management",
    applicationDate: "2026-10-05",
    outcome: "no_response",
    notes: "Cold portal submission over 3 weeks ago.",
    isSampleData: true,
  },
  {
    id: "sample-9",
    company: "Notion",
    role: "Product Manager, AI Workflows",
    roleCategory: "Technical Product Management",
    applicationDate: "2026-10-12",
    outcome: "no_response",
    notes: "No automated update received.",
    isSampleData: true,
  },
  {
    id: "sample-10",
    company: "Linear",
    role: "Staff Product Manager",
    roleCategory: "Technical Product Management",
    applicationDate: "2026-10-19",
    outcome: "no_response",
    notes: "No outreach after 2 weeks.",
    isSampleData: true,
  },
  {
    id: "sample-11",
    company: "Retool",
    role: "Product Manager, Developer Platform",
    roleCategory: "Technical Product Management",
    applicationDate: "2026-10-25",
    outcome: "rejected",
    notes: "Recruiter noted prior PM job title requirement.",
    isSampleData: true,
  },
];

interface ApplicationTrackerViewProps {
  applications: JobApplication[];
  onAddApplication: (app: Omit<JobApplication, "id">) => void;
  onUpdateApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
  onLoadSampleData: () => void;
  onClearAll: () => void;
}

export function ApplicationTrackerView({
  applications,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
  onLoadSampleData,
  onClearAll,
}: ApplicationTrackerViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterOutcome, setFilterOutcome] = useState<string>("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form Fields
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formOutcome, setFormOutcome] = useState<ApplicationOutcome>("applied");
  const [formNotes, setFormNotes] = useState("");

  const resetForm = () => {
    setFormCompany("");
    setFormRole("");
    setFormCategory("");
    setFormDate("");
    setFormOutcome("applied");
    setFormNotes("");
    setEditingApp(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setFormDate(new Date().toISOString().split("T")[0]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (app: JobApplication) => {
    setEditingApp(app);
    setFormCompany(app.company);
    setFormRole(app.role);
    setFormCategory(app.roleCategory);
    setFormDate(app.applicationDate);
    setFormOutcome(app.outcome);
    setFormNotes(app.notes || "");
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim() || !formCategory.trim()) return;

    if (editingApp) {
      onUpdateApplication({
        ...editingApp,
        company: formCompany.trim(),
        role: formRole.trim(),
        roleCategory: formCategory.trim(),
        applicationDate: formDate || new Date().toISOString().split("T")[0],
        outcome: formOutcome,
        notes: formNotes.trim(),
      });
    } else {
      onAddApplication({
        company: formCompany.trim(),
        role: formRole.trim(),
        roleCategory: formCategory.trim(),
        applicationDate: formDate || new Date().toISOString().split("T")[0],
        outcome: formOutcome,
        notes: formNotes.trim(),
      });
    }
    resetForm();
  };

  // Derive unique categories from user's recorded applications
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.roleCategory?.trim()) set.add(a.roleCategory.trim());
    });
    return Array.from(set);
  }, [applications]);

  // Overall counts (pending is strictly distinguished from rejections/no responses)
  const totalApps = applications.length;
  const pendingCount = applications.filter((a) => a.outcome === "applied").length;
  const interviewCount = applications.filter((a) => a.outcome === "interview" || a.outcome === "offer").length;
  const rejectedCount = applications.filter((a) => a.outcome === "rejected").length;
  const noResponseCount = applications.filter((a) => a.outcome === "no_response").length;

  // Filtered applications list
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchCat = filterCategory === "ALL" || app.roleCategory === filterCategory;
      const matchOut = filterOutcome === "ALL" || app.outcome === filterOutcome;
      return matchCat && matchOut;
    });
  }, [applications, filterCategory, filterOutcome]);

  const categoryStats: CategoryOutcomeStats[] = useMemo(() => {
    const groups: { [cat: string]: JobApplication[] } = {};
    applications.forEach((app) => {
      const cat = app.roleCategory?.trim() || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(app);
    });

    return Object.entries(groups).map(([cat, apps]) => {
      const total = apps.length;
      const pending = apps.filter((a) => a.outcome === "applied").length;
      const interviews = apps.filter((a) => a.outcome === "interview").length;
      const offers = apps.filter((a) => a.outcome === "offer").length;
      const rejections = apps.filter((a) => a.outcome === "rejected").length;
      const noResponses = apps.filter((a) => a.outcome === "no_response").length;

      const resolvedCount = interviews + offers + rejections + noResponses;
      const positiveCount = interviews + offers;
      const respondedCount = interviews + offers + rejections;

      const responseRate = resolvedCount > 0 ? Math.round((respondedCount / resolvedCount) * 100) : 0;
      const interviewRate = resolvedCount > 0 ? Math.round((positiveCount / resolvedCount) * 100) : 0;
      const rejectionRate = resolvedCount > 0 ? Math.round((rejections / resolvedCount) * 100) : 0;

      const sampleSizeLabel = total === 1
        ? "Early Observation (1 application)"
        : `Exploratory Pattern (${total} applications: ${resolvedCount} resolved, ${pending} in review)`;

      let recTitle = "";
      let hypothesis = "";
      let suggestedExperiment = "";
      let observationBasis = "";

      if (resolvedCount === 0) {
        recTitle = "Exploratory Signal: Applications Actively In Review";
        hypothesis = `All ${total} recorded application(s) in ${cat} are in the initial pipeline stage. No resolved outcomes have occurred yet.`;
        suggestedExperiment = "Optional Experiment: Track responses over the next 1–2 weeks before altering resume framing. If 10 business days pass without feedback, test a brief, value-add follow-up message.";
        observationBasis = `${total} application(s) pending initial recruiter / ATS screen. Not counted as rejections or non-responses.`;
      } else if (positiveCount > 0 && interviewRate >= 40) {
        recTitle = "Early Signal: Encouraging Initial Interview Traction";
        hypothesis = `Your background appears to show positive early alignment with hiring teams in ${cat}.`;
        suggestedExperiment = `Optional Experiment: You might consider prioritizing a test batch of 2–3 additional applications in ${cat} to see if this positive response rate continues, while continuing targeted interview rehearsals.`;
        observationBasis = `${positiveCount} of ${resolvedCount} resolved application(s) resulted in interviews (${interviewRate}% interview rate, ${responseRate}% response rate). ${pending > 0 ? `${pending} application(s) still in review.` : ""}`;
      } else if (rejections > 0 && rejectionRate >= 50 && rejectionRate > interviewRate) {
        recTitle = "Exploratory Signal: Elevated Initial Screen Rejections";
        hypothesis = `Initial screen outcomes suggest hiring filters in ${cat} may prioritize specific credentials or specialized depth that your current resume does not highlight.`;
        suggestedExperiment = `Optional Experiment: Rather than continuing cold submissions in ${cat}, you could test aligning 2–3 resume bullet points with concrete technical deliverables, or completing a relevant bridge project before your next application batch.`;
        observationBasis = `${rejections} of ${resolvedCount} resolved application(s) resulted in rejection (${rejectionRate}%). ${pending > 0 ? `${pending} application(s) still in review.` : ""}`;
      } else if (noResponses > 0 && (noResponses / resolvedCount) >= 0.5) {
        recTitle = "Exploratory Signal: High Proportion of Non-Responses";
        hypothesis = `Cold portal applications in ${cat} appear to experience low initial review rates or extended screening backlogs.`;
        suggestedExperiment = `Optional Experiment: As a test, try submitting 1–2 applications via warm employee referrals or direct outreach to hiring managers to observe whether direct channels yield a higher response rate than standard job boards.`;
        observationBasis = `${noResponses} of ${resolvedCount} resolved application(s) received no response after 2+ weeks (${Math.round((noResponses / resolvedCount) * 100)}% silent). ${pending > 0 ? `${pending} application(s) still in review.` : ""}`;
      } else {
        recTitle = "Exploratory Signal: Mixed Early Responses";
        hypothesis = `Early outcomes in ${cat} show varied responses without a dominant pattern.`;
        suggestedExperiment = "Optional Experiment: Continue logging outcomes across varied company stages (e.g. early-stage vs enterprise) to test which team profiles respond most favorably.";
        observationBasis = `Observed ${positiveCount} interview(s), ${rejections} rejection(s), and ${noResponses} non-responses across ${resolvedCount} resolved applications. ${pending > 0 ? `${pending} application(s) still in review.` : ""}`;
      }

      const disclaimer = `Exploratory Observation Note: Based on an early sample of ${total} application(s) (${resolvedCount} resolved, ${pending} in review). This is a working hypothesis to guide testing, not a statistically significant sample or guaranteed outcome.`;

      return {
        category: cat,
        total,
        pendingCount: pending,
        interviewCount: interviews,
        offerCount: offers,
        rejectedCount: rejections,
        noResponseCount: noResponses,
        resolvedCount,
        responseRate,
        interviewRate,
        sampleSizeLabel,
        isTentative: true,
        recommendation: {
          category: cat,
          title: recTitle,
          hypothesis,
          suggestedExperiment,
          observationBasis,
          disclaimer,
        },
      };
    });
  }, [applications]);

  const getOutcomeBadge = (outcome: ApplicationOutcome) => {
    switch (outcome) {
      case "applied":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "interview":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "offer":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "no_response":
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Tracker Overview & Control Card */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Application &amp; Conversion Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record submissions and observe response conversion patterns across target role categories.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onLoadSampleData}
              className="text-xs px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Load Demo Data
            </button>

            {totalApps > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs px-2.5 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Clear Tracker
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAdd}
              className="text-xs px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              + Log Application
            </button>
          </div>
        </div>

        {/* High-Level Conversion Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-w-0">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block break-words">
              Total Logged
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {totalApps}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 min-w-0">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block break-words">
              In Review (Pending)
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {pendingCount}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 break-words">
              Not counted as failures
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 min-w-0">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block break-words">
              Interviews / Offers
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {interviewCount}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 min-w-0">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block break-words">
              Rejections
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {rejectedCount}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 col-span-2 sm:col-span-1 min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block break-words">
              No Response (&gt; 2 wks)
            </span>
            <span className="text-2xl font-bold text-slate-700 mt-1 block">
              {noResponseCount}
            </span>
          </div>
        </div>
      </div>

      {/* Role-Category Hypotheses & Strategic Observations */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Category Outcome Patterns &amp; Exploratory Hypotheses
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Reflects your recorded data without inventing outcomes. Suggestions are framed as exploratory working hypotheses to test.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {categoryStats.length} Category Profile{categoryStats.length === 1 ? "" : "s"}
          </span>
        </div>

        {categoryStats.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg space-y-2 bg-slate-50/30">
            <p className="text-xs text-slate-500">
              No applications recorded yet. Add your submissions above or click <strong>&ldquo;Load Demo Data&rdquo;</strong> to inspect the feedback loop.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
            {categoryStats.map((stat) => (
              <div
                key={stat.category}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 flex flex-col justify-between gap-3 transition-all min-w-0 overflow-hidden"
              >
                <div className="space-y-2.5 min-w-0">
                  {/* Category Header & Exploratory Label */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 break-words flex-1 min-w-[140px] leading-snug">
                        {stat.category}
                      </h5>

                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 whitespace-normal break-words text-left leading-tight max-w-full"
                        title="Exploratory observation. Not a statistically significant sample."
                      >
                        {stat.sampleSizeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Clear Metrics: Count, Outcomes, and Response Rate */}
                  <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1.5 text-[11px] min-w-0">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">Total Applications:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {stat.total}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2 text-slate-600">
                      <span className="shrink-0">Outcomes (Resolved):</span>
                      <span className="font-medium text-right break-words min-w-0">
                        {stat.resolvedCount} ({stat.interviewCount + stat.offerCount} intv, {stat.rejectedCount} rej, {stat.noResponseCount} silent)
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span>In Review (Pending):</span>
                      <span className="font-bold font-mono text-slate-900">
                        {stat.pendingCount}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Response Rate (Resolved):</span>
                      <span className="font-bold text-blue-700 font-mono">
                        {stat.resolvedCount > 0 ? `${stat.responseRate}%` : "Pending Data"}
                      </span>
                    </div>

                    {stat.resolvedCount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Interview Rate (Resolved):</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {stat.interviewRate}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Title & Working Hypothesis */}
                  <div className="space-y-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 block break-words">
                      {stat.recommendation.title}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed break-words font-normal">
                      <strong>Hypothesis:</strong> {stat.recommendation.hypothesis}
                    </p>
                  </div>

                  {/* Optional Experiment */}
                  <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] text-slate-800 min-w-0">
                    <span className="font-bold block text-slate-900 mb-0.5">
                      Optional Experiment to Test:
                    </span>
                    <p className="leading-relaxed break-words text-slate-600">
                      {stat.recommendation.suggestedExperiment}
                    </p>
                  </div>
                </div>

                {/* Evidence Basis & Disclaimer */}
                <div className="text-[11px] p-2.5 rounded bg-white border border-slate-200 text-slate-600 space-y-1 min-w-0">
                  <span className="font-bold text-slate-800 block">
                    Observed Outcome Basis:
                  </span>
                  <p className="leading-relaxed text-[11px] break-words">
                    {stat.recommendation.observationBasis}
                  </p>
                  <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100 break-words">
                    {stat.recommendation.disclaimer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications Table Section */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recorded Submissions ({filteredApps.length} of {totalApps})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Change status inline to test how recommendations immediately adapt. Demo data is clearly identified.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {uniqueCategories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-800 text-xs"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-800 text-xs"
            >
              <option value="ALL">All Outcomes</option>
              <option value="applied">In Review (Pending)</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="no_response">No Response</option>
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredApps.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No applications match the current filter.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Company &amp; Role</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Applied</th>
                  <th className="py-2.5 px-3">Outcome Status</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900">
                          {app.company}
                        </span>
                        {app.isSampleData && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Demo Data
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {app.role}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700">
                        {app.roleCategory}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {app.applicationDate}
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={app.outcome}
                        onChange={(e) =>
                          onUpdateApplication({
                            ...app,
                            outcome: e.target.value as ApplicationOutcome,
                          })
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border cursor-pointer focus:outline-none ${getOutcomeBadge(
                          app.outcome
                        )}`}
                      >
                        <option value="applied">In Review (Pending)</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="no_response">No Response</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 max-w-[200px] truncate text-[11px] text-slate-600" title={app.notes}>
                      {app.notes || "—"}
                    </td>

                    <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(app)}
                        className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteApplication(app.id)}
                        className="text-xs text-slate-500 hover:text-rose-600 hover:underline font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Application Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                {editingApp ? "Edit Job Application" : "Log New Job Application"}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. Anthropic, Stripe, Databricks"
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Target Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="e.g. Solutions Architect, Product Manager"
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Role Category *
                </label>
                <input
                  type="text"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. AI Solutions Engineering, Platform PM"
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Applications are grouped by this category to compute outcome conversion patterns.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">
                    Application Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700">
                    Outcome Status
                  </label>
                  <select
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value as ApplicationOutcome)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  >
                    <option value="applied">In Review (Pending)</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="no_response">No Response</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Notes / Interview Stage
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Referral source, recruiter feedback, take-home status, or interview details..."
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {editingApp ? "Save Changes" : "Log Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
