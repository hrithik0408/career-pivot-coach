export interface TransferableSkill {
  skill: string;
  relevance: string;
  howToPitch: string;
}

export interface SkillGap {
  skill: string;
  priority: "Critical" | "High" | "Medium";
  description: string;
  recommendedResourceOrProject: string;
}

export interface BridgeProject {
  title: string;
  description: string;
  demonstratedSkills: string[];
}

export interface WeeklyTask {
  id: string;
  weekNumber: number;
  title: string;
  task: string;
  skillDeveloped: string;
  estimatedHours: number;
  resourcesOrDeliverables?: string;
  completed: boolean;
  changeNote?: string; // E.g., "Accelerated", "Newly focused", "Extended"
}

export interface LearningPlan {
  id: string;
  createdAt: string;
  targetRole: string;
  weeklyStudyHours: number;
  totalWeeks: number;
  rationale: string;
  weeks: WeeklyTask[];
  recalibrationNotes?: string;
  version: number;
  modelUsed?: string;
  isMockFallback?: boolean;
  isArchived?: boolean;
  archivedForRole?: string;
}

export interface InterviewCriterionScore {
  name: string;
  score: number;
  maxScore: number;
  comment: string;
}

export interface InterviewEvaluation {
  id: string;
  createdAt: string;
  targetRole?: string;
  question: string;
  targetSkillGap: string;
  userAnswer: string;
  totalScore: number; // 0 - 100
  criteria: InterviewCriterionScore[];
  strengths: string[];
  actionableFeedback: string[];
  improvedAnswerSnippet?: string;
  modelUsed?: string;
  isMockFallback?: boolean;
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  targetRole?: string;
  targetSkillGap: string;
  difficulty: "Fundamental" | "Intermediate" | "Advanced";
  context: string;
  rubricFocus: string;
}

export interface SkillGapAnalysis {
  id?: string;
  targetRole?: string;
  createdAt?: string;
  overallMatchScore: number;
  feasibilityRating: "High" | "Moderate" | "Challenging";
  summary: string;
  transferableSkills: TransferableSkill[];
  skillGaps: SkillGap[];
  bridgeProjects: BridgeProject[];
  interviewQuestions: string[];
  estimatedTimeline: string;
  modelUsed?: string;
  isMockFallback?: boolean;
}

export type ApplicationOutcome = "applied" | "interview" | "rejected" | "no_response" | "offer";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  roleCategory: string;
  applicationDate: string;
  outcome: ApplicationOutcome;
  notes?: string;
  isSampleData?: boolean;
  sampleBatchRole?: string; // E.g. "AI Applications Engineer" or "Junior Data Analyst"
}

export interface ProfileMismatchNotice {
  previousRole: string;
  newRole: string;
  hasExistingPlan: boolean;
  hasExistingInterview: boolean;
  existingCompletedTasks?: number;
  existingInterviewScore?: number;
}

export interface ArchivedProfileData {
  id: string;
  targetRole: string;
  archivedAt: string;
  learningPlan?: LearningPlan | null;
  interviewQuestions?: MockInterviewQuestion[];
  interviewEvaluation?: InterviewEvaluation | null;
  interviewTargetRole?: string;
}

export interface CategoryOutcomeStats {
  category: string;
  total: number;
  pendingCount: number; // In-review/applied; NOT counted as rejection or no-response
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  noResponseCount: number;
  resolvedCount: number; // Completed outcomes (interviews + offers + rejections + no_responses)
  responseRate: number; // Percentage of resolved applications that yielded an explicit response
  interviewRate: number; // Percentage of resolved applications advancing to interview/offer
  sampleSizeLabel: string; // E.g., "Exploratory Signal (5 apps)" - never claims high confidence
  isTentative: boolean; // True for all early/exploratory data pools
  recommendation: {
    title: string;
    hypothesis: string;
    suggestedExperiment: string; // Presented strictly as an optional experiment
    observationBasis: string;
    disclaimer: string;
  };
}

export interface JobPreset {
  id: string;
  targetRole: string;
  company: string;
  sourceUrl: string;
  sourceName: string;
  summary: string;
  sampleBackground: string;
  sampleResume: string;
  sampleJobDescription: string;
}
