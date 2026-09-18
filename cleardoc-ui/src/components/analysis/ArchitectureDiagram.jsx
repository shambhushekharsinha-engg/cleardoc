import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Zap,
  ScanText,
  Sparkles,
  Database,
  Layers,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  Printer,
  Info,
  Cpu,
  Server,
  Lock,
} from 'lucide-react';

const AWS_SERVICES = [
  {
    id: 'client',
    name: 'React 19 Client',
    category: 'Frontend & Edge',
    awsService: 'AWS Amplify / Vite',
    icon: Globe,
    color: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700',
      badge: 'bg-sky-100 text-sky-800',
      accent: '#0284c7',
    },
    specs: 'React 19 + Tailwind v4 + Framer Motion',
    role: 'Client SPA serving interactive upload zone, animated analysis dashboard, and contextual chat interface.',
    iam: 'Public HTTPS / Pre-signed URL PUT client',
    latency: '< 50ms initial load via CDN',
    cost: 'AWS Amplify Free Tier (1,000 build min/mo, 15GB served)',
    flows: ['upload', 'analyze', 'chat']
  },
  {
    id: 'gateway',
    name: 'Amazon API Gateway',
    category: 'API & Networking',
    awsService: 'Amazon API Gateway (REST)',
    icon: Server,
    color: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      badge: 'bg-violet-100 text-violet-800',
      accent: '#7c3aed',
    },
    specs: 'REST API · CORS Enabled · /upload, /analyze, /chat',
    role: 'Central API router receiving client requests, enforcing CORS headers, and triggering backend Lambda handlers.',
    iam: 'lambda:InvokeFunction permission',
    latency: '< 20ms routing overhead',
    cost: 'Free Tier: 1M calls/month for 12 months, then $3.50/M',
    flows: ['upload', 'analyze', 'chat']
  },
  {
    id: 's3',
    name: 'Amazon S3',
    category: 'Storage & Ingestion',
    awsService: 'Amazon Simple Storage Service',
    icon: Database,
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-900',
      accent: '#d97706',
    },
    specs: 'DocumentsBucket · AES-256 SSE · Block Public Access',
    role: 'Receives direct multi-page PDF/image uploads via pre-signed URLs. Completely eliminates Lambda payload limit bottlenecks (6MB).',
    iam: 's3:PutObject, s3:GetObject (Least-privilege scoped to DocumentsBucket)',
    latency: '50-120ms direct S3 upload',
    cost: 'Free Tier: 5GB storage, 20,000 GET, 2,000 PUT requests',
    flows: ['upload']
  },
  {
    id: 'lambda',
    name: 'AWS Lambda Orchestrator',
    category: 'Serverless Compute',
    awsService: 'AWS Lambda (Python 3.9)',
    icon: Zap,
    color: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      accent: '#ea580c',
    },
    specs: 'ClearDocFunction · 256MB RAM · 30s Timeout · Python 3.9',
    role: 'Central orchestration engine. Generates pre-signed S3 URLs, triggers Textract OCR, coordinates Claude 3 prompts, and manages DynamoDB caching.',
    iam: 'Managed CloudWatch logs + scoped S3, DynamoDB, Bedrock, and Textract policies',
    latency: '150-350ms execution overhead (excl. LLM inference)',
    cost: 'Free Tier: 1,000,000 requests & 3.2M sec compute/month forever',
    flows: ['upload', 'analyze', 'chat']
  },
  {
    id: 'textract',
    name: 'Amazon Textract',
    category: 'Document AI / OCR',
    awsService: 'Amazon Textract',
    icon: ScanText,
    color: {
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-200',
      text: 'text-fuchsia-700',
      badge: 'bg-fuchsia-100 text-fuchsia-800',
      accent: '#c026d3',
    },
    specs: 'detect_document_text · Sync/Async PDF & Image OCR',
    role: 'Deep learning OCR extracting raw lines and tokens from scanned leases, photographed mobile documents, and digital PDFs.',
    iam: 'textract:DetectDocumentText, textract:StartDocumentTextDetection, textract:GetDocumentTextDetection',
    latency: '600-1,200ms per 3-page agreement',
    cost: 'Free Tier: 1,000 pages/month for first 3 months ($0.0015/page thereafter)',
    flows: ['analyze']
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock (Claude 3)',
    category: 'Generative Legal AI',
    awsService: 'Amazon Bedrock · Claude 3 Haiku',
    icon: Sparkles,
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      accent: '#059669',
    },
    specs: 'anthropic.claude-3-haiku-20240307-v1:0 · 1000 max tokens',
    role: 'Analyzes extracted legal clauses, detects one-sided liabilities, outputs 0-100 Risk Score, generates counter-proposals, and powers interactive Q&A.',
    iam: 'bedrock:InvokeModel (Scoped to Claude 3 Haiku ARN)',
    latency: '1.2s - 2.1s Time-to-First-Token (TTFT)',
    cost: '$0.00025 / 1k input tokens · $0.00125 / 1k output tokens (~₹0.02/analysis)',
    flows: ['analyze', 'chat']
  },
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    category: 'State & Chat Memory',
    awsService: 'Amazon DynamoDB (NoSQL)',
    icon: Layers,
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      accent: '#2563eb',
    },
    specs: 'ClearDocTable · PAY_PER_REQUEST · HASH(document_id)',
    role: 'Persists parsed legal text, summary, flags, and chat dialogue. Eliminates duplicate Textract runs when user chats with their document.',
    iam: 'dynamodb:PutItem, dynamodb:GetItem, dynamodb:UpdateItem',
    latency: 'Single-digit millisecond latency (< 8ms)',
    cost: 'Free Tier: 25GB storage, 25 WCU, 25 RCU perpetually free',
    flows: ['analyze', 'chat']
  }
];

