import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Cpu, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';

export default function OnboardingGuide({ isOpen, onClose }) {
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const steps = [
    {
      step: '01',
      title: 'Upload Document',
      description: 'Drag and drop your rental contract, NDA, or loan agreement (PDF, PNG, JPG under 10MB).',
      icon: UploadCloud,
      badge: 'Client Validation',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      step: '02',
      title: 'Amazon Textract OCR',
      description: 'AWS Textract scans and parses multi-column legalese into structured, high-fidelity text.',
      icon: Cpu,
      badge: 'AWS Serverless',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      step: '03',
      title: 'Claude 3 Clause Analysis',
      description: 'Anthropic Claude 3 on Amazon Bedrock identifies one-sided terms, critical liabilities, and standard protections.',
      icon: Sparkles,
      badge: 'Bedrock AI',
      color: 'from-purple-600 to-pink-600',
    },
    {
      step: '04',
      title: 'Interactive Q&A & Negotiation',
      description: 'Ask specific questions, probe hidden fees or eviction rules, and receive actionable negotiation counter-proposals.',
      icon: MessageSquare,
      badge: 'Real-Time Chat',
      color: 'from-pink-600 to-rose-600',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Beginner's Walkthrough</span>
                </div>
                <h2 id="onboarding-modal-title" className="text-2xl font-black tracking-tight text-slate-900">
                  How ClearDoc Works
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  From dense legalese to plain English clarity in 4 simple steps.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Timeline */}
            <div className="mt-6 space-y-4">
              {steps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${item.color} shadow-md mr-4 flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-slate-900">
                          <span className="text-indigo-600 font-extrabold mr-2">{item.step}.</span>
                          {item.title}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Encrypted in-transit & at rest with AES-256
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-sm font-semibold transition-colors shadow-md shadow-slate-200"
              >
                Got It, Let's Go
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
