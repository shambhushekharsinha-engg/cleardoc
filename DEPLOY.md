# ClearDoc — Deployment & Operations Guide
> **WeMakeDevs × AWS First Commit Hackathon (Ship It & Best UI Tracks)**  
> Complete operational manual for running locally with built-in zero-config mocks, deploying live to AWS using the Serverless Application Model (SAM), and unlocking Amazon Bedrock Claude 3 access.

---

## Architecture Overview

ClearDoc is designed as a decoupled, 100% serverless cloud application:
- **Frontend (`cleardoc-ui/`)**: React 19 + TailwindCSS v4 + Framer Motion (Vite SPA) hosted on **AWS Amplify Hosting**.
- **Backend API (`cleardoc-api/`)**: AWS SAM stack orchestrating **Amazon API Gateway (REST)**, **AWS Lambda (Python 3.9)**, **Amazon S3** (document vault with AES-256 SSE), **Amazon Textract** (OCR), **Amazon Bedrock** (Anthropic Claude 3 Haiku), and **Amazon DynamoDB** (document & chat session cache).

```
┌───────────────────────────────────────────────────────────────────────────┐
│                             USER BROWSER                                  │
│                       (React 19 on AWS Amplify)                           │
└──────────────┬────────────────────────────────────────────┬───────────────┘
               │ 1. Request Presigned URL                   │ 2. Direct PUT
               ▼                                            ▼
┌──────────────────────────────┐              ┌─────────────────────────────┐
│    Amazon API Gateway        │              │       Amazon S3             │
│   (CORS Enabled REST API)    │              │  (DocumentsBucket, AES-256) │
└──────────────┬───────────────┘              └─────────────┬───────────────┘
               │ 3. Invoke                                  │
               ▼                                            │ 4. Read File
┌───────────────────────────────────────────────────────────┴───────────────┐
│                        AWS Lambda Orchestrator                            │
│                 (Python 3.9 · 256MB RAM · 30s Timeout)                    │
└──────────────┬────────────────────────────┬───────────────────────────────┘
               │ 5. DetectDocumentText      │ 6. InvokeModel (Claude 3)
               ▼                            ▼
┌──────────────────────────────┐  ┌─────────────────────────────────────────┐
│       Amazon Textract        │  │       Amazon Bedrock                    │
│   (Deep Learning OCR Engine) │  │  (Anthropic Claude 3 Haiku Foundation)  │
└──────────────────────────────┘  └─────────────────────────────────────────┘
                                            │
                                            │ 7. Cache Summary & Context
                                            ▼
                                  ┌─────────────────────────────────────────┐
                                  │       Amazon DynamoDB                   │
                                  │   (ClearDocTable, PAY_PER_REQUEST)      │
                                  └─────────────────────────────────────────┘
```

---

## 1. Run Locally (No AWS Account Needed)

ClearDoc features a production-grade **graceful mock fallback engine**. If AWS credentials, SAM CLI, or internet access are unavailable, the application automatically activates high-fidelity demo simulations based on real Bangalore residential leases. You can test and demonstrate all features immediately with zero cloud configuration.

### System Requirements
- **Node.js**: v18.0.0 or later (Node.js 20+ recommended)
- **npm**: v9.0.0 or later

