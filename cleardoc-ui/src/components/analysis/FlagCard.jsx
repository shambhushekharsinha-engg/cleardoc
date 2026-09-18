import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Scale, ShieldCheck } from 'lucide-react';
import Tooltip from '../common/Tooltip';

export default function FlagCard({
  type = 'red', // 'red' | 'green'
  flags = [],
  className = '',
}) {
  const isRed = type === 'red';

  if (!flags || flags.length === 0) {
    return (
      <div className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-lg ${className}`}>
        <p className="text-sm text-slate-400 italic">No clauses identified in this category.</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white shadow-xl rounded-3xl p-6 sm:p-8 border transition-all ${
        isRed
          ? 'shadow-rose-100/40 border-rose-100/80'
          : 'shadow-emerald-100/40 border-emerald-100/80'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-xl sm:text-2xl font-black flex items-center ${
            isRed ? 'text-rose-600' : 'text-emerald-700'
          }`}
        >
          <div
            className={`p-2.5 rounded-2xl mr-3 shadow-sm ${
              isRed ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
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
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
                    ? 'bg-rose-50/70 border-rose-200/80'
                    : 'bg-amber-50/60 border-amber-200/80'
                  : 'bg-emerald-50/60 border-emerald-200/80'
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
                    <span className="text-xs font-semibold text-slate-500">
                      {flag.category}
                    </span>
                  )}
                </div>

                {typeof flag === 'object' && flag?.title && (
                  <span className="text-xs font-bold text-slate-800">
                    {flag.title}
                  </span>
                )}
              </div>

              {/* Clause Text */}
              <p
                className={`text-sm font-medium leading-relaxed mb-3 ${
                  isRed ? 'text-slate-900' : 'text-slate-800'
                }`}
              >
                {typeof flag === 'string' ? flag : flag.text}
              </p>

              {/* Actionable Guidance (Negotiation tip or Benefit) */}
              {isRed && typeof flag === 'object' && flag?.recommendation && (
                <div className="mt-2 pt-2.5 border-t border-rose-200/60 flex items-start text-xs text-rose-950 font-medium">
                  <Scale className="w-4 h-4 text-rose-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-rose-900">What to negotiate: </strong>
                    <span>{flag.recommendation}</span>
                  </div>
                </div>
              )}

              {!isRed && typeof flag === 'object' && flag?.benefit && (
                <div className="mt-2 pt-2.5 border-t border-emerald-200/60 flex items-start text-xs text-emerald-950 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-emerald-900">Why it protects you: </strong>
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
