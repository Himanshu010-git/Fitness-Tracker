import React, { useState, useEffect } from 'react';
import { Activity, Plus, Filter, Calendar, Search } from 'lucide-react';
import api from '../services/api';
import ActivityTable from '../components/ActivityTable';
import Modal from '../components/Modal';
import ActivityForm from '../components/ActivityForm';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const FILTER_TYPES = ["All", "Walking", "Running", "Cycling", "Strength Training", "Yoga", "Swimming", "HIIT", "Other"];

export default function ActivityTracker({ onOpenActivityModal, refreshTrigger, onActivityMutated }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [editingActivity, setEditingActivity] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        activityType: selectedType !== "All" ? selectedType : undefined
      });
      setActivities(data || []);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedType, startDate, endDate, refreshTrigger]);

  const handleEditClick = (activity) => {
    setEditingActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (formData) => {
    if (!editingActivity) return;
    setIsSubmitting(true);
    try {
      await api.updateActivity(editingActivity.id, formData);
      setNotification({ type: 'success', message: 'Activity record successfully updated!' });
      setIsEditModalOpen(false);
      setEditingActivity(null);
      fetchActivities();
      if (onActivityMutated) onActivityMutated();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update activity' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity record?")) return;
    try {
      await api.deleteActivity(id);
      setNotification({ type: 'success', message: 'Activity record removed.' });
      fetchActivities();
      if (onActivityMutated) onActivityMutated();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete activity' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-400" />
            <span>Activity Log & History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Record workout sessions, filter historical movement, and track calorie burn.
          </p>
        </div>

        <button
          onClick={onOpenActivityModal}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log New Activity</span>
        </button>
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

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-card border border-dark-border/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {FILTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Activity Types" : type}
                </option>
              ))}
            </select>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              className="bg-slate-900 border border-dark-border rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              className="bg-slate-900 border border-dark-border rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {(selectedType !== "All" || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedType("All");
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingState message="Fetching activity logs..." />
      ) : activities.length > 0 ? (
        <ActivityTable
          activities={activities}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState
          icon={Activity}
          title="No activity entries found"
          description={
            selectedType !== "All" || startDate || endDate
              ? "No logs match your filter criteria. Try adjusting your date range or activity type."
              : "Your activity log is currently empty. Record your first workout to begin tracking!"
          }
          actionLabel="Log Workout"
          onAction={onOpenActivityModal}
        />
      )}

      {/* Edit Activity Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Activity Record"
        subtitle="Update workout duration, distance, steps, or notes"
      >
        <ActivityForm
          initialData={editingActivity}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
