import { NextResponse } from "next/server";
import { SkillGapAnalysis } from "@/types/pivot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { background, targetRole, resumeText, jobDescription } = body;

    if (!background || !targetRole) {
      return NextResponse.json(
        { error: "Career background and target role are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    // Default model: Google Gemini 3.5 Flash
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";

    // Fallback mode if API key is not yet configured locally
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      const mockResult: SkillGapAnalysis = generateHeuristicAnalysis(
        background,
        targetRole,
        resumeText || "",
        jobDescription || ""
      );
      return NextResponse.json({
        ...mockResult,
        targetRole,
        isMockFallback: true,
        modelUsed: "Local Evaluation Engine (Add GEMINI_API_KEY to .env.local for live Gemini AI)",
      });
    }

    const systemPrompt = `You are an elite Silicon Valley Executive Career Transition Coach and Technical Talent Partner.
Your mission is to perform a rigorous, honest, and actionable Skill Gap and Career Pivot Analysis for a professional seeking to transition into a new target role.

Analyze the candidate's current background, resume, target role, and target job description.
Return a STRICT JSON response adhering to this schema:
{
  "overallMatchScore": number (integer between 0 and 100),
  "feasibilityRating": "High" | "Moderate" | "Challenging",
  "summary": string (3-4 sentences summarizing their current standing, the magnitude of the pivot, and key leverage points),
  "transferableSkills": [
    {
      "skill": string,
      "relevance": string (why this skill is valuable in the target role),
      "howToPitch": string (exact phrasing/framing the candidate should use on their resume or in interviews)
    }
  ],
  "skillGaps": [
    {
      "skill": string,
      "priority": "Critical" | "High" | "Medium",
      "description": string (the exact deficit and why it blocks hiring),
      "recommendedResourceOrProject": string (concrete learning path, certification, or project to close it)
    }
  ],
  "bridgeProjects": [
    {
      "title": string,
      "description": string (concrete portfolio project with technical deliverables that demonstrates target competencies),
      "demonstratedSkills": string[]
    }
  ],
  "interviewQuestions": string[] (3 hard pivot-specific interview questions assessing their readiness),
  "estimatedTimeline": string (realistic time commitment, e.g., "8 - 12 weeks at 10-15 hrs/week")
}`;

    const userPrompt = `CANDIDATE CURRENT BACKGROUND:
${background}

TARGET ROLE:
${targetRole}

RESUME TEXT:
${resumeText || "No resume text provided. Rely on current background description."}

TARGET JOB DESCRIPTION:
${jobDescription || "No target job description provided. Evaluate against industry standard expectations for " + targetRole}
`;

    const candidateModels = Array.from(new Set([model, "gemini-3.5-flash-lite"]));
    let lastError: Error | null = null;

    for (const activeModel of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
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
            // use raw error string if not JSON
          }
          throw new Error(detailedMessage);
        }

        const data = await res.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
          throw new Error(`No text content returned from Gemini model (${activeModel}).`);
        }

        const parsed: SkillGapAnalysis = JSON.parse(textContent);
        return NextResponse.json({
          ...parsed,
          targetRole,
          modelUsed: activeModel,
          isMockFallback: false,
        });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Attempt with ${activeModel} failed:`, lastError.message);
      }
    }

    throw lastError || new Error("Failed to generate analysis with Gemini.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Intelligent fallback generator when API key is not configured locally yet
function generateHeuristicAnalysis(
  background: string,
  targetRole: string,
  resumeText: string,
  jobDescription: string
): SkillGapAnalysis {
  const combinedInput = `${background} ${resumeText}`.toLowerCase();
  const targetLower = targetRole.toLowerCase();

  // Basic keyword heuristics to generate a high quality realistic preview
  const isAiMl = targetLower.includes("ai") || targetLower.includes("ml") || targetLower.includes("machine learning");
  const isDataAnalyst = targetLower.includes("data") || targetLower.includes("analyst") || targetLower.includes("analytics") || targetLower.includes("bi");
  const isPm = targetLower.includes("product") || targetLower.includes("pm");
  const isFrontend = combinedInput.includes("react") || combinedInput.includes("frontend") || combinedInput.includes("ui");

  let matchScore = 68;
  let feasibility: "High" | "Moderate" | "Challenging" = "Moderate";
  let timeline = "10 - 14 weeks (10-12 hrs/week)";

  if (isAiMl && isFrontend) {
    matchScore = 65;
    feasibility = "Moderate";
    timeline = "8 - 12 weeks (10 hrs/week)";
  } else if (isDataAnalyst) {
    matchScore = 62;
    feasibility = "High";
    timeline = "6 - 10 weeks (10-12 hrs/week)";
  } else if (isPm) {
    matchScore = 72;
    feasibility = "High";
    timeline = "6 - 10 weeks (8 hrs/week)";
  }

  const transferableSkills = isDataAnalyst
    ? [
        {
          skill: "Operational Business Metric Literacy",
          relevance: "Demonstrates deep understanding of operational SLAs, merchant KPIs, and business impact.",
          howToPitch: "Position yourself as an analytical thinker who speaks stakeholder language and connects metric variances to operational drivers.",
        },
        {
          skill: "Advanced Spreadsheet Modeling & Logic",
          relevance: "Complex formulas, pivot tables, and lookup models translate directly to relational schema thinking.",
          howToPitch: "Highlight how your multi-sheet reporting logic forms the mathematical and structural basis for SQL CTEs and data modeling.",
        },
        {
          skill: "Cross-Functional Stakeholder Communication",
          relevance: "Essential for delivering actionable insights and presenting dashboard discoveries to non-technical teams.",
          howToPitch: "Cite concrete operational reviews where your reporting guided workflow redesign and reduced issue resolution times.",
        },
      ]
    : [
        {
          skill: "End-to-End System Delivery",
          relevance: "Demonstrates capability to ship robust user-facing workflows and collaborate across stacks.",
          howToPitch: "Position yourself as a builder who understands production reliability, not just academic theory.",
        },
        {
          skill: "API Integration & Async Streaming",
          relevance: "Modern applications require handling non-blocking responses, telemetry, and error recovery.",
          howToPitch: "Emphasize how you designed resilient client-server boundaries under high latency constraints.",
        },
        {
          skill: "Cross-Functional Execution",
          relevance: "Essential for translating high-level business goals into scoped engineering milestones.",
          howToPitch: "Highlight specific instances where you aligned engineers, designers, and stakeholders on trade-offs.",
        },
      ];

  const skillGaps = isDataAnalyst
    ? [
        {
          skill: "Production SQL & Relational Modeling (Window Functions, CTEs)",
          priority: "Critical" as const,
          description: "Hiring managers expect fast, confident SQL execution with multi-table joins, window functions (ROW_NUMBER, LAG/LEAD), and CTEs beyond basic spreadsheet filtering.",
          recommendedResourceOrProject: "Master Mode Analytics SQL Tutorial and 20 LeetCode Medium database questions; build SQL aggregation models.",
        },
        {
          skill: "Modern BI Dashboarding & Data Storytelling (Tableau / Power BI)",
          priority: "High" as const,
          description: "Need a demonstrable public portfolio showing interactive visual dashboards with calculated fields, parameters, and drill-downs rather than static spreadsheets.",
          recommendedResourceOrProject: "Publish 2 interactive Tableau Public dashboards analyzing public datasets (e.g., e-commerce churn, municipal transit).",
        },
        {
          skill: "Python Data Wrangling & Exploratory Analysis (pandas/NumPy)",
          priority: "Medium" as const,
          description: "Familiarity with loading CSV/JSON data into pandas DataFrames, handling missing values, and generating statistical distributions.",
          recommendedResourceOrProject: "Complete 1 end-to-end Jupyter Notebook analyzing customer retention cohorts.",
        },
      ]
    : [
        {
          skill: isAiMl ? "LLM Tool Calling & Evaluation Frameworks" : "Structured Product Metrics & Discovery",
          priority: "Critical" as const,
          description: isAiMl
            ? "Frontier teams expect familiarity with evals (RAG triad, prompt regression testing, structured JSON schema enforcement)."
            : "Hiring committees look for structured frameworks (e.g. North Star metrics, customer interview synthesis) rather than ad-hoc feature ideas.",
          recommendedResourceOrProject: isAiMl
            ? "Build an automated eval harness testing model outputs against ground-truth benchmarks."
            : "Author a comprehensive 3-page PRD with user interview recordings and an experiment matrix.",
        },
        {
          skill: isAiMl ? "Vector Databases & Semantic Retrieval" : "Go-To-Market & Unit Economics",
          priority: "High" as const,
          description: isAiMl
            ? "Understanding embedding space trade-offs, chunking strategies, and hybrid search (BM25 + Dense)."
            : "Ability to articulate pricing tiers, user acquisition funnels, and churn mitigation.",
          recommendedResourceOrProject: isAiMl
            ? "Implement hybrid search with reranking for complex domain-specific documentation."
            : "Deconstruct a publicly traded SaaS business model and design an alternative monetization experiment.",
        },
        {
          skill: "Technical Storytelling for the New Persona",
          priority: "Medium" as const,
          description: "Your existing resume speaks the dialect of your past role; it needs to be reframed around the outcomes valued by your target role.",
          recommendedResourceOrProject: "Rewrite bullet points focusing on impact, scale, and domain-specific terminology.",
        },
      ];

  const bridgeProjects = isDataAnalyst
    ? [
        {
          title: "E-Commerce Customer Retention & Cohort Churn Dashboard",
          description: "Ingest transactional purchase data in PostgreSQL, model monthly cohort retention rates using SQL window functions, and publish an interactive Tableau dashboard.",
          demonstratedSkills: ["Advanced SQL", "Tableau", "Cohort Analysis", "Data Modeling"],
        },
        {
          title: "Automated Weekly Operations SLA Teardown in Python & SQL",
          description: "Build an automated analytical script that queries an operational dataset, computes variance metrics, and exports an executive KPI summary with anomaly alerts.",
          demonstratedSkills: ["Python / pandas", "SQL", "KPI Reporting", "Anomaly Detection"],
        },
      ]
    : [
        {
          title: isAiMl ? "Autonomous Agent with Tool Verification" : "End-to-End Micro-SaaS Product Launch",
          description: isAiMl
            ? "Build an AI agent that accepts real-world queries, executes multi-step API tool calls, and passes an automated regression test suite."
            : "Execute user discovery interviews with 15 target users, produce a high-fidelity prototype, and run a landing page validation test.",
          demonstratedSkills: isAiMl
            ? ["Structured Generation", "Tool Calling", "Telemetry & Evals", "Latency Optimization"]
            : ["Customer Discovery", "PRD Authoring", "Feature Prioritization", "Conversion Analytics"],
        },
        {
          title: "Domain Knowledge Deep Dive & Technical Teardown",
          description: `Publish a technical case study breaking down how a top company in the ${targetRole} space architects their systems and makes architectural trade-offs.`,
          demonstratedSkills: ["Technical Writing", "Domain Fluency", "System Design"],
        },
      ];

  const interviewQuestions = isDataAnalyst
    ? [
        `"Why are you transitioning from Operations toward Junior Data Analytics right now, and how does your business context give you an advantage?"`,
        `"Walk me through how you would optimize a slow-running SQL query joining multiple multi-million row transaction tables."`,
        `"If monthly merchant churn spiked from 2.1% to 3.8% in a single month, what steps and segmentations would you take to diagnose the root cause?"`,
      ]
    : [
        `"Why are you transitioning from your current background to ${targetRole} right now, and what gives you an unfair advantage?"`,
        isAiMl
          ? `"How do you monitor and prevent hallucination and prompt regressions in non-deterministic AI pipelines?"`
          : `"Walk me through a time you had to say 'no' to a major stakeholder requesting a feature you believed was the wrong priority."`,
        `"Describe the most complex technical trade-off you had to make in your recent project and how you would apply that lesson here."`,
      ];

  return {
    targetRole,
    overallMatchScore: matchScore,
    feasibilityRating: feasibility,
    summary: `Your transition from "${background.slice(0, 50)}..." toward "${targetRole}" shows strong foundation overlap. Your core domain discipline and delivery velocity are immediate leverage points, but hiring managers will scrutinize your specialized technical depth in ${targetRole} workflows.`,
    transferableSkills,
    skillGaps,
    bridgeProjects,
    interviewQuestions,
    estimatedTimeline: timeline,
  };
}
