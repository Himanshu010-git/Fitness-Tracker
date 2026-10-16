import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-dark-border text-xs shadow-xl backdrop-blur-md">
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold text-white">
              {entry.value?.toLocaleString()} {unit}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FitnessChart({
  type = "area",
  data = [],
  dataKey = "steps",
  xAxisKey = "date",
  height = 260,
  color = "#10b981",
  secondaryColor = "#06b6d4",
  unit = "",
  title
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500" style={{ height }}>
        <p className="text-xs">No chart data available for this range</p>
      </div>
    );
  }

  const PIE_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"];

  return (
    <div className="w-full">
      {title && <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h4>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#233044" vertical={false} opacity={0.5} />
              <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#grad-${dataKey})`}
              />
            </AreaChart>
          ) : type === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233044" vertical={false} opacity={0.5} />
              <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#111827" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
