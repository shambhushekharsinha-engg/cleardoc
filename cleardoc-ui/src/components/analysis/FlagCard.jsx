import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Scale, ShieldCheck } from 'lucide-react';
import Tooltip from '../common/Tooltip';

export default function FlagCard({
  type = 'red',
  flags = [],
  className = '',
}) {
  const isRed = type === 'red';

  if (!flags || flags.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-lg ${className}`}>
        <p className="text-sm text-slate-400 italic">No clauses identified in this category.</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800/60 shadow-xl rounded-3xl p-6 sm:p-8 border transition-all ${
        isRed
          ? 'shadow-rose-100/40 dark:shadow-rose-900/20 border-rose-100/80 dark:border-rose-900/40'
          : 'shadow-emerald-100/40 dark:shadow-emerald-900/20 border-emerald-100/80 dark:border-emerald-900/40'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-xl sm:text-2xl font-black flex items-center ${
            isRed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          <div
            className={`p-2.5 rounded-2xl mr-3 shadow-sm ${
              isRed
                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isRed ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <span>{isRed ? 'Red Flags & Critical Concerns' : 'Standard & Safe Clauses'}</span>
        </h2>

        <Tooltip
          content={
            isRed
              ? 'Clauses carrying legal exposure, asymmetrical termination rights, or unexpected financial liabilities.'
              : 'Clauses adhering to customary legal protections and fair bilateral terms.'
          }
          position="left"
        >
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border cursor-help ${
              isRed
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {flags.length} {flags.length === 1 ? 'Clause' : 'Clauses'}
          </span>
        </Tooltip>
      </div>

      {/* Flag List */}
      <div className="space-y-4">
        {flags.map((flag, idx) => {
          const isCritical = typeof flag === 'object' && flag?.severity === 'critical';
          const flagId = (typeof flag === 'object' && flag?.id) || `flag-${idx}`;

          return (
            <motion.div
              key={flagId}
              initial={{ opacity: 0, x: isRed ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.25 }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isRed
                  ? isCritical
                    ? 'bg-rose-50/70 dark:bg-rose-900/20 border-rose-200/80 dark:border-rose-800/40'
                    : 'bg-amber-50/60 dark:bg-amber-900/20 border-amber-200/80 dark:border-amber-800/40'
                  : 'bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200/80 dark:border-emerald-800/40'
              }`}
            >
              {/* Card Meta & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                      isRed
                        ? isCritical
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isRed ? (isCritical ? 'Critical Trap' : 'Warning') : 'Protected'}
                  </span>
                  {typeof flag === 'object' && flag?.category && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{flag.category}</span>
                  )}
                </div>
                {typeof flag === 'object' && flag?.title && (
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{flag.title}</span>
                )}
              </div>

              {/* Clause Text */}
              <p className={`text-sm font-medium leading-relaxed mb-3 ${isRed ? 'text-slate-900 dark:text-slate-100' : 'text-slate-800 dark:text-slate-200'}`}>
                {typeof flag === 'string' ? flag : flag.text}
              </p>

              {/* Negotiation tip */}
              {isRed && typeof flag === 'object' && flag?.recommendation && (
                <div className="mt-2 pt-2.5 border-t border-rose-200/60 dark:border-rose-800/40 flex items-start text-xs text-rose-950 dark:text-rose-300 font-medium">
                  <Scale className="w-4 h-4 text-rose-600 dark:text-rose-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-rose-900 dark:text-rose-300">What to negotiate: </strong>
                    <span>{flag.recommendation}</span>
                  </div>
                </div>
              )}

              {/* Benefit */}
              {!isRed && typeof flag === 'object' && flag?.benefit && (
                <div className="mt-2 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-start text-xs text-emerald-950 dark:text-emerald-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-emerald-900 dark:text-emerald-300">Why it protects you: </strong>
                    <span>{flag.benefit}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
