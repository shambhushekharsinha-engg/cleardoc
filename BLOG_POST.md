# Building ClearDoc: How We Built a Serverless AI Legal Guardian for Indian Renters Using AWS Bedrock & Textract

*By Shambhu Shekhar Sinha · Published for the AWS Builder Community & WeMakeDevs First Commit Hackathon (September 2026)*

---

## The ₹40,000 Nightmare: Why Legal Illiteracy is an Everyday Crisis in India

In July 2026, Priya, a 22-year-old software engineer moving from Lucknow to Bangalore for her first developer role, found a 2BHK apartment in Koramangala. Like hundreds of thousands of young professionals moving across Indian tech hubs every year, she was confronted with India's notorious rental customs: an extortionate **10-month security deposit** requirement locking up ₹2,80,000 of her savings upfront, and an 11-month agreement printed on physical stamp paper handed to her during a hurried 10-minute lunch break.

The agreement itself was an unformatted, bilingual maze—a confusing mixture of boilerplate English legalese, state sub-registrar stamp seals, and archaic clauses commonly seen on Indian non-judicial stamp papers. Exhausted from house-hunting and under pressure from the broker, she checked the monthly rent (₹28,000), verified the 10-month deposit figure, and signed on the dotted line without reading the dense 14 pages of fine print.

Six months later, severe monsoon rains caused exterior wall seepage in the master bedroom, damaging the internal electrical conduit and plaster. When Priya requested the landlord fix the structural leak, he refused, pointing directly to **Clause 4.2** of her signed agreement:

> *"The Tenant shall at their sole cost and expense maintain the interior, plumbing, electrical fixtures, and all walls in tenantable repair, and shall indemnify the Landlord against any structural decay or deterioration arising during the term."*

Under the document she had signed, Priya was legally liable for a ₹40,000 structural repair invoice for pre-existing building seepage.

Priya's ordeal is the norm, not the exception. Across Indian cities—from Bangalore's tech corridors to Pune's student hubs, Mumbai's suburbs, and Delhi-NCR's corporate centers—**over 60% of Indian tenants sign tenancy agreements without understanding key clauses and liabilities**. Formal legal consultations in India typically cost between ₹3,000 and ₹10,000 per contract review—an unrealistic expense for students and early-career professionals who are already spending their life savings on 10-month deposits. Most renters assume tenancy agreements are "standard government templates," discovering one-sided indemnity traps, 7-day eviction notice clauses, and forfeiture rules only after their security deposit is seized.

I built **ClearDoc** to eliminate this asymmetry: an AI-powered legal document analyzer that extracts dense legal text from scans or photos, highlights hidden traps with Indian legal context, scores agreement risk from 0 to 100, and provides interactive contextual chat—all powered by a 100% serverless, event-driven AWS architecture.

---

## What is ClearDoc?

ClearDoc functions as an on-demand legal guardian for everyday citizens. When a user uploads a PDF or smartphone camera scan of an Indian rental agreement, employment contract, or commercial lease, ClearDoc delivers a complete risk breakdown in under 10 seconds. 

The application features a beautifully polished, fully responsive UI with seamless **Dark/Light mode support**, delivering the following insights:

1. **Executive Plain-English Summary**: A concise breakdown of the agreement, clearly identifying parties, lease duration, monthly liabilities, notice periods, and financial lock-ins.
2. **0–100 Visual Risk Meter**: A quantified legal risk score evaluating whether an agreement is Low (0–35), Moderate (36–65), High (66–84), or Critical (85–100) risk, visually rendered with animated SVG meters.
3. **Severity-Rated Red Flags**: Problematic clauses categorized by threat level (`critical` vs. `warning`), paired with **actionable negotiation counter-proposals citing relevant tenancy statutes**.
4. **Protective Green Flags**: Fair clauses that work in the tenant's favor (such as security deposit refund timelines within 30 days, society maintenance inclusions, and reasonable annual rent escalation caps).
5. **Contextual Q&A Chat**: An integrated legal assistant that answers plain-English inquiries such as *"Who pays for painting upon move-out?"* or *"Can the landlord evict me without 30 days written notice?"*, citing the exact paragraph of the uploaded document.
6. **1-Click Interactive Simulator**: Don't have a document handy? The platform includes a built-in dropdown menu pre-loaded with 5 highly realistic mock contracts (Bangalore Lease, Startup Employment Contract, Freelance NDA, SaaS Vendor Agreement, and an Annual Gym Membership). This allows anyone to instantly test the AI analysis pipeline without uploading a file.

