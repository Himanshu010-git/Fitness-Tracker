import React, { useState, useEffect } from 'react';
import { 
  Footprints, 
  Flame, 
  Clock, 
  MapPin, 
  Droplets, 
  Moon, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Target,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import FitnessChart from '../components/FitnessChart';
import ProgressBar from '../components/ProgressBar';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function Dashboard({ onOpenActivityModal, refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [actsRes, goalsRes, insightsRes, analyticsRes] = await Promise.all([
          api.getActivities({ limit: 5 }),
          api.getGoals(),
          api.getInsights(),
          api.getAnalytics('7d')
        ]);
        setActivities(actsRes || []);
        setGoals(goalsRes || []);
        setInsights(insightsRes || null);
        setAnalytics(analyticsRes || null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [refreshTrigger]);

  if (loading) {
    return <LoadingState message="Loading your fitness overview..." />;
  }

  // Today's aggregate calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayActs = activities.filter((a) => a.activity_date === todayStr);

  const todaySteps = todayActs.reduce((sum, a) => sum + (a.steps || 0), 0);
  const todayCalories = todayActs.reduce((sum, a) => sum + (a.estimated_calories || 0), 0);
  const todayDuration = todayActs.reduce((sum, a) => sum + (a.exercise_duration || 0), 0);
  const todayDistance = todayActs.reduce((sum, a) => sum + (a.distance_km || 0.0), 0.0);
  const todayWater = todayActs.reduce((max, a) => Math.max(max, a.water_intake || 0.0), 0.0);
  const todaySleep = todayActs.reduce((max, a) => Math.max(max, a.sleep_duration || 0.0), 0.0);

  const hasAnyActivity = activities.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden glass-card border border-brand-500/20 bg-gradient-to-r from-brand-950/40 via-dark-surface to-dark-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Health Tracking</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to crush your goals today?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              FitTrack AI continuously optimizes your workout insights, calorie expenditure, and activity readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenActivityModal}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-bold text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Workout</span>
            </button>
            <Link
              to="/insights"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-dark-border transition-colors flex items-center gap-1.5"
            >
              <span>AI Insights</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Today's Steps"
          value={todaySteps}
          unit="steps"
          icon={Footprints}
          color="emerald"
          subtitle={todaySteps > 0 ? "Logged today" : "Awaiting logs"}
        />
        <StatCard
          title="Calories Burned"
          value={Math.round(todayCalories)}
          unit="kcal"
          icon={Flame}
          color="amber"
          subtitle="Estimated via KNN"
        />
        <StatCard
          title="Active Minutes"
          value={todayDuration}
          unit="mins"
          icon={Clock}
          color="cyan"
          subtitle={todayDuration >= 30 ? "Target satisfied" : "Build momentum"}
        />
        <StatCard
          title="Distance Covered"
          value={todayDistance.toFixed(1)}
          unit="km"
          icon={MapPin}
          color="blue"
          subtitle="Cumulative distance"
        />
        <StatCard
          title="Water Intake"
          value={todayWater.toFixed(1)}
          unit="L"
          icon={Droplets}
          color="purple"
          subtitle="Hydration level"
        />
        <StatCard
          title="Sleep Rest"
          value={todaySleep.toFixed(1)}
          unit="hrs"
          icon={Moon}
          color="rose"
          subtitle="Recovery sleep"
        />
      </div>

      {/* Main Grid: Weekly Chart & AI Readiness Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Trends Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-dark-border/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <span>Weekly Movement Trends</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily step accumulation over past 7 days</p>
            </div>
            <Link to="/analytics" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {analytics?.daily_trends && analytics.daily_trends.length > 0 ? (
            <FitnessChart
              type="area"
              data={analytics.daily_trends}
              dataKey="steps"
              xAxisKey="date"
              height={260}
              color="#10b981"
              unit="steps"
            />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No recent trend data"
              description="Log daily steps or workout sessions to generate your interactive weekly progress charts."
              actionLabel="Log First Activity"
              onAction={onOpenActivityModal}
            />
          )}
        </div>

        {/* AI Daily Readiness & Habit Snapshot */}
        <div className="p-6 rounded-2xl glass-card border border-dark-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                AI Coach Insight
              </span>
              <span className="text-xs font-semibold text-slate-400">ID3 Decision Model</span>
            </div>

            <h4 className="text-base font-bold text-white tracking-tight">
              {insights?.readiness_recommendation?.title || "Daily Readiness Check"}
            </h4>

            <div className="mt-3 p-3.5 rounded-xl bg-slate-900/60 border border-dark-border/60">
              <span className="text-xs font-bold text-emerald-400 block mb-1">
                {insights?.readiness_recommendation?.focus || "Optimal Readiness"}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights?.readiness_recommendation?.guidance || 
                 "Your recent metrics indicate well-paced movement and recovery. Maintain your structured exercise routine today."}
              </p>
            </div>

            {/* Habit alignment from Find-S */}
            <div className="mt-4 pt-3 border-t border-dark-border/40">
              <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Habit Consistency (Find-S)</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {insights?.habit_alignment?.message || "Consistency is building nicely across hydration, sleep, and workouts."}
              </p>
            </div>
          </div>

          <Link
            to="/insights"
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-center text-xs font-semibold text-slate-200 border border-dark-border transition-colors block"
          >
            Explore AI Insights & ML Models
          </Link>
        </div>
      </div>

      {/* Secondary Grid: Goal Progress & Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitness Goals Progress Summary */}
        <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Fitness Goal Progress</span>
            </h3>
            <Link to="/goals" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              <span>Manage Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id} className="p-3.5 rounded-xl bg-slate-900/40 border border-dark-border/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{g.title}</span>
                    <span className="text-xs font-semibold text-brand-400">
                      {g.current_value} / {g.target_value} {g.unit}
                    </span>
                  </div>
                  <ProgressBar
                    percentage={g.percentage}
                    color={g.is_completed ? "emerald" : g.percentage > 50 ? "cyan" : "amber"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Target}
              title="No active fitness goals"
              description="Establish daily step counts, water targets, or weekly workout goals to track live completion."
              actionLabel="Create Goal"
              onAction={() => window.location.href = '/goals'}
            />
          )}
        </div>

        {/* Recent Activities Feed */}
        <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Activity History</span>
            </h3>
            <Link to="/activities" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl bg-slate-900/40 border border-dark-border/60 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{act.activity_type}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {act.activity_date}
                      </span>
                    </h5>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{act.exercise_duration} min</span>
                      {act.distance_km > 0 && <span>• {act.distance_km} km</span>}
                      {act.steps > 0 && <span>• {act.steps.toLocaleString()} steps</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1 justify-end">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {act.estimated_calories} kcal
                    </span>
                    <span className="text-[10px] text-brand-400 font-medium">
                      {act.activity_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No workout records yet"
              description="Start recording your workouts to populate your activity history and analytics."
              actionLabel="Log Workout"
              onAction={onOpenActivityModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}
