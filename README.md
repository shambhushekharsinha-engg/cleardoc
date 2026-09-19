<h1 align="center">
  <br />
  <img src="https://img.shields.io/badge/🏆_WeMakeDevs_×_AWS-First_Commit_Hackathon_2026-FF9900?style=for-the-badge" alt="Hackathon" />
  <br /><br />
  <img src="https://img.shields.io/badge/AWS-Powered-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.13" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <br /><br />

  **ClearDoc — AI Legal Guardian**
  <br />
  <sub><sup>Don't sign what you don't understand.</sup></sub>
</h1>

<p align="center">
  ClearDoc transforms dense legal documents into plain English — with severity-rated risk flags, actionable negotiation advice, dark/light mode, and an AI chatbot — powered entirely by AWS serverless AI.
</p>

<p align="center">
  <a href="https://main.d1dmms845r1lj5.amplifyapp.com/" target="_blank"><strong>🌐 Live Demo</strong></a> •
  <a href="#-the-problem">Problem</a> •
  <a href="#-features">Features</a> •
  <a href="#-aws-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tests">Tests</a> •
  <a href="#-judging-criteria-alignment">Judging Criteria</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend%20Tests-55%20passing-brightgreen?style=flat-square&logo=pytest" />
  <img src="https://img.shields.io/badge/Frontend%20Tests-24%20passing-brightgreen?style=flat-square&logo=vitest" />
  <img src="https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?style=flat-square&logo=github-actions" />
  <img src="https://img.shields.io/badge/Dark%20Mode-Supported-8B5CF6?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## 🎯 The Problem

Over **60% of Indian tenants sign rental agreements without understanding key clauses**. Legal consultation costs ₹2,000–₹10,000 per hour. People trust that documents are "standard" — and routinely pay the price. A single overlooked maintenance clause can silently cost ₹40,000 or more.

ClearDoc makes legal document literacy **free, instant, and accessible to every Indian**.

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🔍 **AI Document Analysis** | Upload any PDF or image — Amazon Textract reads it, Amazon Bedrock (Claude 3 Haiku) decodes the legal language |
| ⚠️ **Severity-Rated Risk Flags** | Red flags marked as Critical or Warning, each with specific negotiation advice |
| ✅ **Safe Clause Highlights** | Green flags with plain-English explanations of how they protect you |
| 📊 **Visual Risk Score** | 0–100 animated risk meter so you know at a glance how risky the document is |
| 💬 **AI Document Chatbot** | Ask questions like "Who pays for maintenance?" — Claude 3 answers based on your specific document |
| ⚡ **1-Click Sample Demo** | Try with a sample Bangalore residential lease — no account, no upload needed |
| 🌗 **Dark / Light Mode** | Beautiful dark mode with system preference detection and smooth transitions |
| 🏗️ **Live Architecture Diagram** | Interactive in-app diagram of the full AWS pipeline — visible to judges in the UI |
| 📱 **Fully Responsive** | Works beautifully on mobile, tablet, and desktop |
| 📋 **Copy & Print Report** | Export the full analysis as text or print as PDF |
| 🔒 **Privacy First** | Documents stored in isolated S3 bucket with AES-256 encryption, never retained for training |

---

## 🏗️ AWS Architecture

```
                           ┌─────────────────────────────────────────────────┐
                           │                   AWS Cloud                      │
  ┌──────────┐   HTTPS     │  ┌────────────────┐   ┌─────────────────────┐   │
  │  Browser │ ──────────► │  │  API Gateway   │──►│  Lambda (Python 3.13)│   │
  │ (React19)│◄──────────  │  │  (REST API)    │   │  Orchestrator        │   │
  └──────────┘             │  └────────────────┘   └──────────┬──────────┘   │
       ▲                   │                                   │               │
       │                   │         ┌─────────────────────────┼──────────┐    │
       │                   │         ▼                         ▼          ▼    │
       │                   │  ┌─────────────┐  ┌────────────────┐  ┌─────────┐│
  AWS Amplify             │  │  Amazon S3  │  │Amazon Textract │  │DynamoDB ││
  (Frontend Host)         │  │ (Doc Store) │  │ (OCR Extract)  │  │(Chat DB)││
                           │  └─────────────┘  └────────────────┘  └─────────┘│
                           │                         │                          │
                           │                         ▼                          │
                           │               ┌──────────────────┐                 │
                           │               │  Amazon Bedrock  │                 │
                           │               │ (Claude 3 Haiku) │                 │
                           │               └──────────────────┘                 │
                           └─────────────────────────────────────────────────┘
```

