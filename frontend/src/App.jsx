import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import ActivityForm from './components/ActivityForm';

import Dashboard from './pages/Dashboard';
import ActivityTracker from './pages/ActivityTracker';
import FitnessGoals from './pages/FitnessGoals';
import ProgressAnalytics from './pages/ProgressAnalytics';
import AIFitnessInsights from './pages/AIFitnessInsights';
import ProfileSettings from './pages/ProfileSettings';
import api from './services/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profile, setProfile] = useState(null);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [globalNotification, setGlobalNotification] = useState(null);

  // Load user profile for display name and avatar
  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      console.warn("Could not load initial user profile:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [refreshTrigger]);

  const handleGlobalActivitySubmit = async (formData) => {
    setIsSubmittingActivity(true);
    try {
      const savedActivity = await api.createActivity(formData);
      setIsActivityModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);

      // Check if Find-S detected any habit issues in the logged data
      const warnings = savedActivity?.habit_warnings || [];
      if (warnings.length > 0) {
        setGlobalNotification({
          type: "warning",
          message: `⚠️ Habit Alert: ${warnings.join(" ")}`,
        });
      } else {
        setGlobalNotification({
          type: "success",
          message: "Activity logged successfully! ML insights & progress updated.",
        });
      }
      setTimeout(() => setGlobalNotification(null), 7000);
    } catch (err) {
      alert("Failed to log activity: " + err.message);
    } finally {
      setIsSubmittingActivity(false);
    }
  };


  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col lg:flex-row antialiased">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenActivityModal={() => setIsActivityModalOpen(true)}
            profile={profile}
          />

          {/* Global Notification Banner */}
          {globalNotification && (
            <div className={`mx-4 lg:mx-8 mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              globalNotification.type === "warning"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            }`}>
              <span>{globalNotification.message}</span>
              <button
                onClick={() => setGlobalNotification(null)}
                className="underline text-xs ml-4"
              >
                Dismiss
              </button>
            </div>
          )}


          {/* Page Routing */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    onOpenActivityModal={() => setIsActivityModalOpen(true)}
                    refreshTrigger={refreshTrigger}
                  />
                }
              />
              <Route
                path="/activities"
                element={
                  <ActivityTracker
                    onOpenActivityModal={() => setIsActivityModalOpen(true)}
                    refreshTrigger={refreshTrigger}
                    onActivityMutated={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                }
              />
              <Route
                path="/goals"
                element={
                  <FitnessGoals
                    refreshTrigger={refreshTrigger}
                    onGoalMutated={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProgressAnalytics
                    refreshTrigger={refreshTrigger}
                    onOpenActivityModal={() => setIsActivityModalOpen(true)}
                  />
                }
              />
              <Route
                path="/insights"
                element={<AIFitnessInsights refreshTrigger={refreshTrigger} />}
              />
              <Route
                path="/profile"
                element={<ProfileSettings onProfileUpdated={(p) => setProfile(p)} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-dark-border/40 py-6 px-4 lg:px-8 text-center text-xs text-slate-500">
            <p>
              FitTrack AI — Intelligent Fitness Tracking & Machine Learning Platform.
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Academic Lab Implementation • Algorithms: KNN Regression, KNN Classification, Find-S & ID3 Decision Tree.
            </p>
          </footer>
        </div>

        {/* Global Log Activity Modal */}
        <Modal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          title="Log Physical Activity"
          subtitle="Record steps, duration, and metrics to calculate calorie burn via ML"
        >
          <ActivityForm
            onSubmit={handleGlobalActivitySubmit}
            onCancel={() => setIsActivityModalOpen(false)}
            isSubmitting={isSubmittingActivity}
          />
        </Modal>
      </div>
    </Router>
  );
}
