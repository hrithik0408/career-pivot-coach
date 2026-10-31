# Career Pivot Coach

A focused, professional career transition platform designed for professionals and engineers navigating career pivots. **Career Pivot Coach** evaluates your transferable strengths, diagnoses critical skill gaps against real job requirements, generates an adaptive week-by-week learning plan, conducts voice-first mock interviews, and tracks your application pipeline conversion patterns.

---

## The Problem

Professionals pivoting into adjacent or emerging domains (such as Software Engineering &rarr; AI Engineering, QA &rarr; SDET, or Analytics &rarr; Data Science) encounter significant friction:

- **Vague Job Benchmarking**: Candidates struggle to know how their existing experience measures up against modern job requirements.
- **Generic Transition Advice**: Standard courses offer one-size-fits-all roadmaps without considering existing transferable competencies.
- **Static Study Schedules**: Traditional curricula cannot adjust when real-world schedules shift or when candidates complete milestones ahead of time.
- **Unprepared Technical Storytelling**: Candidates rarely practice answering trade-off and architecture questions out loud before real interviews.
- **Discouraging Pipeline Tracking**: Typical job trackers treat in-review applications as non-responses or make premature conclusions on small sample sizes.

---

## The Solution

**Career Pivot Coach** provides a structured, objective 5-step transition workflow powered by Google Gemini AI and voice-first input with Wispr Flow:

1. **Profile & Job**: Intake your career trajectory, target role, and current resume alongside a real target job description.
2. **Skill Gap Analysis**: Receive an objective evaluation of transferable strengths, critical gap priorities, estimated timelines, and recommended bridge projects.
3. **Adaptive Learning Plan**: Follow a weekly milestone roadmap that recalibrates remaining weeks as you check off deliverables.
4. **Voice Mock Interview**: Rehearse scenario questions tailored to your skill gaps using Wispr Flow voice dictation, scored against a 4-dimension rubric.
5. **Application Tracker**: Monitor submissions across role categories, isolate pending reviews from rejections, and test exploratory conversion hypotheses.

---

## Key Features

### 1. Document Resume Intake & Trajectory Configuration
- **Resume Document Upload**: Directly extracts text from modern **PDF (`.pdf`)**, Word **(`.docx`)**, and plain text **(`.txt`)** files up to 5MB.
- **Review & Edit Workflow**: Extracted text loads into an editable textarea with real-time character and word counts, allowing review, manual editing, or voice additions.
- **Curated Demo Profiles**: Includes realistic sample trajectories (e.g., Full Stack to AI Platform Engineer, Systems to Cloud Infrastructure) labeled clearly as **Demo Examples** for fast exploration.

### 2. Objective Skill Gap & Transferability Engine
- **Line-by-Line Role Benchmarking**: Evaluates your documented experience against the explicit requirements in the target job description.
- **Transferable Strengths**: Highlights verified competencies with tactical *"How to pitch"* phrasing for resumes and recruiter calls.
- **Priority-Ranked Gaps**: Distinguishes between `Critical`, `High`, and `Medium` gaps with specific action items.
- **Bridge Projects & Screening Questions**: Suggests high-signal portfolio proofs and core technical screening questions to prepare for.

### 3. Week-by-Week Adaptive Learning Plan
- **Committed Study Hours**: Select 5h, 10h, 15h, 20h, or custom study hours per week.
- **Interactive Checklists**: Mark milestones and deliverables complete as you progress.
- **Dynamic Recalibration**: Gemini AI recalculates remaining weeks based on what you have finished and what remains pending.
- **Before/After Version Diffs**: Side-by-side comparison view (`v1` vs `v2`) clearly displays accelerated, adjusted, or extended milestones.

