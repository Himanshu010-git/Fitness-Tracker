import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

export default function InsightCard({
  title,
  subtitle,
  children,
  badgeText = "AI Model",
  accentColor = "emerald",
  disclaimer = "Model approximation based on historical workouts. Not a medical evaluation."
}) {
  const accentStyles = {
    emerald: "from-brand-500/10 to-transparent border-brand-500/30 text-emerald-400",
    purple: "from-purple-500/10 to-transparent border-purple-500/30 text-purple-400",
    blue: "from-blue-500/10 to-transparent border-blue-500/30 text-blue-400",
    amber: "from-amber-500/10 to-transparent border-amber-500/30 text-amber-400",
  };

  const style = accentStyles[accentColor] || accentStyles.emerald;

  return (
    <div className={`p-6 rounded-2xl glass-card bg-gradient-to-b ${style} border flex flex-col justify-between relative overflow-hidden group`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
          </div>
          {badgeText && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}

        {/* Dynamic Content */}
        <div className="space-y-3">{children}</div>
      </div>

      {/* Safety Disclaimer Footer */}
      {disclaimer && (
        <div className="mt-4 pt-3 border-t border-dark-border/40 flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{disclaimer}</span>
        </div>
      )}
    </div>
  );
}