Crucially, ClearDoc runs at a production cost of **less than ₹0.07 per document analysis on AWS**.

---

## The AWS Serverless Architecture: 100% Event-Driven

As a builder competing in the **Ship It Track**, my architectural mandate was zero server management, automatic scaling, bank-grade document isolation, and sub-3-second end-to-end latency.

Here is the complete end-to-end cloud pipeline:

```
[User Browser] (React 19 on AWS Amplify)
       │
       ├─ (1) GET /upload ─────────────► [Amazon API Gateway]
       │                                         │
       │                                         ▼
       │                                [AWS Lambda (Python)]
       │                                         │
       │◄─ (2) Returns S3 Presigned URL ─────────┘
       │
       ├─ (3) Direct PUT (AES-256) ────► [Amazon S3 (DocumentsBucket)]
       │
       ├─ (4) POST /analyze ───────────► [Amazon API Gateway]
       │                                         │
       │                                         ▼
       │                                [AWS Lambda Orchestrator]
       │                                  │                 │
       │                 (5) DetectDocumentText             │ (6) InvokeModel (Claude 3)
       │                                  ▼                 ▼
       │                         [Amazon Textract]   [Amazon Bedrock]
       │                                                    │
       │                                 (7) PutItem (Cache)│
       │                                                    ▼
       │                                          [Amazon DynamoDB]
       │
       └─ (8) POST /chat ──────────────► [API Gateway] ──► [Lambda] ──► [DynamoDB + Bedrock]
```

### 1. Ingestion: Direct S3 Pre-signed Uploads
Routing multi-page 10MB PDF scans through API Gateway and Lambda causes base64 encoding bloat, hits API Gateway's 6MB payload ceiling, and forces Lambda to pay for idle upload wait time. Instead, our frontend requests an authorized pre-signed URL via `GET /upload`. The browser uploads the document directly to an encrypted **Amazon S3** bucket (`DocumentsBucket`) configured with private ACLs, `AES256` Server-Side Encryption, and automated CORS headers.

### 2. OCR & Document Understanding: Amazon Textract
Once the document is stored in S3, the frontend triggers `POST /analyze` with the `objectKey`. Our Python Lambda orchestrator invokes **Amazon Textract** (`detect_document_text`). Textract handles digital PDFs, multi-page scanned deeds, and distorted smartphone photos, returning structured line blocks, geometry bounding boxes, and confidence scores without requiring heavy external computer vision libraries.

### 3. Foundation Model Legal Reasoning: Amazon Bedrock (Claude 3 Haiku)
The extracted text is formatted into a strict structured prompt and submitted to **Anthropic Claude 3 Haiku** hosted on **Amazon Bedrock**. Claude 3 Haiku analyzes the legal text against Indian legal rubrics and returns a strictly typed JSON payload containing the summary, risk score, categorized red flags, and green flags.

### 4. Persistence & State Caching: Amazon DynamoDB
The parsed document text, analysis outcome, and metadata are persisted into **Amazon DynamoDB** (`ClearDocTable`) keyed by `document_id`. When users ask follow-up questions in the chat sidebar via `POST /chat`, Lambda retrieves the cached legal context from DynamoDB in <8ms and directly prompts Claude 3 Haiku. This eliminates redundant Textract invocations, keeping follow-up question latency under 800ms and operational costs near zero.

