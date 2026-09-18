# Project: ClearDoc

## Architecture
ClearDoc is a production-ready, AI-powered legal document analyzer built with:
- **Backend (`cleardoc-api/`)**: AWS SAM Serverless application powered by Python Lambda (`hello_world/app.py`), Amazon Textract (OCR), Amazon Bedrock (Anthropic Claude 3 Haiku for analysis and Q&A), S3 (encrypted document storage with public access blocks), and DynamoDB (document metadata & chat histories). Hardened with structured JSON logging, strict AWS SDK error handling (`botocore.exceptions.ClientError`), and least-privilege IAM policies.
- **Frontend (`cleardoc-ui/`)**: React 19 + TailwindCSS v4 + Framer Motion (Vite 8), architected into modular UI components (`components/upload/`, `components/analysis/`, `components/chat/`, `components/common/`), decoupled custom hooks (`useDocumentAnalysis`, `useChat`), an abstracted API service layer (`services/api.js`), and beginner-friendly interactive guidance (accessible tooltips, onboarding walkthrough modal, sample lease loader, suggested chat prompt chips, and clause risk meters).
- **Automated Testing Suite**:
  - Backend: `pytest` in `cleardoc-api/hello_world/tests/` with standalone `boto3` mocking via `conftest.py`, testing upload, analyze, chat, error paths, and mock fallbacks without requiring external AWS credentials.
  - Frontend: `vitest` + `@testing-library/react` + `jsdom` testing file upload, analysis dashboard, interactive tooltips, chat stream/fallback, and reset flows.
