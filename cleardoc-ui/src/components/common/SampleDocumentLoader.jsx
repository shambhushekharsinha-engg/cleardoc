import React, { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import Tooltip from './Tooltip';

export default function SampleDocumentLoader({ onLoadSample, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const samples = [
    { id: 'sample-bangalore-lease-2026', name: 'Bangalore Residential Lease', icon: '🏠' },
    { id: 'sample-employment-contract', name: 'Tech Startup Employment', icon: '💼' },
    { id: 'sample-freelance-nda', name: 'Freelance NDA', icon: '🔒' },
    { id: 'sample-vendor-agreement', name: 'Enterprise SaaS Vendor', icon: '☁️' },
    { id: 'sample-gym-membership', name: 'Annual Gym Membership', icon: '🏋️' },
  ];

  const handleSelect = (id) => {
    setIsOpen(false);
    onLoadSample(id);
  };

  return (
    <div className="flex flex-col items-center gap-3 relative">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">— or try with a sample —</p>
      
      <div className="relative">
        <Tooltip
          content="Instantly test ClearDoc with realistic legal documents containing real legal traps — no AWS account or file upload needed."
          position="bottom"
        >
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="inline-flex items-center justify-between min-w-[300px] px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          >
            <span className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Select a Sample Document</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </Tooltip>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
            {samples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelect(sample.id)}
                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-3 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
              >
                <span className="text-lg">{sample.icon}</span>
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
