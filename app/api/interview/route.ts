import { NextResponse } from "next/server";
import { InterviewEvaluation, MockInterviewQuestion, SkillGap } from "@/types/pivot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = "generate-question",
      targetRole,
      background = "",
      skillGaps = [],
      question,
      targetSkillGap,
      userAnswer,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";
    const candidateModels = Array.from(new Set([model, "gemini-3.5-flash-lite"]));

    // --- ACTION 1: GENERATE INTERVIEW QUESTIONS ---
    if (action === "generate-question") {
      if (!targetRole || !Array.isArray(skillGaps) || skillGaps.length === 0) {
        return NextResponse.json(
          { error: "Target role and at least one skill gap are required to generate interview questions." },
          { status: 400 }
        );
      }

      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        const fallbackQuestions: MockInterviewQuestion[] = skillGaps.slice(0, 3).map((gap: SkillGap, idx: number) => ({
          id: `q-${idx + 1}`,
          question: `How would you address production trade-offs and real-world failure modes when implementing ${gap.skill} in an enterprise ${targetRole} environment?`,
          targetSkillGap: gap.skill,
          difficulty: gap.priority === "Critical" ? "Advanced" : "Intermediate",
          context: `Testing whether you have hands-on engineering depth in ${gap.skill} or merely theoretical understanding.`,
          rubricFocus: `Demonstrates practical architecture, mentions specific failure modes, and outlines mitigation strategies.`
        }));

        return NextResponse.json({
          questions: fallbackQuestions,
          isMockFallback: true,
          modelUsed: "Local Heuristic Engine",
        });
      }

      const systemPrompt = `You are an elite Senior Staff Technical Interviewer and Hiring Committee Member evaluating candidates pivoting into: "${targetRole}".
Create 3 high-signal, pivot-targeted technical mock interview questions designed specifically to probe the candidate's skill gaps.

Target Skill Gaps:
${skillGaps.map((g: SkillGap, i: number) => `${i + 1}. [${g.priority}] ${g.skill}: ${g.description}`).join("\n")}

Candidate Background Context:
${background}

Return a STRICT JSON response adhering to this schema:
{
  "questions": [
    {
      "id": string (e.g. "q-1", "q-2"),
      "question": string (probing, realistic interview question testing their depth and ability to handle edge cases),
      "targetSkillGap": string (which exact skill gap this probes),
      "difficulty": "Fundamental" | "Intermediate" | "Advanced",
      "context": string (why interviewers ask this and what signals they look for),
      "rubricFocus": string (key concepts and terminology expected in a strong answer)
    }
  ]
}`;

      const { data: parsed, engine } = await callGeminiWithFallback(apiKey, candidateModels, systemPrompt, `Generate 3 targeted interview questions.`);

      return NextResponse.json({
        questions: parsed.questions || [],
        modelUsed: engine,
        isMockFallback: false,
      });
    }

    // --- ACTION 2: EVALUATE CANDIDATE ANSWER ---
    if (action === "evaluate-answer") {
      if (!question || !userAnswer || !userAnswer.trim()) {
        return NextResponse.json(
          { error: "Both the interview question and user answer are required for evaluation." },
          { status: 400 }
        );
      }

      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        const words = userAnswer.trim().split(/\s+/).length;
        const lengthScore = Math.min(20, Math.floor(words / 5));
        const technicalScore = Math.min(22, 12 + lengthScore / 2);
        const roleScore = Math.min(21, 14 + lengthScore / 3);
        const tradeOffScore = Math.min(20, 10 + lengthScore / 2);
        const commsScore = Math.min(22, 15 + lengthScore / 4);
        const total = Math.round(technicalScore + roleScore + tradeOffScore + commsScore);

        const fallbackEval: InterviewEvaluation = {
          id: `eval-${Date.now()}`,
          createdAt: new Date().toISOString(),
          question,
          targetSkillGap: targetSkillGap || "General Competency",
          userAnswer,
          totalScore: total,
          criteria: [
            { name: "Technical Depth & Accuracy", score: Math.round(technicalScore), maxScore: 25, comment: "Covers foundational concepts; needs deeper mention of specific framework mechanics." },
            { name: "Relevance to Target Role", score: Math.round(roleScore), maxScore: 25, comment: `Good alignment with ${targetRole} expectations, but frame impact more quantitatively.` },
            { name: "Practical Application & Trade-offs", score: Math.round(tradeOffScore), maxScore: 25, comment: "Addresses the primary path; describe edge cases and production latency bottlenecks." },
            { name: "Structure, Clarity & Delivery", score: Math.round(commsScore), maxScore: 25, comment: "Clear phrasing. Using a structured STAR or Situation-Complication-Resolution format will elevate executive presence." },
          ],
          strengths: [
            "Directly addresses the prompt without excessive rambling.",
            "Demonstrates genuine enthusiasm and foundational familiarity with the space.",
          ],
          actionableFeedback: [
            "Anchor your answer in a specific metric (e.g. latency reduced by X%, error rate bounded under Y%).",
            "Explicitly contrast two alternative approaches to demonstrate seniority trade-off analysis.",
          ],
          improvedAnswerSnippet: `\"In my recent architecture, we decoupled the ingestion pipeline from vector indexing. We used hybrid search (BM25 + Dense) with cross-encoder re-ranking, which reduced retrieval hallucination by 34% while maintaining sub-150ms p95 latency under high concurrency...\"`,
          isMockFallback: true,
          modelUsed: "Local Heuristic Evaluation Engine",
        };

        return NextResponse.json(fallbackEval);
      }

      const systemPrompt = `You are a Principal Technical Interviewer and Hiring Committee Leader.
Evaluate the candidate's interview answer against a rigorous, honest, and actionable scoring rubric.

TARGET ROLE: ${targetRole || "Technical Role"}
PROBED SKILL GAP: ${targetSkillGap || "Core Competency"}
INTERVIEW QUESTION: ${question}
CANDIDATE BACKGROUND: ${background}

EVALUATION RUBRIC (Total 100 points, 4 criteria @ 25 pts max each):
1. Technical Depth & Accuracy (0 - 25 pts): Did they demonstrate real production depth, correct terminology, and architectural fluency?
2. Relevance to Target Role (0 - 25 pts): Is the perspective framed appropriately for a ${targetRole}?
3. Practical Application & Trade-offs (0 - 25 pts): Did they address constraints, failure modes, scale, cost, or latency?
4. Structure, Clarity & Delivery (0 - 25 pts): Is the answer organized, articulate, and free of vague filler?

Return a STRICT JSON response adhering to this schema:
{
  "totalScore": number (integer between 0 and 100, equal to sum of criterion scores),
  "criteria": [
    {
      "name": "Technical Depth & Accuracy",
      "score": number (0 - 25),
      "maxScore": 25,
      "comment": string (specific evaluation of technical accuracy and terminology)
    },
    {
      "name": "Relevance to Target Role",
      "score": number (0 - 25),
      "maxScore": 25,
      "comment": string (alignment with target role responsibilities)
    },
    {
      "name": "Practical Application & Trade-offs",
      "score": number (0 - 25),
      "maxScore": 25,
      "comment": string (handling of constraints, latency, and real-world failure modes)
    },
    {
      "name": "Structure, Clarity & Delivery",
      "score": number (0 - 25),
      "maxScore": 25,
      "comment": string (executive clarity, structure, and communication effectiveness)
    }
  ],
  "strengths": [
    string (concrete strength 1),
    string (concrete strength 2)
  ],
  "actionableFeedback": [
    string (concrete actionable improvement 1: what specific technical point or metric to add),
    string (concrete actionable improvement 2: how to reframe for maximum hiring signal)
  ],
  "improvedAnswerSnippet": string (an exemplary 2-3 sentence answer snippet demonstrating masterclass execution)
}`;

      const { data: parsed, engine } = await callGeminiWithFallback(
        apiKey,
        candidateModels,
        systemPrompt,
        `CANDIDATE'S SUBMITTED ANSWER:\n${userAnswer}`
      );

      const computedTotal = Array.isArray(parsed.criteria)
        ? parsed.criteria.reduce((acc: number, c: { score: number }) => acc + (Number(c.score) || 0), 0)
        : (parsed.totalScore || 70);

      const evaluation: InterviewEvaluation = {
        id: `eval-${Date.now()}`,
        createdAt: new Date().toISOString(),
        question,
        targetSkillGap: targetSkillGap || "General Competency",
        userAnswer,
        totalScore: Math.min(100, Math.max(0, computedTotal)),
        criteria: parsed.criteria || [],
        strengths: parsed.strengths || [],
        actionableFeedback: parsed.actionableFeedback || [],
        improvedAnswerSnippet: parsed.improvedAnswerSnippet,
        modelUsed: engine,
        isMockFallback: false,
      };

      return NextResponse.json(evaluation);
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Interview API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function callGeminiWithFallback(
  apiKey: string,
  candidateModels: string[],
  systemPrompt: string,
  userPrompt: string
): Promise<{ data: any; engine: string }> {
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
          // use raw error string
        }
        throw new Error(detailedMessage);
      }

      const json = await res.json();
      const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error(`No text content returned from Gemini model (${activeModel}).`);
      }

      const parsed = JSON.parse(textContent);
      return { data: parsed, engine: activeModel };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Attempt with ${activeModel} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("Failed to process request with Gemini.");
}

