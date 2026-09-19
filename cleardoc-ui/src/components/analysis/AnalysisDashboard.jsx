import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Copy, Check, Download, LayoutGrid, Network } from 'lucide-react';
import SummaryCard from './SummaryCard';
import FlagCard from './FlagCard';
import RiskMeter from './RiskMeter';
import ArchitectureDiagram from './ArchitectureDiagram';
import ChatSidebar from '../chat/ChatSidebar';
import Tooltip from '../common/Tooltip';

export default function AnalysisDashboard({
  analysis,
  documentFile,
  onReset,
  chatState,
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  if (!analysis) return null;

  const redFlags = analysis.redFlags || [];
  const greenFlags = analysis.greenFlags || [];
  const criticalCount = redFlags.filter((f) => f.severity === 'critical').length;
  const warningCount = redFlags.filter((f) => f.severity !== 'critical').length;
  const greenCount = greenFlags.length;

  const handleCopyFullAnalysis = async () => {
    const fullText = [
      `CLEARDOC ANALYSIS REPORT`,
      `Document: ${analysis.documentName || documentFile?.name || 'Document'}`,
      `Risk Level: ${analysis.riskLevel || 'Moderate'} (${analysis.riskScore || 65}/100)`,
      ``,
      `SUMMARY:`,
      analysis.summary,
      ``,
      `RED FLAGS (${redFlags.length}):`,
      ...redFlags.map((f, i) => `${i + 1}. [${f.severity?.toUpperCase() || 'WARNING'}] ${f.text}${f.recommendation ? `\n   Recommendation: ${f.recommendation}` : ''}`),
      ``,
      `SAFE CLAUSES (${greenCount}):`,
      ...greenFlags.map((f, i) => `${i + 1}. ${f.text}${f.benefit ? `\n   Benefit: ${f.benefit}` : ''}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.warn('Copy report failed:', err);
    }
  };

  const handlePrint = () => { window.print(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Top Document Metadata Bar */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                {analysis.documentName || documentFile?.name || 'Document Analysis'}
              </h1>
              {analysis.is_mock && (
                <Tooltip
                  content="Demonstration mode: Analysis generated using built-in high-fidelity legal models."
                  position="bottom"
                >
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Demo Mode
                  </span>
                </Tooltip>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Analyzed via Amazon Bedrock (Claude 3 Haiku) &amp; Amazon Textract
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-full p-1 border border-slate-200 dark:border-slate-600">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'analysis'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>AWS Architecture</span>
            </button>
          </div>

          <button
            onClick={handleCopyFullAnalysis}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Copy full analysis report"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Full Report</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Print or save as PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors shadow-md shadow-slate-200 dark:shadow-indigo-900/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'architecture' ? (
        <ArchitectureDiagram />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            <RiskMeter
              riskLevel={analysis.riskLevel || 'Moderate'}
              riskScore={analysis.riskScore || 65}
              criticalCount={criticalCount}
              warningCount={warningCount}
              greenCount={greenCount}
            />
            <SummaryCard summary={analysis.summary} />
            <FlagCard type="red" flags={redFlags} />
            <FlagCard type="green" flags={greenFlags} />
          </div>

          {/* Right Column: Chat */}
          <div className="xl:col-span-1">
            <ChatSidebar
              messages={chatState.messages}
              isLoading={chatState.isChatLoading}
              onSendMessage={chatState.sendMessage}
              onClearChat={chatState.clearChat}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
