import React, { useState } from 'react';
import { CheckCircle2, Edit2, Trash2, AlertTriangle, Trophy, CalendarDays, Flag } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function GoalCard({ goal, onEdit, onDelete, onLogAchievement }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isCompleted = goal.is_completed;
  const hasAchievement = goal.achieved_value !== null && goal.achieved_value !== undefined;
  const horizonBadge = goal.time_horizon === "daily" ? "Daily Target" : "Weekly Target";

  // Deadline helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = goal.target_date ? new Date(goal.target_date) : null;
  const isOverdue = deadline && deadline < today && !isCompleted;
  const daysLeft = deadline
    ? Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
    : null;

  const deadlineLabel = () => {
    if (!deadline) return null;
    if (isOverdue) return `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`;
    if (daysLeft === 0) return "Due today";
    if (daysLeft === 1) return "Due tomorrow";
    return `${daysLeft} days left`;
  };

  return (
    <div className={`p-5 rounded-2xl glass-card transition-all duration-300 relative group border ${
      isCompleted
        ? 'border-emerald-500/40 bg-emerald-500/5'
        : isOverdue
          ? 'border-rose-500/30 bg-rose-500/5'
          : 'border-dark-border/80'
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
              {horizonBadge}
            </span>
            {deadline && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                isOverdue
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : daysLeft <= 2
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <CalendarDays className="w-2.5 h-2.5" />
                {deadlineLabel()}
              </span>
            )}
          </div>
          <h4 className="text-base font-bold text-white tracking-tight mt-1.5 flex items-center gap-1.5 truncate">
            {goal.title}
            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          </h4>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 shrink-0">
          <button
            onClick={() => onLogAchievement(goal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Log what you achieved"
            disabled={confirmDelete}
          >
            <Trophy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit goal"
            disabled={confirmDelete}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete goal"
            disabled={confirmDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Delete Confirmation */}
      {confirmDelete && (
        <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Delete this target?</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmDelete(false); onDelete(goal.id); }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500 hover:bg-rose-400 text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Achievement badge */}
      {hasAchievement && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-300">
              Logged: {goal.achieved_value.toLocaleString()} {goal.unit}
            </span>
            {goal.achieved_date && (
              <span className="text-[10px] text-slate-400 ml-1.5">
                on {new Date(goal.achieved_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Target & Current */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">{goal.current_value.toLocaleString()}</span>
          <span className="text-xs text-slate-400 font-medium">/ {goal.target_value.toLocaleString()} {goal.unit}</span>
        </div>
        <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-400' : isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
          {goal.percentage}%
        </span>
      </div>

      {/* Animated Progress Bar */}
      <ProgressBar
        percentage={goal.percentage}
        color={isCompleted ? "emerald" : isOverdue ? "rose" : goal.percentage > 50 ? "cyan" : "amber"}
      />

      {/* Status Text */}
      <p className="text-[11px] text-slate-400 mt-2 font-medium">
        {goal.status_text}
      </p>
    </div>
  );
}
