import { NextResponse } from "next/server";
import { LearningPlan, SkillGap, WeeklyTask } from "@/types/pivot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = "generate",
      targetRole,
      background = "",
      skillGaps = [],
      weeklyStudyHours = 10,
      currentPlan,
    } = body;

    if (!targetRole || !Array.isArray(skillGaps) || skillGaps.length === 0) {
      return NextResponse.json(
        { error: "Target role and at least one skill gap are required to build a learning plan." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";

    // Heuristic mode when API key is not yet configured locally
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      const fallbackPlan = generateHeuristicPlan(
        targetRole,
        skillGaps,
        weeklyStudyHours,
        action,
        currentPlan
      );
      return NextResponse.json({
        ...fallbackPlan,
        isMockFallback: true,
        modelUsed: "Local Heuristic Engine (Add GEMINI_API_KEY to .env.local for live Gemini AI)",
      });
    }

    const systemPrompt = `You are a Principal Curriculum Architect and Technical Transition Coach.
Your mission is to construct a rigorous, realistic, and actionable Week-by-Week Learning Plan for a candidate pivoting into: "${targetRole}".
Available Study Commitment: ${weeklyStudyHours} hours per week.

Target Skill Gaps to address:
${skillGaps.map((g: SkillGap, i: number) => `${i + 1}. [${g.priority}] ${g.skill}: ${g.description} (Recommended: ${g.recommendedResourceOrProject})`).join("\n")}

${action === "recalibrate" && currentPlan ? `
CURRENT PROGRESS CONTEXT:
The candidate has completed version ${currentPlan.version} of their plan:
- Completed Tasks: ${currentPlan.weeks.filter((w: WeeklyTask) => w.completed).map((w: WeeklyTask) => `Week ${w.weekNumber} (${w.skillDeveloped}): "${w.task}"`).join("; ") || "None yet"}
- Incomplete / Pending Tasks: ${currentPlan.weeks.filter((w: WeeklyTask) => !w.completed).map((w: WeeklyTask) => `Week ${w.weekNumber} (${w.skillDeveloped}): "${w.task}"`).join("; ")}

RECALIBRATION INSTRUCTION:
Recalibrate the plan based strictly on their progress.
- Keep completed weeks marked as completed (completed: true).
- For remaining weeks, optimize the sequence. If earlier weeks were completed, advance critical skill gaps or provide hands-on capstone integration. If critical gaps remain, condense lower-priority items to ensure mastery.
- Provide a clear 'changeNote' on adjusted weeks explaining what shifted (e.g. "Accelerated after early completion", "Refocused on remaining Critical gap", "Capstone synthesis expanded").
- Provide a high-level summary in 'recalibrationNotes' summarizing how the new plan differs from the previous version.
` : `
NEW PLAN INSTRUCTION:
Create a realistic schedule (typically 6 to 12 weeks, depending on ${weeklyStudyHours} hrs/week and skill gap depth) covering all skill gaps from highest priority ("Critical") to lowest.
Ensure each week has a concrete hands-on task/deliverable that demonstrates the skill.
`}

Return a STRICT JSON response adhering to this schema:
{
  "totalWeeks": number,
  "rationale": string (2-3 sentences explaining the instructional progression and pacing),
  "recalibrationNotes": string (detailed explanation of what changed compared to previous version; omit or empty string if new plan),
  "weeks": [
    {
      "id": string (e.g. "week-1", "week-2"),
      "weekNumber": number (1-based index),
      "title": string (concise theme of the week),
      "task": string (specific actionable project, lab, or code deliverable),
      "skillDeveloped": string (the exact skill gap or competency being trained),
      "estimatedHours": number (realistic hours allocation, roughly matching ${weeklyStudyHours}),
      "resourcesOrDeliverables": string (concrete proof of completion or recommended tooling),
      "completed": boolean,
      "changeNote": string (optional concise note on how this week changed vs previous plan)
    }
  ]
}`;

    const candidateModels = Array.from(new Set([model, "gemini-3.5-flash-lite"]));
    let lastError: Error | null = null;
    let parsed: any = null;
    let activeEngine = model;

    for (const activeModel of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nCandidate background context:\n${background}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          let detailedMessage = `Gemini API error (${res.status} on model ${activeModel}): ${errText}`;
          try {
            const errJson = JSON.parse(errText);
            if (errJson.error?.message) {
              detailedMessage = `Gemini API error (${res.status} on model ${activeModel}): ${errJson.error.message}`;
            }
          } catch {
            // use raw error string
          }
          throw new Error(detailedMessage);
        }

        const data = await res.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
          throw new Error(`No text content returned from Gemini model (${activeModel}).`);
        }

        parsed = JSON.parse(textContent);
        activeEngine = activeModel;
        break;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Plan generation attempt with ${activeModel} failed:`, lastError.message);
      }
    }

    if (!parsed) {
      throw lastError || new Error("Failed to generate plan with Gemini.");
    }

    const plan: LearningPlan = {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      targetRole,
      weeklyStudyHours: Number(weeklyStudyHours) || 10,
      totalWeeks: parsed.totalWeeks || parsed.weeks?.length || 8,
      rationale: parsed.rationale || `Tailored learning plan designed for ${weeklyStudyHours} hours/week toward ${targetRole}.`,
      recalibrationNotes: parsed.recalibrationNotes || (action === "recalibrate" ? "Plan updated according to current milestone completion." : undefined),
      weeks: (parsed.weeks || []).map((w: WeeklyTask, idx: number) => ({
        id: w.id || `week-${idx + 1}`,
        weekNumber: w.weekNumber || idx + 1,
        title: w.title || `Week ${idx + 1}`,
        task: w.task || "Complete core skill module and portfolio lab.",
        skillDeveloped: w.skillDeveloped || skillGaps[idx % skillGaps.length]?.skill || "Target Role Skill",
        estimatedHours: w.estimatedHours || Number(weeklyStudyHours) || 10,
        resourcesOrDeliverables: w.resourcesOrDeliverables || "Working code demo or documented design tear-down.",
        completed: Boolean(w.completed),
        changeNote: w.changeNote,
      })),
      version: currentPlan ? (currentPlan.version || 1) + 1 : 1,
      modelUsed: activeEngine,
      isMockFallback: false,
    };

    return NextResponse.json(plan);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Plan Generation API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateHeuristicPlan(
  targetRole: string,
  skillGaps: SkillGap[],
  weeklyStudyHours: number,
  action: string,
  currentPlan?: LearningPlan
): LearningPlan {
  const hours = Number(weeklyStudyHours) || 10;
  const isRecalibrate = action === "recalibrate" && currentPlan;
  const version = currentPlan ? currentPlan.version + 1 : 1;

  const baseWeeks: WeeklyTask[] = skillGaps.map((gap, i) => {
    const weekNum = i + 1;
    const isCompleted = isRecalibrate
      ? Boolean(currentPlan.weeks.find((w) => w.weekNumber === weekNum)?.completed)
      : false;

    return {
      id: `week-${weekNum}`,
      weekNumber: weekNum,
      title: `${gap.skill} Fundamentals & Implementation`,
      task: `Build a focused hands-on prototype closing ${gap.skill}: ${gap.recommendedResourceOrProject}`,
      skillDeveloped: gap.skill,
      estimatedHours: hours,
      resourcesOrDeliverables: `Functional GitHub repository demonstrating ${gap.skill} production patterns.`,
      completed: isCompleted,
      changeNote: isRecalibrate && isCompleted ? "Completed ahead of schedule" : undefined,
    };
  });

  // Add a capstone integration week
  const capstoneWeekNum = baseWeeks.length + 1;
  baseWeeks.push({
    id: `week-${capstoneWeekNum}`,
    weekNumber: capstoneWeekNum,
    title: "Capstone Portfolio Synthesis & Technical Narrative",
    task: `Integrate all acquired competencies into an end-to-end showcase project targeted at ${targetRole} technical interview loops.`,
    skillDeveloped: `${targetRole} System Delivery`,
    estimatedHours: hours,
    resourcesOrDeliverables: "Live deployed application with architecture teardown and evaluation metrics.",
    completed: isRecalibrate ? Boolean(currentPlan.weeks.find((w) => w.weekNumber === capstoneWeekNum)?.completed) : false,
    changeNote: isRecalibrate ? "Pacing calibrated to remaining deliverables" : undefined,
  });

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    targetRole,
    weeklyStudyHours: hours,
    totalWeeks: baseWeeks.length,
    rationale: `Paced ${baseWeeks.length}-week curriculum tackling each verified skill gap systematically with ${hours} committed hours weekly.`,
    recalibrationNotes: isRecalibrate
      ? `Recalibrated to version ${version}: Retained completed milestones and optimized pacing for remaining skill gap deliverables.`
      : undefined,
    weeks: baseWeeks,
    version,
  };
}