### 4. Voice-First Mock Technical Interview
- **Scenario Questions**: Generates prompts directly targeting your diagnosed skill gaps.
- **Voice Dictation**: Dictate spoken answers using system-wide Wispr Flow shortcuts or browser-assisted speech recognition.
- **Formative Rubric Scoring**: Evaluates answers across four 25-point dimensions (100 points total):
  - *Technical Accuracy & Depth*
  - *Relevance to Prompt*
  - *Communication Clarity & Structure*
  - *Trade-off & Engineering Reasoning*
- **Actionable Coaching**: Delivers specific strengths, areas for improvement, and exemplary response framing. Clearly labeled as *practice feedback*, not a hiring prediction.

### 5. Application Pipeline & Outcome Tracker
- **Pipeline Metric Cards**: Tracks total submissions, applications actively in review, interviews/offers, rejections, and non-responses.
- **Pending Review Separation**: In-flight applications (`applied`) are never counted as failures or rejections. Response rates and interview rates are calculated solely over resolved applications.
- **Exploratory Category Hypotheses**: Identifies conversion patterns across role categories without making false claims of "high confidence" or "statistical significance" on small samples.
- **Optional Experiments**: Suggests tactical, testable experiments (e.g., testing warm referrals vs cold boards, or refining resume metrics before the next batch).
- **Demo Data Tagging**: Pre-loaded testing records are marked with an amber `Demo Data` badge.

---

## Voice Experience Workflow (Wispr Flow)

Career Pivot Coach is built voice-first to encourage natural, reflective storytelling:

```
[Candidate Voice] 
       │
       ▼
[Wispr Flow Desktop App] ──(System Shortcut)──► [Active Input Field]
       │                                               │
       ▼ (Browser fallback)                            ▼
[Web Speech API] ──────────────────────────► [Editable Review Field]
                                                       │
                                                       ▼
                                            [Structured Server Route]
                                                       │
                                                       ▼
                                            [Gemini AI Evaluation]
```

### Voice Architecture & Dictate Button
1. **Wispr Flow Desktop App (Recommended)**: An external OS-level application. When you focus any field (Target Role, Career Background, Editable Resume, or Mock Interview Response) and press your global Wispr Flow shortcut, dictation streams directly into the field through native OS input simulation.
2. **In-Browser Dictate Button**: Uses the browser's native Web Speech API (`webkitSpeechRecognition`) as an in-browser helper. It operates with an isolated lifecycle where clicking **Stop Dictate** immediately ends microphone capture, cancels the recognition session, and discards buffered/late speech tokens.
3. Both methods are completely independent and can be used separately at any time.

---

## Requirements for Real Analysis

> [!IMPORTANT]
> **Real Job Description Required for Accurate Output**  
> To produce a meaningful skill gap analysis, study plan, and interview questions, you must provide a **real, complete job description listing** (responsibilities, required qualifications, and tech stack). Generic role titles without detailed listings will produce high-level generalizations.
>
> All pre-loaded presets in the platform are explicitly labeled as **Sample Profiles (Demo Examples)** for testing.

---

## Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) version 18.18 or higher (Node 20+ recommended)
- `npm` (bundled with Node.js)
- A [Google Gemini API Key](https://aistudio.google.com/)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/career-pivot-coach.git
   cd career-pivot-coach
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API key from Google AI Studio. | **Yes** | — |
| `GEMINI_MODEL` | The configured Gemini model for structured evaluations. | No | `gemini-3.5-flash` |

*Recommended supported models:*
- `gemini-3.5-flash` (Default: fast reasoning, reliable structured JSON output)
- `gemini-3.5-flash-lite` (Low-latency fallback)
- `gemini-2.5-flash` (Stable secondary fallback)

---

## Data Privacy & Security

- **No Authentication / Account System**: User authentication is **not implemented**. The platform does not require sign-in, usernames, or passwords, and operates entirely client-side without remote user tracking or cloud account backends.
- **Local Browser Storage**: All candidate profile inputs, uploaded resume text, weekly learning schedules, interview practice recordings/scores, and job application records are stored exclusively on your device in your browser's `localStorage` (`career_pivot_coach_v1`).
- **Server-Side API Key Protection**: The Gemini API key is read strictly server-side inside Next.js route handlers (`/api/analyze`, `/api/plan`, `/api/interview`). It is **never** bundled into client JavaScript or sent to the browser.
- **No Remote User Database**: The platform does not operate an external database or third-party telemetry. Clearing your browser data or clicking **Reset All** deletes your saved session data immediately.
- **Git Protection**: Sensitive environment files (`.env`, `.env.local`, `.env*.local`) and build artifacts (`.next/`, `node_modules/`, `*.tsbuildinfo`) are excluded in `.gitignore`.

---

## Current Limitations

1. **Authentication Not Implemented**: There is no remote account or login system. Data does not synchronize across separate devices or different browsers; clearing browser data resets the active session.
2. **Local Browser Storage Boundary**: Data relies on browser `localStorage` limits (typically 5MB-10MB). Exporting or saving important text externally is advised for long-term retention.
3. **Demo Data Clearly Labelled**: All pre-loaded sample profiles (e.g. AI Applications Engineer, Junior Data Analyst) and pipeline applications are explicitly tagged with `Demo Examples`, `Demo Data ([Role])`, or `Previous Demo ([Role])` badges to prevent confusion with real user submissions. Old demo records can be cleared or updated at any time without deleting user-created applications.
4. **Scanned Image-Only PDFs**: Resume document parsing extracts text layers from digital PDFs. Scanned bitmap documents containing only images without text layers require optical character recognition (OCR) and will prompt the user to copy/paste text or dictate with Wispr Flow.
5. **Legacy Binary Word Files (`.doc`)**: Only modern Office Open XML documents (`.docx`), digital PDFs (`.pdf`), and plain text files (`.txt`) are accepted. Legacy `.doc` binary files must be saved as `.docx` or `.pdf`.
6. **File Size Boundary**: Resume uploads are capped at 5MB to ensure fast processing and responsive parsing.
7. **Formative Practice Feedback**: Mock interview scores and rubric feedback are formative educational exercises designed to strengthen technical storytelling; they do not represent guaranteed hiring outcomes or official employer evaluation criteria.
8. **Sample Size Limitations in Tracking**: Recommendations in the application tracker are exploratory working hypotheses based on early data points, not statistically significant conclusions.

---

## Project Structure

```
career-pivot-coach/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Gemini skill gap & transition assessment
│   │   ├── interview/route.ts    # Question generator & rubric evaluation
│   │   ├── parse-resume/route.ts # PDF, DOCX, & TXT text extraction
│   │   └── plan/route.ts         # Study plan generator & dynamic recalibration
│   ├── components/
│   │   ├── ApplicationTrackerView.tsx # Application pipeline & pattern cards
│   │   ├── JobPresets.tsx             # Curated demo pivot trajectories
│   │   ├── LearningPlanView.tsx       # Weekly milestones & before/after diffs
│   │   ├── MockInterviewView.tsx      # Scenario selector & rubric scoring
│   │   ├── ResumeUpload.tsx           # Document upload dropzone & validation
│   │   ├── SkillGapResults.tsx        # Transferable strengths & gap breakdown
│   │   └── WisprInput.tsx             # Voice-enabled input with Wispr Flow tips
│   ├── globals.css               # Styling and custom scrollbars
│   ├── layout.tsx                # Metadata & off-white base theme
│   └── page.tsx                  # Main layout, compact header, & section navigation
├── data/
│   └── presets.ts                # Sample career pivot trajectories
├── public/                       # Static SVGs and branding assets
├── types/
│   └── pivot.ts                  # Shared TypeScript interfaces & models
├── .env.example                  # Safe template for environment variables
├── .gitignore                    # Excludes .env*, node_modules, build artifacts
├── package.json                  # Next.js 16, React 19, Tailwind CSS
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## License

This project is licensed under the [MIT License](LICENSE).
