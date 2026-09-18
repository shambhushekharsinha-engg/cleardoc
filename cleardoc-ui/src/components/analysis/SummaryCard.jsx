import React, { useState } from 'react';
import { Info, Copy, Check } from 'lucide-react';
import Tooltip from '../common/Tooltip';

export default function SummaryCard({ summary = '', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div
      className={`bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-8 border border-slate-100 transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-2.5 rounded-2xl text-indigo-600 shadow-xs">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Plain English Summary
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Copy summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          <Tooltip
            content="AI translates dense multi-page legalese into concise, human-readable bullet points."
            position="left"
          >
            <span className="text-slate-400 hover:text-slate-600 p-1 cursor-help">
              <Info className="w-4 h-4" />
            </span>
          </Tooltip>
        </div>
      </div>

      <p className="text-slate-700 leading-relaxed text-base sm:text-lg font-medium">
        {summary || 'No summary text available.'}
      </p>
    </div>
  );
}
