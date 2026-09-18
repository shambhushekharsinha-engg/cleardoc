import React from 'react';
import { FileText, ShieldCheck, HelpCircle, ArrowLeft } from 'lucide-react';
import Tooltip from './Tooltip';

export default function Header({ onOpenGuide, onReset, hasAnalysis = false }) {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Clear<span className="text-indigo-600">Doc</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
              AI Legal Guardian
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {hasAnalysis && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Analyze another document"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Analyze Another</span>
            </button>
          )}

          {/* Guide walkthrough trigger */}
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors border border-slate-200"
          >
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          {/* Privacy badge with accessible tooltip */}
          <Tooltip
            content="Your files are uploaded directly to an isolated, private AWS S3 bucket encrypted with AES-256. Zero data is retained for public AI model training."
            position="bottom"
          >
            <span className="flex items-center px-3 py-1.5 bg-emerald-50 rounded-full text-emerald-800 text-xs font-semibold border border-emerald-100/80">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
              <span>Privacy First</span>
            </span>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
