import { JobPreset } from "@/types/pivot";

export const PRESET_JOBS: JobPreset[] = [
  {
    id: "anthropic-ai-engineer",
    targetRole: "AI Applications Engineer",
    company: "Anthropic",
    sourceName: "Anthropic Careers (Greenhouse)",
    sourceUrl: "https://job-boards.greenhouse.io/anthropic",
    summary: "Senior Full-Stack Engineer pivoting to AI Systems & Application Engineering at frontier LLM lab.",
    sampleBackground: "Senior Full-Stack Developer with 5 years building high-throughput web apps in TypeScript, Node.js, and React. Looking to pivot into building user-facing LLM agents, prompt evaluations, and AI application infrastructure.",
    sampleResume: `ALEX RIVERA
Full-Stack Software Engineer | San Francisco, CA | alex.rivera@example.com

SUMMARY
Full-Stack Software Engineer with 5+ years building distributed React, Node.js, and Python backend services. Strong foundation in distributed systems, REST/GraphQL APIs, and database optimization. Recently built internal LLM prototype tools using OpenAI and LangChain.

EXPERIENCE
Senior Software Engineer | CloudScale Inc. (2022 - Present)
- Architected enterprise React + Node.js microservices handling 25M daily requests with 99.98% uptime.
- Led migration of monolithic backend to TypeScript microservices on AWS ECS and PostgreSQL.
- Implemented streaming SSE (Server-Sent Events) pipeline for real-time customer data feeds.
- Built internal developer CLI and automated CI/CD GitHub Action workflows saving 4 engineering hours/week.

Software Engineer | FinFlow Technologies (2019 - 2022)
- Built payment gateway integration dashboard using React, TailwindCSS, and Next.js.
- Developed Python ETL pipelines processing transactional financial records with pandas and Celery.
- Mentored 4 junior engineers and authored team-wide API development standards.

SKILLS & EDUCATION
- Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS
- Frameworks: React, Next.js, Express, FastAPI, Node.js, Tailwind CSS
- Databases & Cloud: PostgreSQL, Redis, AWS (ECS, S3, RDS), Docker, Git
- B.S. in Computer Science | University of California, Davis (2019)`,
    sampleJobDescription: `Role: Applications Engineer - Frontier AI Products
Company: Anthropic
Source: https://job-boards.greenhouse.io/anthropic

About the Role:
Anthropic is building Claude, an AI assistant focused on helpfulness, harmlessness, and honesty. As an Applications Engineer, you will build user-facing products, developer platforms, and tools that interface directly with our foundation models.

Responsibilities:
- Build delightful, robust applications, APIs, and client-side experiences powered by Claude.
- Design low-latency streaming architectures, evaluations, and agentic workflows.
- Partner with research scientists to deploy experimental model capabilities into production.
- Optimize frontend and backend performance for high-throughput, generative AI interfaces.
- Develop rigorous prompt engineering evaluations, safety guardrails, and automated red-teaming harnesses.

Requirements:
- 4+ years of professional software engineering experience with modern TypeScript/JavaScript and Python.
- Deep experience building reliable web applications with React and Node.js/Python backends.
- Strong product intuition and empathy for user workflows.
- Practical experience or strong foundational understanding of LLM APIs, function calling, structured generation, and prompt engineering.
- Familiarity with latency optimization, caching strategies, and streaming responses (SSE/WebSockets).
- Collaborative mindset and eagerness to learn in a rapidly evolving research environment.`
  },
  {
    id: "deepmind-ml-engineer",
    targetRole: "Research Engineer / ML Systems",
    company: "Google DeepMind",
    sourceName: "Google Careers (DeepMind)",
    sourceUrl: "https://www.google.com/about/careers/applications/jobs/results/?q=DeepMind",
    summary: "Backend Data Engineer pivoting to ML Systems and Research Engineering.",
    sampleBackground: "Backend and Data Engineer with 4 years designing data pipelines and distributed compute in Python and PySpark. Seeking to pivot into Machine Learning Systems and model training infrastructure.",
    sampleResume: `PRIYA CHEN
Data & Backend Engineer | Seattle, WA | priya.chen@example.com

SUMMARY
Backend Data Engineer with 4 years of experience optimizing large-scale distributed data pipelines, PySpark workloads, and GPU cluster scheduling. Enthusiastic about pivoting full-time into ML systems engineering.

EXPERIENCE
Data Platform Engineer | DataVortex Corp (2021 - Present)
- Engineered real-time telemetry pipelines handling 50TB daily events using Apache Kafka, PySpark, and AWS EMR.
- Optimized distributed training dataset ingestion, reducing IO bottleneck latency by 42%.
- Maintained Docker and Kubernetes infrastructure for research data analysts.

Backend Engineer | CloudMatrix (2020 - 2021)
- Developed RESTful microservices in Python (FastAPI) and PostgreSQL.
- Implemented automated monitoring with Prometheus and Grafana.

SKILLS
- Languages: Python, C++, SQL, Bash
- Big Data / Infra: PySpark, Kafka, Docker, Kubernetes, Linux, Ray
- ML Fundamentals: PyTorch basics, NumPy, HuggingFace transformers, pandas
- Education: B.S. in Computer Engineering | University of Washington`,
    sampleJobDescription: `Role: Research Engineer, Machine Learning & Systems
Company: Google DeepMind
Source: https://www.google.com/about/careers/applications/jobs/results/?q=DeepMind

About the Team:
At Google DeepMind, our mission is to solve intelligence to advance science and humanity. Research Engineers collaborate directly with research scientists to scale state-of-the-art AI architectures, optimize training clusters, and build infrastructure for foundation models.

Responsibilities:
- Build high-performance, fault-tolerant distributed training pipelines using PyTorch/JAX and TPU/GPU accelerators.
- Implement novel model architectures, attention mechanisms, and inference optimization strategies.
- Diagnose and debug distributed cluster bottlenecks, network topology issues, and memory throughput limits.
- Contribute to open-source and internal AI systems tooling.

Minimum Qualifications:
- Bachelor's or Master's degree in Computer Science, Mathematics, or equivalent practical experience.
- Experience in Python and C++ with strong knowledge of computer systems, concurrency, and memory management.
- Experience with distributed computing frameworks and deep learning libraries (JAX, PyTorch, or TensorFlow).
- Understanding of neural network training dynamics, GPU optimization (CUDA, kernel tuning), and distributed parallelism (data/tensor/pipeline parallelism).`
  },
  {
    id: "stripe-product-manager",
    targetRole: "Senior Product Manager - Fintech",
    company: "Stripe",
    sourceName: "Stripe Careers",
    sourceUrl: "https://stripe.com/jobs",
    summary: "Senior Software Engineer pivoting into Technical Product Management.",
    sampleBackground: "Lead Software Engineer with 6 years leading payment integrations and backend teams. Passionate about transitioning into Technical Product Management to define product strategy, roadmap, and developer APIs.",
    sampleResume: `MARCUS STERLING
Lead Software Engineer | New York, NY | marcus.s@example.com

SUMMARY
Technical Lead with 6+ years shipping financial software, developer APIs, and checkout flows. Led cross-functional squads of 8 engineers and designers, conducted customer discovery interviews, and authored PRDs.

EXPERIENCE
Tech Lead & Senior Engineer | PaySphere Global (2021 - Present)
- Led team of 8 engineers delivering the global subscription billing engine generating $18M ARR.
- Partnered directly with enterprise customers to gather feature requirements and draft technical RFCs.
- Reduced payment checkout abandonment rate by 14% via friction analysis and UX experimentation.

Software Engineer | CommerceKit (2018 - 2021)
- Built merchant dashboard and webhook dispatch service in Go and React.
- Collaborated with compliance team to ensure PCI-DSS Level 1 certification.

SKILLS
- Product: User Research, PRDs, Roadmap Planning, A/B Testing, API Design
- Technical: Go, TypeScript, React, SQL, Microservices, System Architecture
- B.S. in Information Systems | New York University`,
    sampleJobDescription: `Role: Senior Product Manager, Financial Infrastructure
Company: Stripe
Source: https://stripe.com/jobs

About the Role:
Stripe builds economic infrastructure for the internet. As a Product Manager on Financial Infrastructure, you will own the platform that moves hundreds of billions of dollars each year for millions of global businesses.

Responsibilities:
- Define the product vision, strategy, and multi-year roadmap for global money movement systems.
- Deeply understand our users—from solo developers to Fortune 500 CFOs—to craft simple, world-class APIs.
- Lead cross-functional teams of engineers, data scientists, designers, and legal/compliance specialists.
- Set clear metrics for product adoption, reliability, latency, and business impact.

Requirements:
- 5+ years in technical product management or a combination of engineering leadership and product ownership.
- Proven track record of shipping developer-facing infrastructure, APIs, or complex financial platforms.
- Exceptional analytical and quantitative problem-solving skills; comfortable with SQL and data modeling.
- Clear, empathetic communicator with outstanding technical writing capabilities.`
  },
  {
    id: "shopify-data-analyst",
    targetRole: "Junior Data Analyst",
    company: "Shopify",
    sourceName: "Shopify Careers",
    sourceUrl: "https://www.shopify.com/careers",
    summary: "Operations Specialist pivoting to Junior Data Analyst focusing on SQL, Tableau, and business metrics.",
    sampleBackground: "Operations Specialist with 3 years analyzing team workflows, operational SLAs, and merchant escalations using Excel and Google Sheets. Looking to pivot into a Junior Data Analyst role building SQL dashboards, Tableau visualizations, and cohort retention analyses.",
    sampleResume: `TAYLOR MORGAN
Operations Specialist | Austin, TX | taylor.morgan@example.com

SUMMARY
Detail-oriented Operations Specialist with 3+ years managing merchant workflows, SLA reporting, and cross-functional operational metrics using advanced Excel (VLOOKUP, INDEX/MATCH, Pivot Tables). Self-taught in SQL and Tableau; built internal reporting prototypes. Seeking to transition full-time into Junior Data Analytics.

EXPERIENCE
Operations Specialist | SwiftCommerce (2022 - Present)
- Designed and maintained team KPI dashboards tracking 12,000+ monthly merchant tickets with 99.4% SLA adherence.
- Conducted root-cause analysis on recurring fulfillment delays, reducing ticket resolution time by 18%.
- Wrote basic SQL queries in Snowflake to extract transaction volumes for quarterly management reviews.
- Built exploratory Tableau dashboards visualizing merchant tier distributions.

Customer Operations Associate | RetailPulse (2020 - 2022)
- Managed daily merchant operations and resolved tier-2 onboarding escalations.
- Automated weekly operational summary reports using Google Sheets formulas, saving 5 hours weekly.

SKILLS & CERTIFICATIONS
- Analytical Tools: Advanced Excel, Google Sheets, Tableau (Foundational), Power BI basics
- Data & Querying: SQL (PostgreSQL/Snowflake - joins, aggregations, CTEs), Python basics (pandas)
- Business Competencies: SLA Tracking, KPI Reporting, Root-Cause Analysis, Cross-Team Communication
- Education: B.A. in Business Economics | University of Texas at Austin (2020)`,
    sampleJobDescription: `Role: Junior Data Analyst - Merchant Analytics
Company: Shopify
Source: https://www.shopify.com/careers

About the Role:
Shopify makes commerce better for everyone. As a Junior Data Analyst on the Merchant Analytics team, you will turn complex transaction and merchant operational data into actionable insights that help leadership make data-driven decisions.

Responsibilities:
- Write clean, performant SQL queries to extract, transform, and aggregate data across distributed data warehouses.
- Design, build, and maintain interactive dashboards in Tableau and Mode to monitor core business KPIs.
- Partner with operations, product, and finance teams to investigate anomalies and explain metric variances.
- Conduct exploratory cohort retention and conversion funnel analyses.
- Present data-driven findings clearly to technical and non-technical stakeholders.

Requirements:
- 1-2 years of analytical experience (in operations, finance, or business analytics) or equivalent academic coursework.
- Strong proficiency in SQL (joins, window functions, CTEs, aggregations).
- Hands-on experience with modern BI tools (Tableau, Power BI, Looker, or Mode).
- Solid grasp of foundational business metrics (retention, churn, conversion rate, CAC, LTV).
- Curious mindset, rigorous attention to detail, and ability to communicate findings with clarity.`
  }
];