### AWS Services Used

| Service | Purpose | Why It Matters |
|:---|:---|:---|
| **Amazon API Gateway** | REST API routing | Scales to millions of requests, zero ops |
| **AWS Lambda (Python 3.13)** | Serverless compute — orchestrates entire AI pipeline | Scales to zero, no idle cost |
| **Amazon S3** | Secure document storage via pre-signed upload URLs | AES-256 SSE, no direct server exposure |
| **Amazon Textract** | OCR — extracts text from scanned PDFs and images | Works even on photos of physical documents |
| **Amazon Bedrock (Claude 3 Haiku)** | AI clause analysis, risk scoring, and chat Q&A | State-of-the-art legal reasoning |
| **Amazon DynamoDB** | Stores extracted text + analysis for chat context | Persistent, fast, serverless |
| **AWS SAM** | Infrastructure as code — one-command deployment | Reproducible, version-controlled infra |
| **AWS Amplify Hosting** | Frontend hosting with GitHub CI/CD integration | Live URL with HTTPS, CDN-backed |

---

## 🌐 Live Deployment

| Component | URL |
|:---|:---|
| **Frontend (AWS Amplify)** | [https://main.d1dmms845r1lj5.amplifyapp.com/](https://main.d1dmms845r1lj5.amplifyapp.com/) |
| **Backend (API Gateway + Lambda)** | `https://dn1frmy58f.execute-api.us-east-1.amazonaws.com/Prod/` |
| **GitHub Repository** | [github.com/shambhushekharsinha-engg/cleardoc](https://github.com/shambhushekharsinha-engg/cleardoc) |

---

## 🚀 Quick Start

### Option 1: Try the Live Demo (Instant)

👉 **[https://main.d1dmms845r1lj5.amplifyapp.com/](https://main.d1dmms845r1lj5.amplifyapp.com/)**

Click **"Try with a Sample Lease Agreement"** — no account, no upload required. See a full AI analysis of a Bangalore residential lease instantly.

### Option 2: Run Locally (No AWS account needed)

```bash
# Clone the repo
git clone https://github.com/shambhushekharsinha-engg/cleardoc.git
cd cleardoc/cleardoc-ui

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** → Click **"Try with a Sample Lease Agreement"**.

The app includes a high-fidelity offline mock mode — it works perfectly without any AWS credentials.

### Option 3: Full Stack with Live AWS

See **[DEPLOY.md](./DEPLOY.md)** for the complete step-by-step deployment guide.

---

## 📦 Project Structure

```
cleardoc/
├── cleardoc-ui/               # React 19 + TailwindCSS v4 frontend
│   ├── src/
│   │   ├── contexts/          # ThemeContext (dark/light mode)
│   │   ├── components/
│   │   │   ├── analysis/      # AnalysisDashboard, RiskMeter, FlagCard, ArchitectureDiagram
│   │   │   ├── chat/          # ChatSidebar, SuggestedPrompts
│   │   │   ├── common/        # Header (with theme toggle), OnboardingGuide, Tooltip
│   │   │   └── upload/        # FileUploadZone, ProcessingStatus
│   │   ├── hooks/             # useDocumentAnalysis, useChat
│   │   ├── services/          # api.js (API layer with mock fallback)
│   │   ├── constants/         # mockData.js (India-specific), apiConfig.js
│   │   └── utils/             # fileValidation.js, cn.js
│   └── src/test/              # 24 Vitest integration & unit tests
│
├── cleardoc-api/              # AWS SAM serverless backend
│   ├── hello_world/
│   │   ├── app.py             # Lambda handler (API Gateway + Textract + Bedrock + DynamoDB)
│   │   ├── requirements.txt
│   │   └── tests/             # 55 pytest tests (unit + adversarial)
│   └── template.yaml          # SAM template (least-privilege IAM, S3 SSE, DynamoDB SSE)
│
├── .github/
│   └── workflows/
│       └── ci.yml             # 3-job parallel CI (frontend lint+test, backend pytest, sam-validate)
│
├── DEPLOY.md                  # Step-by-step AWS deployment guide
├── BLOG_POST.md               # AWS Builder Center blog post (~2,000 words)
└── README.md
```

---

## 🧪 Tests

### Backend (Python / pytest)
```bash
cd cleardoc-api/hello_world
pip install -r requirements-test.txt
pytest tests/ -v
# → 55 tests passing ✅
```

### Frontend (Vitest)
```bash
cd cleardoc-ui
npm test -- --run
# → 24 tests passing ✅
```

### Lint
```bash
cd cleardoc-ui
npm run lint
# → 0 errors ✅
```

### CI/CD
Every push triggers the GitHub Actions pipeline (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)):
- **Job 1**: Frontend lint (oxlint) + Vitest tests + production build
- **Job 2**: Backend pytest (55 tests)
- **Job 3**: `sam validate --lint` — SAM template structural check + Python 3.13 EOL check

---

## 🚢 Deploy to AWS (Ship It Track)

### Prerequisites
- [AWS Account (Free Tier)](https://aws.amazon.com/free/)
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) + `aws configure`
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

### Deploy Backend (< 5 minutes)
```bash
cd cleardoc-api
sam build
sam deploy --guided
# → Copy the API Gateway URL from Outputs table
```

### Deploy Frontend (AWS Amplify)
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Connect your GitHub repo (`shambhushekharsinha-engg/cleardoc`)
3. Set **Monorepo root** to `cleardoc-ui`
4. Set **Build command** to `npm install && npm run build`
5. Set **Output directory** to `dist`
6. Deploy!

See **[DEPLOY.md](./DEPLOY.md)** for complete instructions including enabling Bedrock model access.

---

## 🔑 Environment Variables

| Variable | Description | Default |
|:---|:---|:---|
| `VITE_API_BASE_URL` | Frontend → Backend API URL | Local dev fallback |
| `BUCKET_NAME` | S3 bucket for document storage | Set by SAM deploy |
| `DYNAMODB_TABLE` | DynamoDB table for chat context | Set by SAM deploy |
| `AWS_REGION` | AWS region | `us-east-1` |

The backend gracefully falls back to high-fidelity India-specific mock data when AWS credentials are unavailable — enabling zero-AWS demos.

---

## 🏆 Judging Criteria Alignment

This project was architected to score maximum points on every judging dimension:

### 1. 💡 Idea & Impact
- **Real problem**: 60%+ Indian tenants sign contracts they don't understand. Legal literacy gap costs thousands of rupees.
- **Quantifiable impact**: ClearDoc can identify a single hidden ₹40,000 maintenance clause in seconds.
- **Underserved audience**: Millions of Indian renters, job-seekers, and freelancers dealing with one-sided contracts.

### 2. ☁️ Built on AWS (Ship It Track)
- **6 AWS services** deeply integrated: API Gateway → Lambda → Textract → Bedrock → S3 → DynamoDB
- **Infrastructure as code**: AWS SAM template with least-privilege IAM, S3 SSE, DynamoDB SSE
- **Live deployed URL**: [https://main.d1dmms845r1lj5.amplifyapp.com/](https://main.d1dmms845r1lj5.amplifyapp.com/)
- **AWS Amplify Hosting**: GitHub-connected CI/CD pipeline auto-deploys on every push

### 3. 📚 Learning
- First-time integration of Amazon Textract + Bedrock in a real pipeline
- Learned serverless orchestration, pre-signed S3 URLs, DynamoDB context storage
- Mastered TailwindCSS v4's new plugin architecture and dark mode implementation
- Detailed learnings documented in [BLOG_POST.md](./BLOG_POST.md)

### 4. ⚙️ Execution
- **79 automated tests** (55 backend + 24 frontend) — all passing
- **GitHub Actions CI/CD** — 3 parallel jobs (lint, test, validate) on every push
- **Production build** in ~500ms
- **Error resilience**: graceful fallback to mock data on AWS failure, React ErrorBoundary, structured logging

### 5. 🎬 Demo Video
- **1-click demo**: Judges can see the full pipeline without uploading a document
- **AWS Architecture tab**: Visible in-app diagram shows every AWS service used
- **Dark mode toggle**: Impressive UX detail visible in the video

---

## 📝 Blog Post

Published on the AWS Builder Center: See **[BLOG_POST.md](./BLOG_POST.md)**

*(Eligible for the Logitech keyboard prize — Top 5 Blogs award)*

---

## 🤝 AI Tools Used

As required by the hackathon rules, we disclose the AI coding tools used:
- **Antigravity (Google DeepMind)** — Primary coding agent for implementation, testing, and deployment automation
- **Amazon Bedrock (Claude 3 Haiku)** — AI analysis engine built into the product itself

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ for the <strong>WeMakeDevs × AWS First Commit Hackathon 2026</strong>
  <br />
  <sub>Powered by Amazon Bedrock • Amazon Textract • AWS SAM • AWS Amplify</sub>
  <br /><br />
  <a href="https://main.d1dmms845r1lj5.amplifyapp.com/"><strong>🚀 Try ClearDoc Live →</strong></a>
</p>