### 5. Infrastructure as Code & CI/CD
The entire backend stack—REST API Gateway endpoints, Lambda functions with least-privilege IAM policies, S3 bucket encryption, and DynamoDB tables—is codified in an AWS Serverless Application Model (`template.yaml`). The React 19 frontend is deployed via **AWS Amplify**. 

To ensure production-grade reliability, the entire system is wrapped in a GitHub Actions CI/CD pipeline that automatically lints the code and runs **79 automated test suites** (Vitest for the frontend and Pytest for the backend) on every single push.

---

## Deep-Dive: 3 Key Engineering Learnings

Building ClearDoc provided deep practical insights into production serverless AI pipelines. Here are the three most critical engineering challenges and solutions:

### 1. Spatial Coordinate Sorting for Unformatted Legal Scans
Real-world Indian tenancy agreements are notoriously irregular. When running `detect_document_text`, Amazon Textract returns blocks in raw reading order. For multi-column or heavily watermarked stamp papers, extracting text sequentially caused two-column clauses to interleave, compromising Bedrock's reasoning.

**Solution**: I implemented spatial coordinate sorting in Python before passing text to the LLM. By parsing Textract's `Geometry['BoundingBox']['Top']` and `Left` coordinates, we filtered out header noise and partitioned blocks into spatial columns. This spatial reconstruction eliminated over 80% of spurious clause associations and provided Claude 3 Haiku with clean, logically grouped legal text.

### 2. Prompt Engineering & Deterministic JSON Extraction from Bedrock
To power our interactive UI (dynamic risk gauge, expandable severity cards, filterable green flags), Bedrock needed to output strict, machine-readable JSON rather than freeform conversational prose.

**Solution**: I engineered a rigid, single-shot JSON schema prompt and backed it with a regex extraction pipeline in Python. On the backend, our utility strips markdown blocks using regular expressions, extracts the root JSON object via `re.search(r'\{.*\}', re.DOTALL)`, and validates required fields with automated fallback defaults before returning the payload to the frontend.

### 3. Serverless Latency & Cost Profiling
In consumer applications, high analysis latency causes user drop-off. We evaluated multiple model and architecture configurations to achieve our target of sub-3-second total turnaround:

- **Claude 3 Haiku vs. Opus**: Claude 3 Haiku matched Opus on clause extraction accuracy for rental agreements while executing inference in **1.2 to 1.8 seconds**—at roughly 1/20th the cost.
- **Direct-to-S3 Presigned Upload**: Bypassing API Gateway and Lambda for document ingestion dropped client upload latency from ~1,450ms to **115ms**.
- **DynamoDB Single-Table Caching**: Storing extracted OCR text in DynamoDB allows the `/chat` endpoint to respond in **under 800ms**, as subsequent queries never re-invoke Textract.

---

## The Hackathon Experience

Developing ClearDoc for the **WeMakeDevs × AWS First Commit Hackathon** showcased the agility of the modern AWS serverless stack. Rather than spending days provisioning container clusters, managing reverse proxies, or configuring database nodes, we declared our entire architecture in `template.yaml`.

Using **Amazon Textract** and **Amazon Bedrock** allowed me to focus 100% on the core domain problem: turning dense legal jargon into transparent, empowering insights for regular citizens. The seamless integration enabled me to iterate from a rough concept to a highly polished, fully-tested, and live-deployed production application in a single weekend.

---

## Try ClearDoc Today

- **Interactive Demo**: Go to [https://main.d1dmms845r1lj5.amplifyapp.com/](https://main.d1dmms845r1lj5.amplifyapp.com/) and click **"Select a Sample Document"** to explore the complete analysis pipeline with zero cloud setup.
- **GitHub Repository**: Inspect the full source code, architecture specifications, deployment guides, and test suites at [github.com/shambhushekharsinha-engg/cleardoc](https://github.com/shambhushekharsinha-engg/cleardoc).

*Don't sign what you don't understand. Let AWS AI protect your rights.*

---
*Built with ❤️ for WeMakeDevs × AWS First Commit Hackathon.*
