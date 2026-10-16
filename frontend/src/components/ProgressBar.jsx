import React from 'react';

export default function ProgressBar({
  value,
  max = 100,
  percentage,
  label,
  subLabel,
  color = "emerald",
  height = "h-2.5"
}) {
  const calculatedPct = percentage !== undefined 
    ? Math.min(100, Math.max(0, percentage))
    : Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const gradients = {
    emerald: "from-brand-500 to-emerald-400",
    cyan: "from-cyan-500 to-teal-400",
    amber: "from-amber-500 to-yellow-400",
    purple: "from-purple-500 to-indigo-400",
    rose: "from-rose-500 to-pink-400",
    blue: "from-blue-500 to-sky-400"
  };

  const selectedGradient = gradients[color] || gradients.emerald;

  return (
    <div className="w-full">
      {(label || subLabel) && (
        <div className="flex items-center justify-between text-xs font-medium mb-1.5">
          {label && <span className="text-slate-300 font-semibold">{label}</span>}
          {subLabel && <span className="text-slate-400">{subLabel}</span>}
        </div>
      )}

      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${height} p-0.5 border border-dark-border/60`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${selectedGradient} transition-all duration-700 ease-out shadow-sm`}
          style={{ width: `${calculatedPct}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
        <span>{calculatedPct}% complete</span>
        {value !== undefined && max !== undefined && (
          <span>{value} / {max}</span>
        )}
      </div>
    </div>
  );
}
