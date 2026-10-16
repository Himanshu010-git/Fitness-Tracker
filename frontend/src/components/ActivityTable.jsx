import React from 'react';
import { Edit2, Trash2, Footprints, Flame, Clock, MapPin, Calendar } from 'lucide-react';

export default function ActivityTable({ activities = [], onEdit, onDelete }) {
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'High Activity':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Moderate Activity':
        return 'bg-brand-500/15 text-brand-300 border-brand-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-dark-border/80 glass-card">
      <table className="w-full text-left text-xs sm:text-sm text-slate-300">
        <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-dark-border/60">
          <tr>
            <th className="py-3.5 px-4 font-semibold">Date & Type</th>
            <th className="py-3.5 px-4 font-semibold">Metrics</th>
            <th className="py-3.5 px-4 font-semibold">Est. Calories</th>
            <th className="py-3.5 px-4 font-semibold">Activity Tier</th>
            <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border/40">
          {activities.map((item) => (
            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
              {/* Date & Type */}
              <td className="py-3.5 px-4">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{item.activity_type}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{item.activity_date}</span>
                  {item.notes && <span className="truncate max-w-[150px] italic ml-1">• {item.notes}</span>}
                </div>
              </td>

              {/* Metrics */}
              <td className="py-3.5 px-4">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-200" title="Duration">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {item.exercise_duration} min
                  </span>
                  {item.distance_km > 0 && (
                    <span className="flex items-center gap-1 text-slate-200" title="Distance">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {item.distance_km} km
                    </span>
                  )}
                  {item.steps > 0 && (
                    <span className="flex items-center gap-1 text-slate-200" title="Steps">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                      {item.steps.toLocaleString()}
                    </span>
                  )}
                </div>
              </td>

              {/* Estimated Calories */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{item.estimated_calories}</span>
                  <span className="text-[10px] text-slate-400 font-normal">kcal</span>
                </div>
              </td>

              {/* Tier Badge */}
              <td className="py-3.5 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getTierBadge(
                    item.activity_level
                  )}`}
                >
                  {item.activity_level || 'Moderate'}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                    title="Edit record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
