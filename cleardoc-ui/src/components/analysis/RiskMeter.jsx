import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import Tooltip from '../common/Tooltip';

export default function RiskMeter({
  riskLevel = 'Moderate',
  riskScore = 65,
  criticalCount = 0,
  warningCount = 0,
  greenCount = 0,
}) {
  const getRiskConfig = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return {
          label: 'Low Risk',
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          barColor: 'bg-emerald-500',
          icon: ShieldCheck,
          description: 'Standard contractual terms with minimal legal or financial traps.',
        };
      case 'high':
        return {
          label: 'High Risk',
          color: 'text-rose-700',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          barColor: 'bg-rose-600',
          icon: ShieldAlert,
          description: 'Contains severe liabilities, asymmetrical termination, or heavy indemnities.',
        };
      case 'moderate':
      default:
        return {
          label: 'Moderate Risk',
          color: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          barColor: 'bg-amber-500',
          icon: AlertTriangle,
          description: 'Mostly standard with a few clauses requiring careful review or negotiation.',
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-3xl p-6 border ${config.borderColor} ${config.bgColor} shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-white/80 shadow-xs">
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Document Risk Meter
          </span>
        </div>

        <Tooltip
          content="Risk score is calculated based on red flag clause severity, indemnity burdens, and unilateral rights."
          position="left"
        >
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Risk Meter details"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <h3 className={`text-2xl font-black ${config.color}`}>{config.label}</h3>
        <span className="text-sm font-extrabold text-slate-700">{riskScore}/100</span>
      </div>

      {/* Progress Gauge Bar */}
      <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden border border-slate-200/50 p-0.5 mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${config.barColor}`}
          style={{ width: `${Math.min(100, Math.max(10, riskScore))}%` }}
        />
      </div>

      <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
        {config.description}
      </p>

      {/* Clause Statistics Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <div className="bg-white/90 rounded-xl p-2 border border-slate-200/50">
          <div className="text-rose-600 font-black text-sm">{criticalCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Critical</div>
        </div>
        <div className="bg-white/90 rounded-xl p-2 border border-slate-200/50">
          <div className="text-amber-600 font-black text-sm">{warningCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Cautions</div>
        </div>
        <div className="bg-white/90 rounded-xl p-2 border border-slate-200/50">
          <div className="text-emerald-600 font-black text-sm">{greenCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Safe</div>
        </div>
      </div>
    </div>
  );
}
