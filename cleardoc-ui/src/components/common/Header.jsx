import React from 'react';
import { FileText, ShieldCheck, HelpCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import Tooltip from './Tooltip';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ onOpenGuide, onReset, hasAnalysis = false }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-700/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Clear<span className="text-indigo-600">Doc</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              AI Legal Guardian
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {hasAnalysis && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Analyze another document"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Analyze Another</span>
            </button>
          )}

          {/* Guide walkthrough trigger */}
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Privacy badge */}
          <Tooltip
            content="Your files are uploaded directly to an isolated, private AWS S3 bucket encrypted with AES-256. Zero data is retained for public AI model training."
            position="bottom"
          >
            <span className="flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-100 dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" />
              <span>Privacy First</span>
            </span>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
