import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  Target, 
  CheckCircle2, 
  Play, 
  Cpu
} from 'lucide-react';
import api from '../services/api';
import InsightCard from '../components/InsightCard';
import LoadingState from '../components/LoadingState';

export default function AIFitnessInsights({ refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);

  // Sandbox states
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "sandbox"

  // Calorie KNN Sandbox State
  const [calInput, setCalInput] = useState({
    duration_min: 45,
    distance_km: 5.0,
    steps: 6500,
    activity_type: "Running",
    body_weight_kg: 70.0
  });
  const [calResult, setCalResult] = useState(null);
  const [calLoading, setCalLoading] = useState(false);

  // Classification KNN Sandbox State
  const [clfInput, setClfInput] = useState({
    steps: 8500,
    active_minutes: 45,
    distance_km: 6.0,
    exercise_frequency: 4
  });
  const [clfResult, setClfResult] = useState(null);
  const [clfLoading, setClfLoading] = useState(false);

  // ID3 Recommendation Sandbox State
  const [id3Input, setId3Input] = useState({
    steps: 9000,
    duration_min: 50,
    sleep_hours: 8.0,
    fatigue_level: "Low"
  });
  const [id3Result, setId3Result] = useState(null);
  const [id3Loading, setId3Loading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ins, status] = await Promise.all([
        api.getInsights(),
        api.getModelsStatus()
      ]);
      setInsights(ins);
      setModelStatus(status);
    } catch (err) {
      console.error("Failed to load insights data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleTestCalories = async (e) => {
    e.preventDefault();
    setCalLoading(true);
    try {
      const res = await api.predictCalories(calInput);
      setCalResult(res);
    } catch (err) {
      alert("Calorie prediction failed: " + err.message);
    } finally {
      setCalLoading(false);
    }
  };

  const handleTestClassification = async (e) => {
    e.preventDefault();
    setClfLoading(true);
    try {
      const res = await api.classifyActivity(clfInput);
      setClfResult(res);
    } catch (err) {
      alert("Activity classification failed: " + err.message);
    } finally {
      setClfLoading(false);
    }
  };

  const handleTestReadiness = async (e) => {
    e.preventDefault();
    setId3Loading(true);
    try {
      const res = await api.recommendReadiness(id3Input);
      setId3Result(res);
    } catch (err) {
      alert("Readiness recommendation failed: " + err.message);
    } finally {
      setId3Loading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Processing AI fitness insights and models..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-400" />
            <span>AI Fitness Insights</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized habit intelligence driven by 4 distinct machine learning algorithms.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-dark-border/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-brand-500 text-dark-bg shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Insights Overview
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "sandbox"
                ? "bg-brand-500 text-dark-bg shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Interactive ML Sandbox
          </button>

        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main User Insight Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-brand-500/20 bg-gradient-to-r from-brand-950/30 via-dark-surface to-dark-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                Personalized Synthesis
              </span>
              <span className="text-xs text-slate-400">Continuous Assessment</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {insights?.summary_title || "Your Activity Synthesis"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {insights?.overview_message}
            </p>
          </div>

          {/* 4 Core Insights Grid corresponding to 4 Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Algorithm 1 Insight: Calorie Expenditure via KNN Regression */}
            <InsightCard
              title="Estimated Workout Calorie Output"
              badgeText="KNN Regression"
              accentColor="amber"
              subtitle="Trained on duration, distance, intensity, and user weight"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400">
                  {insights?.estimated_session_calories || 320}
                </span>
                <span className="text-sm font-semibold text-slate-400">kcal per typical workout</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated by analyzing similar historical training sessions using k-Nearest Neighbors continuous regression.
              </p>
            </InsightCard>

            {/* Algorithm 2 Insight: Current Activity Level via KNN Classification */}
            <InsightCard
              title="Daily Activity Lifestyle Tier"
              badgeText="KNN Classifier"
              accentColor="purple"
              subtitle="Classified into Low, Moderate, or High movement categories"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-purple-300">
                  {insights?.current_activity_tier || "Moderate Activity"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights?.activity_tier_tip || 
                 "Your daily volume balances regular steps and structured activity minutes."}
              </p>
            </InsightCard>

            {/* Algorithm 3 Insight: Habit Alignment via Find-S Concept Learning */}
            <InsightCard
              title="Optimal Wellness Habit Alignment"
              badgeText="Find-S Concept Learning"
              accentColor="emerald"
              subtitle="Evaluates workout duration, sleep, and hydration against learned positive concept"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${insights?.habit_alignment?.is_aligned ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="text-lg font-bold text-white">
                  {insights?.habit_alignment?.status || "Habit Target Checked"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights?.habit_alignment?.message ||
                 "Aim for 30+ minutes of exercise with restful sleep to satisfy the most specific hypothesis."}
              </p>
            </InsightCard>

            {/* Algorithm 4 Insight: Daily Workout Readiness via ID3 Decision Tree */}
            <InsightCard
              title="Workout Readiness Recommendation"
              badgeText="ID3 Decision Tree"
              accentColor="blue"
              subtitle="Rule-based readiness determined by Shannon entropy & information gain"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-cyan-300">
                  {insights?.readiness_recommendation?.title || "Standard Workout Session"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights?.readiness_recommendation?.guidance ||
                 "Metrics show balanced recovery. Ready for your standard training session."}
              </p>
            </InsightCard>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ML SANDBOX */}
      {activeTab === "sandbox" && (
        <div className="space-y-8">
          <div className="p-5 rounded-2xl glass-card border border-dark-border/80">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-400" />
              <span>Interactive Model Prediction Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Test and verify each algorithm in real-time with custom inputs. Perfect for testing edge cases and college viva demonstrations.
            </p>
          </div>

          {/* Sandbox 1: Calorie KNN Regressor */}
          <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Algorithm 1
                </span>
                <h4 className="text-base font-bold text-white tracking-tight mt-1">
                  KNN Regression — Calorie Burn Estimator
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">backend/ml_models/knn_regression.py</span>
            </div>

            <form onSubmit={handleTestCalories} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Duration (min)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={calInput.duration_min}
                  onChange={(e) => setCalInput({ ...calInput, duration_min: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={calInput.distance_km}
                  onChange={(e) => setCalInput({ ...calInput, distance_km: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Steps</label>
                <input
                  type="number"
                  min="0"
                  value={calInput.steps}
                  onChange={(e) => setCalInput({ ...calInput, steps: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Activity</label>
                <select
                  value={calInput.activity_type}
                  onChange={(e) => setCalInput({ ...calInput, activity_type: e.target.value })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="Walking">Walking</option>
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Strength Training">Strength</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Swimming">Swimming</option>
                  <option value="HIIT">HIIT</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={calLoading}
                  className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-bg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{calLoading ? "Predicting..." : "Predict"}</span>
                </button>
              </div>
            </form>

            {calResult && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Estimated Calorie Expenditure:</span>
                  <p className="text-2xl font-black text-amber-400">
                    {calResult.estimated_calories} <span className="text-sm font-normal text-slate-300">kcal</span>
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Confidence: <span className="text-emerald-400 font-bold">{calResult.confidence}</span></p>
                  <p className="text-[11px] italic">{calResult.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sandbox 2: KNN Classification */}
          <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Algorithm 2
                </span>
                <h4 className="text-base font-bold text-white tracking-tight mt-1">
                  KNN Classification — Activity Level Tier
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">backend/ml_models/knn_classification.py</span>
            </div>

            <form onSubmit={handleTestClassification} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Daily Steps</label>
                <input
                  type="number"
                  min="0"
                  value={clfInput.steps}
                  onChange={(e) => setClfInput({ ...clfInput, steps: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Active Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={clfInput.active_minutes}
                  onChange={(e) => setClfInput({ ...clfInput, active_minutes: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Weekly Frequency (days)</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={clfInput.exercise_frequency}
                  onChange={(e) => setClfInput({ ...clfInput, exercise_frequency: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={clfLoading}
                  className="w-full py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{clfLoading ? "Classifying..." : "Classify Tier"}</span>
                </button>
              </div>
            </form>

            {clfResult && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 font-medium">Predicted Activity Tier:</span>
                  <span className="text-xs font-bold text-purple-300">Confidence: {clfResult.confidence * 100}%</span>
                </div>
                <p className="text-xl font-black text-purple-400 mb-1">{clfResult.activity_level}</p>
                <p className="text-xs text-slate-300">{clfResult.description}</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-1">Tip: {clfResult.tip}</p>
              </div>
            )}
          </div>

          {/* Sandbox 3: ID3 Decision Tree Readiness */}
          <div className="p-6 rounded-2xl glass-card border border-dark-border/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Algorithm 4
                </span>
                <h4 className="text-base font-bold text-white tracking-tight mt-1">
                  ID3 Decision Tree — Workout Readiness & Focus
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">backend/ml_models/id3_decision_tree.py</span>
            </div>

            <form onSubmit={handleTestReadiness} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Daily Steps</label>
                <input
                  type="number"
                  min="0"
                  value={id3Input.steps}
                  onChange={(e) => setId3Input({ ...id3Input, steps: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Sleep (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={id3Input.sleep_hours}
                  onChange={(e) => setId3Input({ ...id3Input, sleep_hours: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Fatigue Level</label>
                <select
                  value={id3Input.fatigue_level}
                  onChange={(e) => setId3Input({ ...id3Input, fatigue_level: e.target.value })}
                  className="w-full bg-slate-900 border border-dark-border rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="Low">Low Fatigue</option>
                  <option value="Moderate">Moderate Fatigue</option>
                  <option value="High">High Fatigue</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={id3Loading}
                  className="w-full py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-bg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{id3Loading ? "Evaluating..." : "Run Tree"}</span>
                </button>
              </div>
            </form>

            {id3Result && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <span className="text-xs text-slate-400 font-medium">Recommended Training Focus:</span>
                <p className="text-xl font-black text-cyan-300 mt-0.5">{id3Result.title}</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{id3Result.guidance}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
