import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Cpu, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProcessingStatus({ currentStep = 1, loadingPhase = '' }) {
  const steps = [
    {
      id: 1,
      title: 'Uploading to AWS S3',
      subtitle: 'Presigned encrypted transfer',
      icon: UploadCloud,
    },
    {
      id: 2,
      title: 'Extracting with Amazon Textract',
      subtitle: 'High-accuracy OCR document parser',
      icon: Cpu,
    },
    {
      id: 3,
      title: 'Analyzing with Claude 3',
      subtitle: 'Pinpointing risks & obligations',
      icon: Sparkles,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto mt-16 px-4"
    >
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/60 border border-slate-100 text-center relative overflow-hidden">
        {/* Pulsing subtle glow backdrop */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 animate-pulse" />

        {/* Central Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Analyzing Your Document
        </h2>
        <motion.p
          key={loadingPhase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm sm:text-base font-semibold text-indigo-600 mb-8"
        >
          {loadingPhase || 'Processing legal clauses in AWS cloud...'}
        </motion.p>

        {/* 3-Step Pipeline Visualizer */}
        <div className="space-y-3 text-left">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center p-3.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950'
                    : isCurrent
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 ring-2 ring-indigo-500/10 shadow-sm'
                    : 'bg-slate-50/60 border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3.5 flex-shrink-0 font-bold text-sm ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold truncate">{step.title}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider ml-2">
                      {isCompleted ? 'Complete' : isCurrent ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs opacity-75 truncate">{step.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Average analysis time: 3–5 seconds using Claude 3 Haiku serverless architecture.
        </p>
      </div>
    </motion.div>
  );
}