### Step 1: Start the Frontend
1. Open your terminal and navigate to `cleardoc-ui`:
   ```bash
   cd cleardoc-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open **http://localhost:5173** in your web browser.

### Step 2: Test the 1-Click Demo (Hackathon Judges Quickstart)
1. On the landing page, locate the **"— or try with a sample —"** section below the upload box.
2. Click **"Try with a Sample Lease Agreement (No account needed)"**.
3. Watch the phased processing animation cycle through document ingestion, Amazon Textract OCR extraction, and Amazon Bedrock legal reasoning.
4. Review the full analysis dashboard:
   - **Document Risk Meter**: High Risk (78/100 score).
   - **Plain English Summary**: 12-month Koramangala, Bangalore 2BHK rental breakdown.
   - **Red Flags**: Structural maintenance liabilities, 7-day unilateral eviction clauses, and daily compounding late fees.
   - **Green Flags**: 2-month deposit caps, included society maintenance, and 5% rent hike limits.
   - **Interactive Chat**: Ask questions like *"Who pays for plumbing?"* or *"Can the landlord evict me without notice?"*.
   - **AWS Architecture View**: Click the **"AWS Architecture"** tab in the top-right header to inspect the serverless pipeline.

### Step 3: (Optional) Run the Local SAM Backend
If you have Docker and AWS SAM CLI installed and wish to run the Python Lambda API locally:
```bash
cd cleardoc-api
sam build
sam local start-api --port 3000
```
The frontend is already configured to communicate with `http://127.0.0.1:3000` via `cleardoc-ui/src/constants/apiConfig.js`. If SAM is not running, the frontend automatically falls back to client-side mock data without throwing unhandled exceptions.

---

## 2. Deploy to AWS (Ship It Track)

Deploying ClearDoc to AWS provisions a live, publicly accessible HTTPS application eligible for the **Ship It** grand prize (₹2,00,000 + $3,000 AWS credits).

