import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Flame, Footprints, Clock, MapPin, Calendar, Award } from 'lucide-react';
import api from '../services/api';
import FitnessChart from '../components/FitnessChart';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const TIME_RANGES = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "All Time", value: "all" },
];

export default function ProgressAnalytics({ refreshTrigger, onOpenActivityModal }) {
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const data = await api.getAnalytics(selectedRange);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [selectedRange, refreshTrigger]);

  if (loading) {
    return <LoadingState message="Aggregating workout statistics & analytics..." />;
  }

  const hasData = analytics?.has_data;
  const summary = analytics?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <span>Progress Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyze historical step trends, calorie output, and workout discipline across time ranges.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-dark-border/80 self-start sm:self-auto">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRange === range.value
                  ? 'bg-brand-500 text-dark-bg shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics recorded for this range"
          description="Log daily steps or workout sessions to populate time-series charts and workout distributions."
          actionLabel="Log Workout"
          onAction={onOpenActivityModal}
        />
      ) : (
        <>
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-dark-border/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total Steps
              </span>
              <p className="text-2xl font-black text-white">
                {summary.total_steps?.toLocaleString() || 0}
              </p>
              <span className="text-[11px] text-emerald-400 font-medium">
                ~{summary.avg_daily_steps?.toLocaleString() || 0} steps / active day
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-dark-border/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Estimated Calories
              </span>
              <p className="text-2xl font-black text-amber-400">
                {summary.total_calories?.toLocaleString() || 0} <span className="text-xs text-slate-400 font-normal">kcal</span>
              </p>
              <span className="text-[11px] text-slate-400 font-medium">
                Predicted by KNN Regression
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-dark-border/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Active Workout Hours
              </span>
              <p className="text-2xl font-black text-cyan-400">
                {summary.total_duration_hours || 0} <span className="text-xs text-slate-400 font-normal">hrs</span>
              </p>
              <span className="text-[11px] text-slate-400 font-medium">
                Across {analytics.total_activities} logged sessions
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-dark-border/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total Distance
              </span>
              <p className="text-2xl font-black text-purple-400">
                {summary.total_distance_km || 0} <span className="text-xs text-slate-400 font-normal">km</span>
              </p>
              <span className="text-[11px] text-slate-400 font-medium">
                Outdoor & gym movement
              </span>
            </div>
          </div>

          {/* Charts Row 1: Steps & Calories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Steps Area Chart */}
            <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
              <FitnessChart
                type="area"
                data={analytics.daily_trends}
                dataKey="steps"
                xAxisKey="date"
                height={260}
                color="#10b981"
                unit="steps"
                title="Daily Step Trajectory"
              />
            </div>

            {/* Daily Calorie Expenditure */}
            <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
              <FitnessChart
                type="area"
                data={analytics.daily_trends}
                dataKey="calories"
                xAxisKey="date"
                height={260}
                color="#f59e0b"
                unit="kcal"
                title="Estimated Calorie Output (KNN)"
              />
            </div>
          </div>

          {/* Charts Row 2: Activity Distribution & Workout Duration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Type Pie Chart */}
            <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Workout Type Distribution
              </h4>
              <FitnessChart
                type="pie"
                data={analytics.activity_distribution}
                dataKey="count"
                xAxisKey="name"
                height={240}
                unit="sessions"
              />
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
                {analytics.activity_distribution?.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                    <span>{item.name}: {item.count}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Duration by Activity Type */}
            <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
              <FitnessChart
                type="bar"
                data={analytics.activity_distribution}
                dataKey="duration_min"
                xAxisKey="name"
                height={240}
                color="#06b6d4"
                unit="min"
                title="Total Duration by Exercise Modality"
              />
            </div>
          </div>

          {/* Weight Trends (if logged) */}
          {analytics.weight_trends && analytics.weight_trends.length > 0 && (
            <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
              <FitnessChart
                type="area"
                data={analytics.weight_trends}
                dataKey="weight_kg"
                xAxisKey="date"
                height={220}
                color="#8b5cf6"
                unit="kg"
                title="Body Weight Logged Trends"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
