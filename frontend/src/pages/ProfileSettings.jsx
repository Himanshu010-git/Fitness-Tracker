import React, { useState, useEffect } from 'react';
import { User, Scale, Ruler, Dumbbell, Target, Clock, Calendar, Check, Save } from 'lucide-react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';

const EXERCISE_OPTIONS = [
  "Walking",
  "Running",
  "Cycling",
  "Strength Training",
  "Yoga",
  "Swimming",
  "HIIT"
];

const FITNESS_OBJECTIVES = [
  "Improve endurance",
  "Maintain general fitness",
  "Increase daily activity",
  "Improve exercise consistency",
  "Track weight changes"
];

export default function ProfileSettings({ onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const [profile, setProfile] = useState({
    display_name: "Alex Turner",
    age: 24,
    height_cm: 175.0,
    weight_kg: 70.0,
    preferred_exercise_type: "Running",
    fitness_objective: "Improve endurance",
    available_workout_time: 45,
    preferred_exercise_frequency: 4,
    bmi: 22.9,
    bmi_category: "Healthy Weight"
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const data = await api.getProfile();
        if (data) setProfile(data);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => {
      const updated = {
        ...prev,
        [name]: ["age", "available_workout_time", "preferred_exercise_frequency"].includes(name)
          ? parseInt(value, 10) || 0
          : ["height_cm", "weight_kg"].includes(name)
          ? parseFloat(value) || 0.0
          : value
      };

      // Live BMI recalculation
      if (updated.height_cm > 0 && updated.weight_kg > 0) {
        const heightM = updated.height_cm / 100.0;
        const newBmi = Math.round((updated.weight_kg / (heightM * heightM)) * 10) / 10;
        updated.bmi = newBmi;
        if (newBmi < 18.5) updated.bmi_category = "Underweight";
        else if (newBmi < 25.0) updated.bmi_category = "Healthy Weight";
        else if (newBmi < 30.0) updated.bmi_category = "Overweight";
        else updated.bmi_category = "Obesity";
      }

      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setNotification({ type: "success", message: "Fitness profile updated successfully!" });
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to save profile changes" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your athlete profile..." />;
  }

  const getBmiBadge = (cat) => {
    switch (cat) {
      case "Healthy Weight":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Overweight":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Underweight":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-brand-400" />
          <span>Profile & Fitness Preferences</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your biometric measurements and training preferences to personalize your AI insights.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Biometric Metrics & Live BMI */}
        <div className="p-6 rounded-2xl glass-card border border-dark-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Biometric Parameters
            </h3>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBmiBadge(profile.bmi_category)}`}>
              BMI: {profile.bmi} • {profile.bmi_category}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                name="display_name"
                value={profile.display_name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
              <input
                type="number"
                name="age"
                min="10"
                max="120"
                value={profile.age}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                <span>Height (cm)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="50"
                max="250"
                name="height_cm"
                value={profile.height_cm}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="20"
                max="300"
                name="weight_kg"
                value={profile.weight_kg}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Card 2: Training Objectives & Preferences */}
        <div className="p-6 rounded-2xl glass-card border border-dark-border/80 space-y-4">
          <div className="border-b border-dark-border/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Training Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-brand-400" />
                <span>Preferred Activity Type</span>
              </label>
              <select
                name="preferred_exercise_type"
                value={profile.preferred_exercise_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                {EXERCISE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span>Primary Fitness Objective</span>
              </label>
              <select
                name="fitness_objective"
                value={profile.fitness_objective}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                {FITNESS_OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Available Workout Time (minutes/session)</span>
              </label>
              <input
                type="number"
                min="10"
                max="240"
                name="available_workout_time"
                value={profile.available_workout_time}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Workout Frequency (days/week)</span>
              </label>
              <input
                type="number"
                min="1"
                max="7"
                name="preferred_exercise_frequency"
                value={profile.preferred_exercise_frequency}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-bold text-sm shadow-xl shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
