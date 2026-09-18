import React from 'react';
import { Sparkles } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../../constants/mockData';
import Tooltip from '../common/Tooltip';

export default function SuggestedPrompts({ onSelectPrompt, disabled = false }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span className="flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
          Suggested Questions:
        </span>
        <Tooltip
          content="Quick questions automatically formulated to probe specific contract clauses and liabilities."
          position="left"
        >
          <span className="text-[10px] text-indigo-600 cursor-help font-bold">
            1-Click Ask
          </span>
        </Tooltip>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUESTIONS.map((question, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(question)}
            disabled={disabled}
            className="text-left text-xs bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-full transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs active:scale-98 truncate max-w-full"
          >
            💡 {question}
          </button>
        ))}
      </div>
    </div>
  );
}