const FLOW_PRESETS = [
  {
    id: 'all',
    label: 'Complete Architecture',
    desc: 'End-to-end serverless pipeline across all 7 components',
  },
  {
    id: 'upload',
    label: '1. Direct S3 Upload',
    desc: 'Pre-signed URL generation and direct client-to-S3 ingestion',
  },
  {
    id: 'analyze',
    label: '2. OCR & Risk Analysis',
    desc: 'Textract extraction + Claude 3 Haiku legal reasoning pipeline',
  },
  {
    id: 'chat',
    label: '3. Contextual Q&A Chat',
    desc: 'DynamoDB context retrieval + Bedrock real-time legal conversation',
  }
];

export default function ArchitectureDiagram() {
  const [selectedFlow, setSelectedFlow] = useState('all');
  const [activeNode, setActiveNode] = useState(null);
  const [copiedSpec, setCopiedSpec] = useState(false);

  const selectedService = AWS_SERVICES.find(s => s.id === activeNode) || AWS_SERVICES[3]; // Default to Lambda

  const handleCopySpec = async () => {
    const specMarkdown = `
# ClearDoc AWS Serverless Architecture Specification
**Track**: WeMakeDevs x AWS First Commit (Ship It Track)
**Stack Type**: 100% Serverless Event-Driven Architecture

## AWS Services & Roles
1. **Frontend Client**: React 19 + Vite hosted on AWS Amplify.
2. **API Layer**: Amazon API Gateway REST API with CORS headers.
3. **Compute Orchestration**: AWS Lambda (Python 3.9, 256MB RAM, 30s timeout).
4. **Document Ingestion**: Amazon S3 (DocumentsBucket, AES-256 SSE) with pre-signed direct uploads.
5. **Document OCR**: Amazon Textract (detect_document_text) for PDF and image text extraction.
6. **Legal Intelligence**: Amazon Bedrock with Anthropic Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0).
7. **Document & Chat Cache**: Amazon DynamoDB (ClearDocTable, PAY_PER_REQUEST billing, HASH document_id).

## Key Architectural Decisions
- Direct S3 Pre-signed Upload: Prevents Lambda memory exhaustion and bypasses the 6MB Lambda payload limit.
- Single-Table Context Cache: Eliminates redundant Textract OCR calls during follow-up document chat.
- Claude 3 Haiku Selection: <2s latency and ~₹0.02 per document analysis, fully eligible for AWS Free Tier.
`.trim();

    try {
      await navigator.clipboard.writeText(specMarkdown);
      setCopiedSpec(true);
      setTimeout(() => setCopiedSpec(false), 2500);
    } catch (err) {
      console.warn('Failed to copy spec:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 print:shadow-none print:border-none print:p-2"
    >
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              AWS Serverless
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Ship It Track
            </span>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              ~₹0.02 / Analysis
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AWS Cloud Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Event-driven serverless pipeline orchestrated via AWS SAM (API Gateway + Lambda + S3 + Textract + Bedrock + DynamoDB)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 print:hidden">
          <button
            onClick={handleCopySpec}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
            title="Copy architecture specifications as Markdown"
          >
            {copiedSpec ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Spec Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Specs</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 hover:bg-indigo-600 text-white transition-colors shadow-md shadow-slate-200"
            title="Print or export as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Diagram</span>
          </button>
        </div>
      </div>

      {/* ── FLOW SELECTOR PILLS ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2 print:hidden">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
          Interactive Flows:
        </span>
        {FLOW_PRESETS.map((preset) => {
          const isActive = selectedFlow === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setSelectedFlow(preset.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* ── ARCHITECTURE VISUAL CANVAS ── */}
      <div className="mt-8 bg-slate-50/70 rounded-3xl p-5 sm:p-7 border border-slate-200/70 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 space-y-8">
          {/* TOP ROW: Ingestion Tier (Client -> API Gateway -> S3) */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center">
              <span>Tier 1 · Ingestion & Edge Routing</span>
              <span className="ml-2 h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Node: Client */}
              <ServiceCard
                service={AWS_SERVICES[0]}
                isDimmed={selectedFlow !== 'all' && !AWS_SERVICES[0].flows.includes(selectedFlow)}
                isSelected={activeNode === AWS_SERVICES[0].id}
                onClick={() => setActiveNode(AWS_SERVICES[0].id)}
              />

              {/* Node: API Gateway */}
              <ServiceCard
                service={AWS_SERVICES[1]}
                isDimmed={selectedFlow !== 'all' && !AWS_SERVICES[1].flows.includes(selectedFlow)}
                isSelected={activeNode === AWS_SERVICES[1].id}
                onClick={() => setActiveNode(AWS_SERVICES[1].id)}
              />

              {/* Node: S3 */}
              <ServiceCard
                service={AWS_SERVICES[2]}
                isDimmed={selectedFlow !== 'all' && !AWS_SERVICES[2].flows.includes(selectedFlow)}
                isSelected={activeNode === AWS_SERVICES[2].id}
                onClick={() => setActiveNode(AWS_SERVICES[2].id)}
              />
            </div>
          </div>

          {/* SVG Connector Flow Indicator (Desktop) */}
          <div className="hidden md:flex items-center justify-between px-12 text-slate-400">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-extrabold">1</span>
              <span>HTTPS Pre-signed Request</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-extrabold">2</span>
              <span>Direct Multi-part S3 Put</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-extrabold">3</span>
              <span>Trigger Analysis Pipeline</span>
            </div>
          </div>

          {/* MIDDLE ROW: Compute Orchestrator (AWS Lambda) */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center">
              <span>Tier 2 · Serverless Compute Orchestration</span>
              <span className="ml-2 h-px flex-1 bg-slate-200" />
            </div>

            <div className="max-w-xl mx-auto">
              <ServiceCard
                service={AWS_SERVICES[3]}
                isDimmed={selectedFlow !== 'all' && !AWS_SERVICES[3].flows.includes(selectedFlow)}
                isSelected={activeNode === AWS_SERVICES[3].id}
                onClick={() => setActiveNode(AWS_SERVICES[3].id)}
                isFeatured
              />
            </div>
          </div>

          {/* SVG Connector Fan-out Indicator (Desktop) */}
          <div className="hidden md:flex items-center justify-around px-8 text-slate-400">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center text-[10px] font-extrabold">4</span>
              <span>OCR Token Extraction</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-extrabold">5</span>
              <span>LLM Clause Risk Scoring</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-extrabold">6</span>
              <span>Cache Text & Chat Memory</span>
            </div>
          </div>

          {/* BOTTOM ROW: Specialized AWS Services (Textract + Bedrock Claude 3 + DynamoDB) */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center">
              <span>Tier 3 · Foundation Models, OCR & Persistence</span>
              <span className="ml-2 h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Node: Textract */}
              <ServiceCard
                service={AWS_SERVICES[4]}
                isDimmed={selectedFlow !== 'all' && !AWS_SERVICES[4].flows.includes(selectedFlow)}
                isSelected={activeNode === AWS_SERVICES[4].id}
                onClick={() => setActiveNode(AWS_SERVICES[4].id)}
              />

              {/* Node: Bedrock */}
              <ServiceCard
                service={AWS_SERVICES[5]}
                isDimmed={selectedFlow !== 'all' && !AWS_SERVICES[5].flows.includes(selectedFlow)}
                isSelected={activeNode === AWS_SERVICES[5].id}
                onClick={() => setActiveNode(AWS_SERVICES[5].id)}
              />

              {/* Node: DynamoDB */}
              <ServiceCard
                service={AWS_SERVICES[6]}
                isDimmed={selectedFlow !== 'all' && !AWS_SERVICES[6].flows.includes(selectedFlow)}
                isSelected={activeNode === AWS_SERVICES[6].id}
                onClick={() => setActiveNode(AWS_SERVICES[6].id)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE SERVICE INSPECTOR ── */}
      <div className="mt-8 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl print:bg-white print:text-slate-900 print:border print:border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <selectedService.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
                Service Deep Dive Inspector
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white print:text-slate-900">
                {selectedService.awsService}
              </h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 print:bg-slate-100 print:text-slate-800">
            Click any card above to inspect
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 text-sm">
          {/* Col 1: Role in ClearDoc */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Info className="w-3 h-3 mr-1 text-indigo-400" />
              Role in ClearDoc
            </span>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm print:text-slate-700">
              {selectedService.role}
            </p>
          </div>

          {/* Col 2: Runtime Specs */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Cpu className="w-3 h-3 mr-1 text-amber-400" />
              Technical Configuration
            </span>
            <p className="text-slate-300 font-mono text-xs leading-relaxed print:text-slate-700">
              {selectedService.specs}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Latency: <span className="text-emerald-400 font-medium">{selectedService.latency}</span>
            </p>
          </div>

          {/* Col 3: IAM Least Privilege */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Lock className="w-3 h-3 mr-1 text-rose-400" />
              IAM Policy Actions
            </span>
            <p className="text-slate-300 font-mono text-xs leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 print:bg-slate-50 print:border-slate-200 print:text-slate-800">
              {selectedService.iam}
            </p>
          </div>

          {/* Col 4: Free Tier & Costs */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
              AWS Free Tier & Economics
            </span>
            <p className="text-emerald-300 text-xs leading-relaxed print:text-emerald-700">
              {selectedService.cost}
            </p>
          </div>
        </div>
      </div>

      {/* ── KEY ARCHITECTURAL ADVANTAGES ── */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Key Architectural Advantages (Ship It Track)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <p className="font-bold text-indigo-900 mb-1">Direct S3 Pre-signed Ingestion</p>
            <p className="text-indigo-700 leading-relaxed">
              Bypasses API Gateway's 10MB payload cap and AWS Lambda's 6MB limit. Documents stream directly from client to S3 via temporary presigned tokens.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <p className="font-bold text-emerald-900 mb-1">DynamoDB Context Re-use</p>
            <p className="text-emerald-700 leading-relaxed">
              Extracted legal text and AI summaries are indexed under <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded">document_id</code>. Follow-up Q&A runs without redundant OCR calls.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <p className="font-bold text-amber-900 mb-1">Graceful Mock Degradation</p>
            <p className="text-amber-700 leading-relaxed">
              Every AWS SDK call (Textract, Bedrock, S3, DynamoDB) features automated fallback handling. Enables seamless local testing and zero-downtime demos.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ServiceCard({ service, isDimmed, isSelected, onClick, isFeatured = false }) {
  const Icon = service.icon;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 rounded-2xl p-4 border text-left relative group ${
        isSelected
          ? 'ring-2 ring-indigo-600 shadow-lg bg-white border-transparent scale-[1.02]'
          : 'bg-white hover:border-slate-300 hover:shadow-md border-slate-200'
      } ${isDimmed ? 'opacity-35 grayscale-[50%]' : 'opacity-100'} ${
        isFeatured ? 'border-orange-200 bg-gradient-to-br from-orange-50/30 to-white' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className={`p-2.5 rounded-xl border ${service.color.bg} ${service.color.border} ${service.color.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${service.color.badge}`}>
          {service.category}
        </span>
      </div>

      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">
        {service.awsService}
      </h4>
      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-mono">
        {service.specs}
      </p>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">{service.latency}</span>
        <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
          Details <ArrowRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>
    </div>
  );
}