### Prerequisites
1. **AWS Account**: An active AWS Free Tier account ([Create free account](https://aws.amazon.com/free/)).
2. **AWS CLI**: Installed and configured ([AWS CLI Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)).
   ```bash
   aws configure
   ```
   *Enter your AWS Access Key ID, Secret Access Key, Default region name (`us-east-1`), and Default output format (`json`).*
3. **AWS SAM CLI**: Installed ([SAM CLI Install Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)).
4. **Python**: Python 3.9+ with `pip`.

---

### Step 1: Deploy the Serverless Backend

We recommend deploying to **`us-east-1` (US East - N. Virginia)** because Amazon Bedrock's Anthropic Claude 3 Haiku model access is immediately grantable without requiring cross-region inference profiles.

1. Navigate to the backend directory:
   ```bash
   cd cleardoc-api
   ```
2. Build the SAM application container and Python dependencies:
   ```bash
   sam build
   ```
3. Deploy the application interactively:
   ```bash
   sam deploy --guided
   ```
4. Configure the guided deployment prompts as follows:
   - **Stack Name [cleardoc-api]**: Press `Enter` (default: `cleardoc-api`).
   - **AWS Region [us-east-1]**: Type `us-east-1` and press `Enter`.
   - **Confirm changes before deploy [y/N]**: Type `y`.
   - **Allow SAM CLI to create IAM roles [Y/n]**: Type `Y` (grants permission to create scoped policies for S3, DynamoDB, Textract, Bedrock).
   - **Disable rollback [y/N]**: Type `N`.
   - **UploadApi has no authentication. Is this okay? [y/N]**: Type `y`.
   - **UploadApiPost has no authentication. Is this okay? [y/N]**: Type `y`.
   - **AnalyzeApi has no authentication. Is this okay? [y/N]**: Type `y`.
   - **ChatApi has no authentication. Is this okay? [y/N]**: Type `y`.
   - **Save arguments to configuration file [Y/n]**: Type `Y`.
   - **SAM configuration file [samconfig.toml]**: Press `Enter`.
   - **SAM configuration environment [default]**: Press `Enter`.

5. Confirm the changeset when prompted. SAM will provision:
   - `DocumentsBucket` (Amazon S3 bucket with private ACL and AES-256 encryption)
   - `ClearDocTable` (Amazon DynamoDB table with on-demand capacity)
   - `ClearDocFunction` (AWS Lambda function with IAM execution roles)
   - `ServerlessRestApi` (Amazon API Gateway with CORS enabled)

6. **Save the API Gateway URL**: When deployment completes, inspect the **Outputs** section:
   ```
   -----------------------------------------------------------------------------------------
   Outputs
   -----------------------------------------------------------------------------------------
   Key                 ApiEndpoint
   Description         API Gateway endpoint URL
   Value               https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod/
   -----------------------------------------------------------------------------------------
   ```
   Copy this `Value` URL.

---

### Step 2: Connect Frontend to Live Backend

1. Open `cleardoc-ui/src/constants/apiConfig.js` in your editor.
2. Update `API_BASE_URL` with your newly deployed API Gateway endpoint:
   ```javascript
   // cleardoc-ui/src/constants/apiConfig.js
   export const API_BASE_URL = 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod';
   ```
3. Build the production React application:
   ```bash
   cd cleardoc-ui
   npm run build
   ```
   This creates an optimized, production-ready static bundle in `cleardoc-ui/dist/`.

---

### Step 3: Host Frontend on AWS Amplify (Free Tier)

AWS Amplify provides global CDN distribution, automatic HTTPS certificates, and continuous deployment.

#### Option A: Drag-and-Drop via Amplify Console (Fastest — 60 Seconds)
1. Open the [AWS Amplify Console](https://console.aws.amazon.com/amplify/home?region=us-east-1).
2. Click **"Deploy an app"** (or **"New app"** → **"Host web app"**).
3. Select **"Deploy without Git provider"** and click **Continue**.
4. Set **App name** to `cleardoc-ui` and **Branch name** to `main`.
5. Drag and drop the `cleardoc-ui/dist` folder into the drop area.
6. Click **"Save and deploy"**.
7. In under 60 seconds, AWS Amplify will generate a live HTTPS URL (e.g., `https://main.d123456789.amplifyapp.com`).

#### Option B: Automated Git CI/CD via Amplify
1. Push your repository to GitHub.
2. In the AWS Amplify Console, select **"Host web app"** → **"GitHub"**.
3. Select your repository and `main` branch.
4. Amplify auto-detects Vite settings. Click **Next** → **Save and deploy**.
5. Every `git push` will automatically trigger a new deployment.

---

## 3. Enable Amazon Bedrock Access

Amazon Bedrock foundation models (including Anthropic Claude 3) are not enabled by default in newly created AWS accounts. Follow these steps to enable **Anthropic Claude 3 Haiku**:

1. **Sign in**: Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. **Select Region**: In the top-right region selector, choose **US East (N. Virginia) `us-east-1`** (or whichever region you deployed your SAM backend to).
3. **Navigate to Bedrock**: In the search bar at the top, type `Bedrock` and select **Amazon Bedrock**.
4. **Open Model Access**:
   - In the left sidebar navigation menu, scroll down to the bottom.
   - Under the **"Bedrock configurations"** header, click **"Model access"**.
5. **Request Access**:
   - In the top-right corner of the Model Access page, click the orange **"Modify model access"** (or **"Manage model access"**) button.
   - Locate **Anthropic** in the model provider list.
   - Check the checkbox next to **Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`).
   - *(Optional)* Check **Claude 3 Sonnet** if you wish to experiment with deeper clause analysis.
6. **Submit Use-Case Information**:
   - If prompted for company details, enter your hackathon information:
     - *Company / Organization*: `ClearDoc Hackathon Team (WeMakeDevs)`
     - *Website*: Your GitHub repo URL or `https://github.com/wemakedevs`
     - *Industry*: `Technology / Education`
   - Access for Claude 3 Haiku is auto-approved and granted instantly (within 30–60 seconds).
7. **Verify Activation**:
   - Return to the **Model access** screen.
   - Confirm that the status next to **Claude 3 Haiku** displays green **"Access granted"**.

> **Note on Amazon Textract**: Textract is activated automatically under standard AWS credentials. No manual console approval or model request is required.

---

## 4. Cost Analysis & Free Tier Compliance

ClearDoc is engineered specifically to operate well within the **AWS Free Tier** and hackathon promotional credit allocations:

| AWS Service | ClearDoc Usage Pattern | AWS Free Tier Allowance | Production Cost Beyond Free Tier |
|---|---|---|---|
| **Amazon Bedrock** | Anthropic Claude 3 Haiku (1 prompt + 1 analysis per doc) | Pay-as-you-go (approx $0.00025 input / $0.00125 output per 1K tokens) | **~$0.0008 (~₹0.07)** per 3-page agreement |
| **Amazon Textract** | `detect_document_text` on uploaded files | **1,000 pages free / month** for first 3 months | $0.0015 per page |
| **AWS Lambda** | Python 3.9 orchestration (256MB RAM) | **1,000,000 free requests / month** + 3.2M compute sec | $0.0000000042 per 128MB-ms |
| **Amazon API Gateway** | REST API proxy | **1,000,000 free API calls / month** for 12 months | $3.50 per million calls |
| **Amazon S3** | Encrypted document storage | **5 GB standard storage**, 20,000 GET, 2,000 PUT requests | $0.023 per GB/month |
| **Amazon DynamoDB** | Document metadata & chat state | **25 GB storage**, 25 WCU, 25 RCU perpetually free | $0.00 (Free Tier permanent) |
| **AWS Amplify** | Static React frontend hosting | **1,000 build minutes / month**, 15 GB served / month | $0.15 per GB served |

*Total cost to analyze 500 legal agreements during a hackathon evaluation is under **$0.75 (approx ₹60)**.*

---

## 5. Automated Verification & Smoke Testing

To verify end-to-end functionality before submitting your project to judges:

### 1. Test the Backend Python Test Suite
```bash
cd cleardoc-api/hello_world
pip install -r requirements-test.txt
pytest tests/ -v
```
*Expected: 53 passing unit tests verifying error handling, mock fallbacks, sanitization, and Bedrock/Textract/DynamoDB mocking.*

### 2. Test the Frontend Vitest Suite
```bash
cd cleardoc-ui
npm test
```
*Expected: 24+ passing tests verifying FileUploadZone, RiskMeter, ChatSidebar, AnalysisDashboard, and ArchitectureDiagram.*

### 3. Verify Static Linting
```bash
cd cleardoc-ui
npm run lint
```
*Expected: 0 errors, 0 warnings.*

### 4. Smoke Test the Live API Endpoint
Test your live API Gateway upload endpoint with `curl`:
```bash
curl -X GET "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/Prod/upload?filename=test.pdf"
```
*Expected JSON Response*:
```json
{
  "uploadUrl": "https://cleardoc-api-documentsbucket-....s3.amazonaws.com/...",
  "documentId": "c8b4f17e-...",
  "objectKey": "c8b4f17e-.../test.pdf",
  "is_mock": false
}
```

---

## 6. Troubleshooting & FAQ

- **Issue: Bedrock returns `AccessDeniedException` or `ResourceNotFoundException`**:
  *Fix*: Ensure you switched to `us-east-1` in the AWS Console and enabled **Claude 3 Haiku** under Bedrock Model Access. Also verify that your Lambda function's execution role has `bedrock:InvokeModel` permission (defined in `cleardoc-api/template.yaml`).
- **Issue: S3 upload fails with CORS error in browser console**:
  *Fix*: The S3 bucket in `template.yaml` already configures `AllowedHeaders: ['*']` and `AllowedMethods: ['PUT', 'POST', 'GET']`. If deploying a custom bucket, re-run `sam deploy` to ensure CORS policies are applied.
- **Issue: Frontend cannot reach backend during local development**:
  *Fix*: ClearDoc has automated fallback. If SAM is offline, the app continues functioning seamlessly using client-side mock models.

---
*ClearDoc — Built for Bharat Builds Tour 2026 · WeMakeDevs × AWS First Commit Hackathon.*
