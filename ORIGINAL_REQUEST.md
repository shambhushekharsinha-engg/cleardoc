# Original User Request

## Initial Request — 2026-09-18T17:52:37Z

# Teamwork Project Prompt — Draft

> Status: Launched.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: A full team of agents working on multiple parts simultaneously

ClearDoc is an AI-powered legal document analyzer currently built as a hackathon prototype (React frontend + AWS SAM backend). The goal is to refactor, harden, and organize the codebase into a production-grade system with robust error handling, testing, an interactive UI, and deployment readiness.

Working directory: c:\New folder
Integrity mode: development

## Requirements

### R1. Comprehensive Testing
Implement automated test suites for both the frontend (e.g., Jest/React Testing Library) and backend (e.g., pytest). The tests must cover core functionality like file upload processing, AI analysis fallback, and chat flow.

### R2. CI/CD Pipeline
Create a GitHub Actions CI/CD pipeline that automatically lints the code, runs the test suites, and validates the AWS SAM template on every push and pull request.

### R3. Backend Hardening
Improve the AWS SAM backend in `cleardoc-api`. Add structured logging, strict error handling (especially for AWS SDK calls), and enforce least-privilege IAM policies in the `template.yaml`.

### R4. Frontend Refactoring & UI Improvements
Refactor the React application in `cleardoc-ui` to improve state management and performance. Additionally, refine the UI to be exceptionally interactive and beginner-friendly, providing helpful tooltips and clear guidance that scales from new users to experts.

## Acceptance Criteria

### Automated Verification
- [ ] Running `npm run lint` in `cleardoc-ui` passes with zero errors.
- [ ] Running `npm test` in `cleardoc-ui` executes successfully.
- [ ] Running `pytest` in `cleardoc-api/hello_world` executes successfully.
- [ ] `sam validate` in `cleardoc-api` succeeds, verifying the backend configuration is structurally sound.
- [ ] `.github/workflows/ci.yml` exists and contains valid syntax for automated testing.

## Follow-up — 2026-09-18T18:52:58Z

ClearDoc is an AI-powered legal document analyzer built for the WeMakeDevs × AWS "First Commit" hackathon (Sept 17–20 2026). The project already has a solid production-grade foundation (React frontend with modular components, AWS SAM backend with Textract + Bedrock, 53 passing pytest + 24 vitest tests, and a GitHub Actions CI pipeline). The goal of this phase is to elevate every dimension of the project to be outstanding and mind-blowing in front of judges — the kind of project that wins the Ship It grand prize (₹2,00,000 + $3,000 AWS credits), the Best UI track, and that the top 10 students consideration for fast-track Amazon interviews.

Working directory: c:\New folder
Integrity mode: demo

## Context: Judging Criteria
The hackathon judges score on 5 criteria:
1. **Idea & Impact** — Does it solve a real problem well?
2. **Built on AWS** — AWS services usage is mandatory and architecture quality counts for Ship It.
3. **Learning** — Did the team learn something new?
4. **Execution** — Does it actually work?
5. **Demo Video** — 3-minute recorded video showing what it does, who it's for, and where AWS fits.

The current project's weakest points (gaps the judges WILL notice) are:
- **No risk scoring / visual risk meter upgrade** — the backend returns `is_mock: true` and numeric `riskScore` is hardcoded at 65. The AI prompt needs to return structured, richer data.
- **No sample document for demo** — there is a `SampleDocumentLoader` component but the `loadSampleDocument` hook logic is incomplete; judges need to see a real document being analyzed without needing AWS credentials.
- **The home page lacks trust signals and "why this matters" storytelling** — no statistics, no social proof, no "how it works" section that would immediately hook a judge.
- **No architecture diagram** — judges on the Ship It track need to visually understand the AWS stack. A visual diagram embedded in the app itself is a powerful differentiator.
- **Deployment instructions are buried** — there is no clear `DEPLOY.md` with a step-by-step guide for deploying via AWS Free Tier.
- **The blog post** (required for the "Top 5 Blogs" prize consideration) has not been written.

## Requirements

### R1. Enrich the Backend AI Response Structure
The backend Lambda (`cleardoc-api/hello_world/app.py`) must be updated so that when Bedrock is unavailable (mock mode), the fallback mock response is dramatically richer and more convincing for demo purposes. The mock must include:
- A `riskScore` (integer 0–100) and a `riskLevel` string ("Low", "Moderate", "High", "Critical").
- Each item in `redFlags` must be an object with `text` (string), `severity` ("critical" or "warning"), and `recommendation` (string).
- Each item in `greenFlags` must be an object with `text` and `benefit` (string).
- The Bedrock prompt must also be updated to request this richer structured JSON from Claude so that when real AWS credentials ARE provided, the output matches the same schema.
- At least 4 rich red flags and 3 rich green flags in the mock data, all India-specific (rental agreements in INR, Indian legal context).

