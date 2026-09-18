# ClearDoc Project Context

## Overview
**ClearDoc** is a web application designed for the First Commit Hackathon (Ship It / Best UI tracks). It allows users to upload complex legal documents (like rental agreements or employment contracts). The app extracts the text, uses AI to summarize it in plain English, highlights "red flags" (risky clauses) and "green flags" (standard/safe clauses), and provides an AI chatbot for asking specific questions about the document.

## Architecture
- **Frontend**: React + TailwindCSS + Framer Motion (Vite) built in `cleardoc-ui/`. Hosted on AWS Amplify or locally for demo purposes.
- **Backend**: AWS Serverless (SAM) built in `cleardoc-api/`.
  - **API Gateway**: Exposes endpoints for file processing.
  - **Lambda (Python)**: Integrates with AWS Textract (for OCR/Text Extraction) and Amazon Bedrock (Claude 3 for AI analysis and chat).
  - **S3**: Stores uploaded documents securely.
  - **DynamoDB**: Stores document analysis results and chat histories.

## Current Status
- ✅ **Frontend UI (Best UI Track Optimized)**: Completed. The UI now features a premium glassmorphism design, staggered Framer Motion animations, and specific phased loading states that visually explain the AWS architecture during the demo.
- ✅ **Backend Implementation**: Completed. AWS SAM API endpoints `/upload`, `/analyze`, `/chat` are implemented with robust mock fallbacks for local video recording.
- ✅ **Project Organization & Strategy**: Completed. Top-level README and a `winning_strategy.md` document created to guide the perfect hackathon submission and demo video.

## Development Steps
1. ✅ **Refine Specs**: Validated architecture.
2. ✅ **Backend Real Implementation**: Fleshed out Lambda functions.
3. ✅ **Frontend Integration**: Updated React app to call local API endpoints.
4. ✅ **UI Overhaul & Strategy**: Implemented Framer Motion animations, premium styling, and wrote the demo video script.
5. 🚧 **Deployment**: Awaiting user deployment via `sam deploy` (optional for local demo recording).
