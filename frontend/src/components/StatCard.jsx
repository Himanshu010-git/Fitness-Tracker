import React from 'react';

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = "brand",
  subtitle
}) {
  const colorMap = {
    brand: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "hover:border-emerald-500/40"
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "hover:border-cyan-500/40"
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      glow: "hover:border-amber-500/40"
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
      glow: "hover:border-purple-500/40"
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      glow: "hover:border-blue-500/40"
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
      glow: "hover:border-rose-500/40"
    }
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className={`p-5 rounded-2xl glass-card transition-all duration-300 ${scheme.glow} flex flex-col justify-between group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center border ${scheme.border} transition-transform group-hover:scale-110`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {subtitle && (
        <div className="text-[11px] text-slate-400 font-medium truncate pt-1 border-t border-dark-border/40 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}