### R2. Compelling Landing Page & Storytelling
The `FileUploadZone` component and the page above the upload drop zone must be upgraded to be instantly compelling to a hackathon judge. The landing page must include:
- A headline hook with a concrete Indian statistic (e.g., "Over 60% of Indian tenants sign agreements without understanding key clauses.").
- A clear "How It Works" 3-step visual (Upload → AWS AI Analyzes → Get Plain English Results).
- Trust badges explicitly naming the AWS services used (Amazon Textract, Amazon Bedrock, Amazon S3).
- The sample document quick-start button must be visually prominent and clearly labeled "Try with a Sample Lease Agreement (No account needed)".

### R3. Functional Sample Document Demo Flow
The `loadSampleDocument` function in `cleardoc-ui/src/hooks/useDocumentAnalysis.js` must be fully implemented. When clicked, it must:
- Skip the S3 upload step entirely (there's no file to upload).
- Immediately begin a simulated analysis animation (cycling through the existing `loadingPhase` messages).
- After a realistic 3-4 second delay, populate the full analysis dashboard with the rich India-specific mock data (matching the R1 structure).
- The result must be indistinguishable in quality from a real AWS-powered analysis.
- The `SampleDocumentLoader` component must show the sample document's name as "Sample Bangalore Residential Lease (2026).pdf".

### R4. Embedded AWS Architecture Diagram
Add a dedicated, visually stunning AWS Architecture section that can be toggled or rendered as a tab in the analysis dashboard. This section must:
- Show a clear visual flow diagram of the AWS services: User → API Gateway → Lambda → [Amazon Textract, Amazon Bedrock (Claude 3), S3, DynamoDB].
- Be built using only HTML/CSS/SVG or React (no external diagram libraries).
- Be shareable or printable. This gives judges an instant, professional view of the architecture.

### R5. Hackathon Submission Assets
Create two key submission assets:
1. **`DEPLOY.md`** at the project root `c:\New folder\DEPLOY.md`: A clear, judge-friendly deployment guide. Cover (a) running locally with mock data, (b) deploying to AWS using the Free Tier via `sam deploy --guided`, and (c) how to enable Bedrock model access in the AWS console. Use simple language, not jargon.
2. **`BLOG_POST.md`** at the project root `c:\New folder\BLOG_POST.md`: A complete, publish-ready blog post (~800 words) suitable for the AWS Builder Center. It must cover the problem statement, the solution, the AWS architecture (Textract, Bedrock, SAM, API Gateway, S3, DynamoDB), key learnings, and a call-to-action. This is required for the "Top 5 Blogs" prize consideration (Logitech keyboard).

## Acceptance Criteria

### R1: Backend Enrichment
- [ ] The mock fallback in `app.py` returns at least 4 red flags, each with `text`, `severity`, and `recommendation` keys.
- [ ] The mock fallback returns at least 3 green flags, each with `text` and `benefit` keys.
- [ ] The mock fallback includes a `riskScore` (integer) and `riskLevel` (string) field.
- [ ] The Bedrock prompt in `handle_analyze` instructs Claude to return this same enriched JSON schema.
- [ ] All existing 53 pytest tests still pass after the changes.

### R2 & R3: Landing Page & Sample Demo
- [ ] The landing page (FileUploadZone) contains a statistic about the problem and a "How It Works" 3-step section.
- [ ] AWS service names (Textract, Bedrock) are visually called out on the landing page.
- [ ] Clicking the sample document button triggers the processing animation and then renders the full analysis dashboard with rich mock data — NO real API call is made.
- [ ] The analysis dashboard rendered from the sample shows a non-null, non-65 `riskScore` and rich flag objects (with `severity` and `recommendation`).
- [ ] `npm test` in `cleardoc-ui` passes with 0 failures after the changes.

### R4: Architecture Diagram
- [ ] The analysis dashboard has an accessible "AWS Architecture" view or tab.
- [ ] The diagram visually shows at minimum: API Gateway, Lambda, Textract, Bedrock, S3, DynamoDB.
- [ ] `npm run build` succeeds with 0 errors.

### R5: Submission Assets
- [ ] `DEPLOY.md` exists at `c:\New folder\DEPLOY.md` and contains at least the following sections: "Run Locally (No AWS Account Needed)", "Deploy to AWS (Ship It Track)", "Enable Amazon Bedrock Access".
- [ ] `BLOG_POST.md` exists at `c:\New folder\BLOG_POST.md` and is at least 600 words.

