import React, { useState, useEffect } from 'react';
import { Target, Plus, Trophy, CalendarDays, Flag } from 'lucide-react';
import api from '../services/api';
import GoalCard from '../components/GoalCard';
import Modal from '../components/Modal';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const GOAL_TYPES = [
  { value: "daily_steps",          label: "Daily Steps",            defaultUnit: "steps" },
  { value: "daily_active_minutes", label: "Daily Active Minutes",   defaultUnit: "mins" },
  { value: "weekly_distance",      label: "Weekly Distance",        defaultUnit: "km" },
  { value: "weekly_steps",         label: "Weekly Steps",           defaultUnit: "steps" },
  { value: "daily_water",          label: "Daily Water Intake",     defaultUnit: "L" },
  { value: "daily_sleep",          label: "Nightly Sleep",          defaultUnit: "hours" },
];

const DEFAULT_FORM = {
  title: "Daily Steps Target",
  goal_type: "daily_steps",
  target_value: 10000,
  unit: "steps",
  time_horizon: "daily",
  target_date: "",
};

const DEFAULT_ACHIEVEMENT = {
  achieved_value: "",
  achieved_date: new Date().toISOString().slice(0, 10),
};

export default function FitnessGoals({ refreshTrigger, onGoalMutated }) {
  const [loading, setLoading]           = useState(true);
  const [goals, setGoals]               = useState([]);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Goal Modal (create / edit) ──────────────────────────────────────
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal]     = useState(null);
  const [formData, setFormData]           = useState(DEFAULT_FORM);

  // ── Achievement Modal ──────────────────────────────────────────────
  const [achvModalOpen, setAchvModalOpen]   = useState(false);
  const [achievingGoal, setAchievingGoal]   = useState(null);
  const [achvForm, setAchvForm]             = useState(DEFAULT_ACHIEVEMENT);

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, [refreshTrigger]);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Goal Modal helpers ─────────────────────────────────────────────
  const openCreate = () => {
    setEditingGoal(null);
    setFormData(DEFAULT_FORM);
    setGoalModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title:        goal.title,
      goal_type:    goal.goal_type,
      target_value: goal.target_value,
      unit:         goal.unit,
      time_horizon: goal.time_horizon,
      target_date:  goal.target_date ? goal.target_date.slice(0, 10) : "",
    });
    setGoalModalOpen(true);
  };

  const handleTypeChange = (e) => {
    const gType   = e.target.value;
    const matched = GOAL_TYPES.find((t) => t.value === gType);
    setFormData((prev) => ({
      ...prev,
      goal_type: gType,
      unit:  matched?.defaultUnit || "units",
      title: matched?.label ? `${matched.label} Target` : prev.title,
    }));
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        target_value: parseFloat(formData.target_value) || 0,
        target_date:  formData.target_date || null,
      };
      if (editingGoal) {
        await api.updateGoal(editingGoal.id, payload);
        notify('success', '✅ Fitness target updated!');
      } else {
        await api.createGoal(payload);
        notify('success', '🎯 New fitness target set!');
      }
      setGoalModalOpen(false);
      fetchGoals();
      if (onGoalMutated) onGoalMutated();
    } catch (err) {
      notify('error', err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Achievement Modal helpers ──────────────────────────────────────
  const openAchievement = (goal) => {
    setAchievingGoal(goal);
    setAchvForm({
      achieved_value: goal.achieved_value ?? "",
      achieved_date:  goal.achieved_date
        ? goal.achieved_date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    });
    setAchvModalOpen(true);
  };

  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    if (!achievingGoal) return;
    setIsSubmitting(true);
    try {
      await api.logAchievement(achievingGoal.id, {
        achieved_value: parseFloat(achvForm.achieved_value),
        achieved_date:  achvForm.achieved_date || null,
      });
      notify('success', `🏆 Achievement logged for "${achievingGoal.title}"!`);
      setAchvModalOpen(false);
      fetchGoals();
      if (onGoalMutated) onGoalMutated();
    } catch (err) {
      notify('error', err.message || 'Failed to log achievement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.deleteGoal(id);
      // Immediately remove from local state for instant feedback
      setGoals((prev) => prev.filter((g) => g.id !== id));
      notify('success', 'Target removed.');
      if (onGoalMutated) onGoalMutated();
    } catch (err) {
      notify('error', err.message || 'Failed to remove target');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-brand-400" />
            <span>Fitness Targets &amp; Milestones</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Set deadlines, track daily goals, and log what you actually achieved.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Log Achievement quick-button (only if goals exist) */}
          {goals.length > 0 && (
            <button
              onClick={() => openAchievement(goals[0])}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-semibold text-xs shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              title="Log an achievement on any target"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Log Achievement</span>
            </button>
          )}

          {/* Set New Target */}
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Set New Target</span>
          </button>
        </div>
      </div>

      {/* ── Notification ── */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      {/* ── Goals Grid ── */}
      {loading ? (
        <LoadingState message="Calculating goal progress from activities..." />
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={handleDelete}
              onLogAchievement={openAchievement}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No targets established"
          description="Create customised daily steps, active workout duration, or weekly distance goals with optional deadlines."
          actionLabel="Set First Target"
          onAction={openCreate}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 1 — Set / Edit Fitness Target
      ══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? "Edit Fitness Target" : "Set New Fitness Target"}
        subtitle="Define your goal, optional deadline, and measurement unit"
      >
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          {/* Target Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Name</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              placeholder="e.g. Morning Run Goal"
              required
            />
          </div>

          {/* Category + Horizon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Goal Category</label>
              <select
                value={formData.goal_type}
                onChange={handleTypeChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                {GOAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Horizon</label>
              <select
                value={formData.time_horizon}
                onChange={(e) => setFormData({ ...formData, time_horizon: e.target.value })}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="daily">Daily Goal</option>
                <option value="weekly">Weekly Goal</option>
              </select>
            </div>
          </div>

          {/* Target Value + Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Value</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Target Date (optional deadline) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-brand-400" />
              Deadline Date <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Leave blank for an open-ended target.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/60">
            <button
              type="button"
              onClick={() => setGoalModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingGoal ? "Update Target" : "Set Target"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ══════════════════════════════════════════════════════
          MODAL 2 — Log Achievement
      ══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={achvModalOpen}
        onClose={() => setAchvModalOpen(false)}
        title="Log Your Achievement"
        subtitle={achievingGoal ? `Recording result for: ${achievingGoal.title}` : ""}
      >
        {achievingGoal && (
          <form onSubmit={handleAchievementSubmit} className="space-y-4">
            {/* Goal summary */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-dark-border/60 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Target</p>
                <p className="text-sm font-bold text-white">
                  {achievingGoal.target_value.toLocaleString()} {achievingGoal.unit}
                </p>
              </div>
              <Flag className="w-5 h-5 text-brand-400" />
            </div>

            {/* Goal selector (when opened from header button) */}
            {goals.length > 1 && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Target</label>
                <select
                  value={achievingGoal.id}
                  onChange={(e) => {
                    const g = goals.find((x) => x.id === parseInt(e.target.value, 10));
                    if (g) {
                      setAchievingGoal(g);
                      setAchvForm({
                        achieved_value: g.achieved_value ?? "",
                        achieved_date:  g.achieved_date
                          ? g.achieved_date.slice(0, 10)
                          : new Date().toISOString().slice(0, 10),
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} — target: {g.target_value} {g.unit}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Achieved value */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                What did you actually achieve? <span className="text-slate-500">({achievingGoal.unit})</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                value={achvForm.achieved_value}
                onChange={(e) => setAchvForm({ ...achvForm, achieved_value: e.target.value })}
                placeholder={`e.g. ${achievingGoal.target_value}`}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
              {/* Quick percentage hint */}
              {achvForm.achieved_value && (
                <p className="text-[11px] text-slate-400 mt-1">
                  That's{" "}
                  <span className="text-brand-400 font-semibold">
                    {Math.round((parseFloat(achvForm.achieved_value) / achievingGoal.target_value) * 100)}%
                  </span>{" "}
                  of your target
                </p>
              )}
            </div>

            {/* Achievement date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                Achievement Date
              </label>
              <input
                type="date"
                value={achvForm.achieved_date}
                onChange={(e) => setAchvForm({ ...achvForm, achieved_date: e.target.value })}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/60">
              <button
                type="button"
                onClick={() => setAchvModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-bg font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Achievement"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
