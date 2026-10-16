/**
 * FitTrack AI - Centralized Frontend API Service
 * File: frontend/src/services/api.js
 * 
 * Provides clean asynchronous methods for interacting with the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorMsg = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = Array.isArray(errorData.detail)
            ? errorData.detail.map((e) => e.msg).join(", ")
            : errorData.detail;
        }
      } catch (_) {
        // Response wasn't JSON
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${options.method || "GET"} ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // --- Health ---
  checkHealth: () => request("/health"),

  // --- Activities ---
  getActivities: (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append("start_date", params.startDate);
    if (params.endDate) query.append("end_date", params.endDate);
    if (params.activityType) query.append("activity_type", params.activityType);
    if (params.limit) query.append("limit", params.limit);
    const qs = query.toString();
    return request(`/activities${qs ? `?${qs}` : ""}`);
  },

  getActivityById: (id) => request(`/activities/${id}`),

  createActivity: (data) =>
    request("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateActivity: (id, data) =>
    request(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteActivity: (id) =>
    request(`/activities/${id}`, {
      method: "DELETE",
    }),

  // --- Fitness Goals ---
  getGoals: () => request("/goals"),

  createGoal: (data) =>
    request("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateGoal: (id, data) =>
    request(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteGoal: (id) =>
    request(`/goals/${id}`, {
      method: "DELETE",
    }),

  logAchievement: (id, data) =>
    request(`/goals/${id}/achievement`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // --- User Profile ---
  getProfile: () => request("/profile"),

  updateProfile: (data) =>
    request("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // --- Analytics ---
  getAnalytics: (range = "30d") => request(`/analytics?range=${range}`),

  // --- AI Insights & Model Sandbox ---
  getInsights: () => request("/insights"),

  predictCalories: (data) =>
    request("/insights/predict-calories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  classifyActivity: (data) =>
    request("/insights/classify-activity", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  recommendReadiness: (data) =>
    request("/insights/readiness-recommendation", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getModelsStatus: () => request("/insights/models-status"),
};

export default api;
