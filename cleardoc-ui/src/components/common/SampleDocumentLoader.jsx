import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import Tooltip from './Tooltip';

export default function SampleDocumentLoader({ onLoadSample, disabled = false }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">— or try with a sample —</p>
      <Tooltip
        content="Instantly test ClearDoc with a realistic Bangalore residential lease containing real legal traps — no AWS account or file upload needed."
        position="bottom"
      >
        <button
          type="button"
          onClick={onLoadSample}
          disabled={disabled}
          aria-label="Try with a Sample Lease Agreement (No account needed)"
          className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Try with a Sample Lease Agreement</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white font-semibold">
            (No account needed)
          </span>
        </button>
      </Tooltip>
      <span className="text-xs text-slate-400 flex items-center">
        <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
        Sample Bangalore Residential Lease (2026).pdf
      </span>
    </div>
  );
}
