import React, { useState, useEffect } from 'react';
import { Activity, Flame, Droplets, Moon, Scale, Clock, Footprints, MapPin, Sparkles } from 'lucide-react';
import api from '../services/api';

const ACTIVITY_TYPES = [
  "Walking",
  "Running",
  "Cycling",
  "Strength Training",
  "Yoga",
  "Swimming",
  "HIIT",
  "Other"
];

export default function ActivityForm({ initialData = null, onSubmit, onCancel, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    activity_date: new Date().toISOString().split("T")[0],
    activity_type: "Walking",
    steps: 5000,
    distance_km: 3.5,
    exercise_duration: 30,
    water_intake: 2.0,
    sleep_duration: 7.5,
    body_weight_kg: 70.0,
    notes: ""
  });

  const [validationError, setValidationError] = useState("");
  const [livePreview, setLivePreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        activity_date: initialData.activity_date || new Date().toISOString().split("T")[0],
        activity_type: initialData.activity_type || "Walking",
        steps: initialData.steps ?? 0,
        distance_km: initialData.distance_km ?? 0.0,
        exercise_duration: initialData.exercise_duration ?? 0,
        water_intake: initialData.water_intake ?? 0.0,
        sleep_duration: initialData.sleep_duration ?? 0.0,
        body_weight_kg: initialData.body_weight_kg ?? 70.0,
        notes: initialData.notes || ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["steps", "exercise_duration"].includes(name)
        ? Math.max(0, parseInt(value, 10) || 0)
        : ["distance_km", "water_intake", "sleep_duration", "body_weight_kg"].includes(name)
        ? Math.max(0, parseFloat(value) || 0)
        : value
    }));
  };

  const handlePredictPreview = async () => {
    setIsPreviewLoading(true);
    try {
      const calRes = await api.predictCalories({
        duration_min: Number(formData.exercise_duration),
        distance_km: Number(formData.distance_km),
        steps: Number(formData.steps),
        activity_type: formData.activity_type,
        body_weight_kg: Number(formData.body_weight_kg)
      });

      const clfRes = await api.classifyActivity({
        steps: Number(formData.steps),
        active_minutes: Number(formData.exercise_duration),
        distance_km: Number(formData.distance_km),
        exercise_frequency: 3
      });

      setLivePreview({
        calories: calRes.estimated_calories,
        activityLevel: clfRes.activity_level
      });
    } catch (err) {
      console.warn("Could not fetch preview estimation:", err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.activity_type) {
      setValidationError("Please select an activity type.");
      return;
    }
    if (formData.exercise_duration <= 0 && formData.steps <= 0) {
      setValidationError("Please enter workout duration or steps taken.");
      return;
    }
    if (formData.sleep_duration > 24) {
      setValidationError("Sleep duration cannot exceed 24 hours.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
          {validationError}
        </div>
      )}

      {/* Row 1: Date & Activity Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Activity Date</label>
          <input
            type="date"
            name="activity_date"
            value={formData.activity_date}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Activity Type</label>
          <select
            name="activity_type"
            value={formData.activity_type}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            required
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Duration & Distance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>Duration (minutes)</span>
          </label>
          <input
            type="number"
            name="exercise_duration"
            min="0"
            max="1440"
            value={formData.exercise_duration}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. 45"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Distance (km)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="300"
            name="distance_km"
            value={formData.distance_km}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. 5.2"
          />
        </div>
      </div>

      {/* Row 3: Steps & Water */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Steps</span>
          </label>
          <input
            type="number"
            name="steps"
            min="0"
            max="100000"
            value={formData.steps}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. 8500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>Water Intake (Liters)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="20"
            name="water_intake"
            value={formData.water_intake}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. 2.5"
          />
        </div>
      </div>

      {/* Row 4: Sleep & Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-purple-400" />
            <span>Sleep Duration (hours)</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="24"
            name="sleep_duration"
            value={formData.sleep_duration}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. 7.5"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Body Weight (kg)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="20"
            max="300"
            name="body_weight_kg"
            value={formData.body_weight_kg}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. 70.0"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Optional Notes</label>
        <textarea
          name="notes"
          rows={2}
          value={formData.notes}
          onChange={handleChange}
          className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-brand-500 resize-none"
          placeholder="e.g. Felt energetic, trail running session"
        />
      </div>

      {/* ML Prediction Live Preview */}
      <div className="p-3 rounded-xl bg-slate-800/40 border border-dark-border/80 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI Calorie & Tier Preview
          </p>
          <p className="text-[10px] text-slate-400">
            {livePreview 
              ? `Est. ${livePreview.calories} kcal • ${livePreview.activityLevel}`
              : "Preview estimated calories via KNN ML"}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePredictPreview}
          disabled={isPreviewLoading}
          className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
        >
          {isPreviewLoading ? "Calculating..." : "Preview ML"}
        </button>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/60">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Log Activity"}
        </button>
      </div>
    </form>
  );
}
