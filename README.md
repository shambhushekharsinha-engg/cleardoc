<h1 align="center">
  <br />
  <img src="https://img.shields.io/badge/AWS-Powered-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS Powered" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Python-3.9-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <br />
  <br />
  ClearDoc — AI Legal Guardian
  <br />
  <sub><sup>WeMakeDevs × AWS First Commit Hackathon 2026</sup></sub>
</h1>

<p align="center">
  <strong>Don't sign what you don't understand.</strong>
  <br />
  ClearDoc transforms dense legal documents into plain English — with severity-rated risk flags, actionable negotiation advice, and an AI chatbot — powered entirely by AWS serverless AI.
</p>

<p align="center">
  <a href="#-demo">Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-aws-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deploy-to-aws">Deploy to AWS</a> •
  <a href="#-tests">Tests</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tests-55%20passing-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend%20Tests-24%20passing-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## 🎯 The Problem

Over **60% of Indian tenants sign rental agreements without understanding key clauses**. Legal consultation costs ₹2,000–₹10,000 per hour. People trust that documents are "standard" — and routinely pay the price. A single overlooked maintenance clause can cost ₹40,000 or more.

ClearDoc makes legal document literacy free, instant, and accessible to everyone.

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🔍 **AI Document Analysis** | Upload any PDF or image — Amazon Textract reads it, Amazon Bedrock (Claude 3) decodes the legal language |
| ⚠️ **Severity-Rated Risk Flags** | Red flags marked as Critical or Warning, each with specific negotiation advice |
| ✅ **Safe Clause Highlights** | Green flags with plain-English explanations of how they protect you |
| 📊 **Risk Score** | 0–100 visual risk meter so you know at a glance how favorable the document is |
| 💬 **AI Document Chatbot** | Ask questions like "Who pays for maintenance?" — Claude 3 answers based on your specific document |
| ⚡ **1-Click Demo** | Try with a sample Bangalore residential lease — no account, no upload needed |
| 🏗️ **Architecture Diagram** | Live in-app interactive diagram of the full AWS pipeline |
| 📱 **Fully Responsive** | Works beautifully on mobile, tablet, and desktop |

---

## 🏗️ AWS Architecture

```
                           ┌─────────────────────────────────────────┐
                           │              AWS Cloud                   │
  ┌──────────┐   HTTPS     │  ┌────────────┐     ┌─────────────────┐ │
  │  Browser │ ──────────► │  │ API Gateway│────►│  Lambda (Python)│ │
  │  (React) │             │  └────────────┘     └────────┬────────┘ │
  └──────────┘             │                              │           │
                           │              ┌───────────────┼───────────┤
                           │              ▼               ▼           │
                           │  ┌──────────────┐  ┌──────────────────┐ │
                           │  │  Amazon S3   │  │ Amazon Textract  │ │
                           │  │(Doc Storage) │  │  (OCR / Extract) │ │
                           │  └──────────────┘  └──────────────────┘ │
                           │              │               │           │
                           │              ▼               ▼           │
                           │  ┌──────────────┐  ┌──────────────────┐ │
                           │  │  DynamoDB    │  │ Amazon Bedrock   │ │
                           │  │(Chat Context)│  │(Claude 3 Haiku)  │ │
                           │  └──────────────┘  └──────────────────┘ │
                           └─────────────────────────────────────────┘
```

### AWS Services Used

| Service | Purpose |
|:---|:---|
| **Amazon API Gateway** | REST API endpoint — routes frontend requests to Lambda |
| **AWS Lambda (Python 3.9)** | Serverless compute — orchestrates the entire AI pipeline |
| **Amazon S3** | Secure document storage via pre-signed upload URLs |
| **Amazon Textract** | OCR — extracts text from PDF, image, and scanned documents |
| **Amazon Bedrock (Claude 3 Haiku)** | AI clause analysis, risk scoring, and chat Q&A |
| **Amazon DynamoDB** | Stores extracted text + analysis for chat context |
| **AWS SAM** | Infrastructure as code — one command deployment |

---

## 🚀 Quick Start

### Option 1: Try the Demo (No account needed)

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

You'll see a full analysis of a Bangalore residential lease with real risk flags and AI-powered negotiation advice — **no AWS credentials required**.

### Option 2: Full Stack with Live AWS

See **[DEPLOY.md](./DEPLOY.md)** for the complete deployment guide.

---

## 📦 Project Structure

```
cleardoc/
├── cleardoc-ui/               # React 19 + TailwindCSS v4 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/      # AnalysisDashboard, RiskMeter, FlagCard, ArchitectureDiagram
│   │   │   ├── chat/          # ChatSidebar, SuggestedPrompts
│   │   │   ├── common/        # Header, OnboardingGuide, SampleDocumentLoader, Tooltip
│   │   │   └── upload/        # FileUploadZone, ProcessingStatus
│   │   ├── hooks/             # useDocumentAnalysis, useChat
│   │   ├── services/          # api.js (API layer)
│   │   ├── constants/         # mockData.js, apiConfig.js
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
├── DEPLOY.md                  # Step-by-step deployment guide
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
npm test
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
- **Job 1**: Frontend lint + Vitest tests
- **Job 2**: Backend pytest
- **Job 3**: `sam validate` — SAM template structural check

---

## 🚢 Deploy to AWS (Ship It Track)

### Prerequisites
- [AWS Account (Free Tier)](https://aws.amazon.com/free/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) + `aws configure`
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

### Deploy Backend
```bash
cd cleardoc-api
sam build
sam deploy --guided
# → Copy the API Gateway URL from output
```

### Deploy Frontend
```bash
cd cleardoc-ui
# Update src/constants/apiConfig.js with your API Gateway URL
npm run build
# → Upload dist/ to AWS Amplify Hosting (free tier)
```

See **[DEPLOY.md](./DEPLOY.md)** for full instructions including enabling Amazon Bedrock model access.

---

## 🔑 Environment Variables

| Variable | Description | Default |
|:---|:---|:---|
| `BUCKET_NAME` | S3 bucket for document storage | Set by SAM deploy |
| `DYNAMODB_TABLE` | DynamoDB table for chat context | Set by SAM deploy |
| `AWS_REGION` | AWS region | `ap-south-1` |

The backend gracefully falls back to high-fidelity mock data when AWS credentials are unavailable.

---

## 🏆 Hackathon Details

**Event**: WeMakeDevs × AWS First Commit Hackathon — Bharat Builds Tour
**Date**: September 17–20, 2026
**Track**: Ship It (deployed on AWS) + Best UI
**Judging Criteria**: Idea & Impact | Built on AWS | Learning | Execution | Demo Video

### Why ClearDoc Wins
- ✅ **Real problem**: 60%+ Indian tenants sign without understanding
- ✅ **Deep AWS integration**: Textract + Bedrock + S3 + DynamoDB + SAM + API Gateway
- ✅ **Production quality**: 79 tests (55 backend + 24 frontend), CI/CD, least-privilege IAM
- ✅ **Impressive demo**: 1-click sample, live architecture diagram, chat with your document
- ✅ **Scalable**: Serverless, scales to zero, no idle cost

---

## 📝 Blog Post

Published on the AWS Builder Center: See **[BLOG_POST.md](./BLOG_POST.md)**

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ for the <strong>WeMakeDevs × AWS First Commit Hackathon 2026</strong>
  <br />
  <sub>Powered by Amazon Bedrock • Amazon Textract • AWS SAM</sub>
</p>