- **CI/CD Pipeline (`.github/workflows/ci.yml`)**: Multi-job GitHub Actions workflow covering frontend lint/test/build, backend pytest validation, and AWS SAM template validation (`sam validate --lint`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Dual-Contract API Support | Support both query/body and camelCase/snake_case params for `/upload`, `/analyze`, `/chat` | M1 | Survey |
| F2 | Structured JSON Logging | Replace `print()` with Python `logging` emitting structured JSON (timestamps, loglevel, request_id, event details) | M1 | R3 |
| F3 | SDK Error Handling & Mock Fallback Resilience | Handle `ClientError` specifically for Bedrock, Textract, S3, DynamoDB; add `is_mock` flag; strip Claude markdown fences | M1 | R3 |
| F4 | Least-Privilege IAM & Security Hardening | Scope Bedrock ARN to Claude 3 Haiku; replace DynamoDBCrudPolicy with Read/Write; add S3 public access block & AES256 encryption; add DynamoDB SSE | M1 | R3 |
| F5 | SAM Template Route & CORS Hardening | Add POST method for `/upload` in `template.yaml`; configure CORS headers in `Globals.Api` | M1 | R3 |
| F6 | Frontend Monolith Deconstruction | Refactor `App.jsx` into modular components (`upload/`, `analysis/`, `chat/`, `common/`) and custom hooks (`useDocumentAnalysis`, `useChat`) | M2 | R4 |
| F7 | Lint & Bug Fixes | Fix all 5 `oxlint` warnings (arrow condition in `finally`, synchronous `setState` in `useEffect`, unused vars) and enforce clean lint | M2 | R4 |
| F8 | Performance Optimization | Decouple chat typing state from analysis dashboard to eliminate re-rendering cascades | M2 | R4 |
| F9 | Interactive Beginner Guidance & Tooltips | Accessible tooltips on risk cards/badges, "How ClearDoc Works" onboarding modal, sample lease quick-starter, suggested prompt chips | M2 | R4 |
| F10 | Reset & Document Navigation | Add "Analyze Another Document" reset mechanism with smooth Framer Motion transitions | M2 | R4 |
| F11 | Frontend API Client Abstraction | Create `services/api.js` handling dual contracts, error handling, and seamless fallback | M2 | R4 |
| F12 | Backend Automated Pytest Suite | Add `cleardoc-api/hello_world/tests/` (`conftest.py`, `test_upload.py`, `test_analyze.py`, `test_chat.py`, `test_routing.py`) | M3 | R1 |
| F13 | Frontend Vitest & RTL Test Suite | Configure Vitest, jsdom, and RTL in `cleardoc-ui/` covering upload, analysis, fallback, chat, and tooltips | M3 | R1 |
| F14 | GitHub Actions CI/CD Pipeline | Implement `.github/workflows/ci.yml` running frontend lint/test/build, backend pytest, and `sam validate` | M4 | R2 |
| F15 | E2E Integration & Acceptance Verification | Verify all 5 acceptance criteria: `npm run lint`, `npm test`, `pytest`, `sam validate`, `ci.yml` validity | M5 | Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Hardening (`cleardoc-api`) | F1, F2, F3, F4, F5 in `cleardoc-api/hello_world/app.py` and `cleardoc-api/template.yaml` | None | DONE |
| M2 | Frontend Refactoring & UI Improvements (`cleardoc-ui`) | F6, F7, F8, F9, F10, F11 in `cleardoc-ui/src/` | M1 (Interface Contracts) | DONE |
| M3 | Comprehensive Testing (Backend & Frontend) | F12, F13 in `cleardoc-api/hello_world/tests/` and `cleardoc-ui/src/test/` | M1, M2 | DONE |
| M4 | CI/CD Pipeline (`.github/workflows/ci.yml`) | F14 in `.github/workflows/ci.yml` | M1, M2, M3 | DONE |
| M5 | Final E2E Verification & Audit | F15 full integration verification across all acceptance criteria | M1, M2, M3, M4 | DONE |

## Interface Contracts

### Frontend ↔ Backend API (`cleardoc-ui` ↔ `cleardoc-api`)
- **GET /upload?filename={filename}** or **POST /upload** with `{ filename, contentType }`:
  - Request: Query param `filename` or JSON body `{ filename, contentType }`.
  - Response (200 OK):
    ```json
    {
      "uploadUrl": "https://...",
      "documentId": "uuid-v4-string",
      "objectKey": "uploads/uuid-v4-string.ext",
      "key": "uploads/uuid-v4-string.ext"
    }
    ```
- **POST /analyze**:
  - Request JSON: `{ "objectKey": "...", "documentId": "..." }` (also accepts `{ "key": "..." }`).
  - Response (200 OK):
    ```json
    {
      "documentId": "...",
      "summary": "Plain English summary...",
      "redFlags": ["Clause 1...", "Clause 2..."],
      "greenFlags": ["Clause 1...", "Clause 2..."],
      "is_mock": true|false
    }
    ```
- **POST /chat**:
  - Request JSON: `{ "documentId": "...", "question": "..." }` (also accepts `{ "document_id": "..." }`).
  - Response (200 OK):
    ```json
    {
      "documentId": "...",
      "question": "...",
      "answer": "Plain English answer...",
      "is_mock": true|false
    }
    ```
- **Error Responses**: All endpoints return JSON with `{ "error": "Descriptive message" }` on 400/500 with proper CORS headers.

## Code Layout
```
c:\New folder\
├── .github/
│   └── workflows/
│       └── ci.yml                          # M4: CI/CD Pipeline
├── cleardoc-api/
│   ├── template.yaml                       # M1: Hardened SAM template (IAM, S3, DynamoDB, CORS)
│   └── hello_world/
│       ├── app.py                          # M1: Hardened Lambda handler (logging, error handling, dual contracts)
│       ├── requirements.txt                # Production requirements (boto3)
│       ├── requirements-test.txt           # Test requirements (pytest, pytest-mock)
│       └── tests/                          # M3: Pytest suite
│           ├── __init__.py
│           ├── conftest.py                 # Standalone boto3 & AWS mock fixtures
│           ├── test_upload.py
│           ├── test_analyze.py
│           ├── test_chat.py
│           └── test_routing.py
└── cleardoc-ui/
    ├── package.json                        # M2/M3: Scripts and dependencies (Vitest, RTL, jsdom)
    ├── vite.config.js                      # M3: Vitest configuration
    └── src/
        ├── App.jsx                         # M2: Main orchestration view (clean, modular)
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── common/
        │   │   ├── Tooltip.jsx             # M2: Accessible tooltip component
        │   │   ├── OnboardingGuide.jsx     # M2: "How ClearDoc Works" tour modal
        │   │   ├── SampleDocumentLoader.jsx# M2: Quick-start sample lease agreement
        │   │   ├── Header.jsx              # M2: Navigation and status badge
        │   │   └── ErrorBoundary.jsx       # M2: Graceful error fallback
        │   ├── upload/
        │   │   ├── FileUploadZone.jsx      # M2: Drag & drop with client validation
        │   │   └── ProcessingStatus.jsx    # M2: 3-step animated progress indicators
        │   ├── analysis/
        │   │   ├── AnalysisDashboard.jsx   # M2: Grid layout for summary & flags
        │   │   ├── SummaryCard.jsx         # M2: Plain-English summary with tooltips
        │   │   ├── FlagCard.jsx            # M2: Severity badges & negotiation tips
        │   │   └── RiskMeter.jsx           # M2: Visual risk overview
        │   └── chat/
        │       ├── ChatSidebar.jsx         # M2: Isolated chat drawer with suggestions
        │       └── SuggestedPrompts.jsx    # M2: Interactive question chips
        ├── hooks/
        │   ├── useDocumentAnalysis.js      # M2: Document upload and analysis state
        │   └── useChat.js                  # M2: Chat message stream state
        ├── services/
        │   └── api.js                      # M2: Robust API client with dual contract & fallback
        └── test/
            ├── setup.js                    # M3: Testing library setup
            ├── App.test.jsx                # M3: Full flow tests
            ├── FileUploadZone.test.jsx     # M3: Upload tests
            ├── AnalysisDashboard.test.jsx  # M3: Analysis & tooltip tests
            └── ChatSidebar.test.jsx        # M3: Chat flow tests
```
