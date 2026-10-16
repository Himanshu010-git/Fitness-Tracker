import React from 'react';
import { Menu, Plus, Activity, User, Bell } from 'lucide-react';

export default function Navbar({ onToggleSidebar, onOpenActivityModal, profile }) {
  const displayName = profile?.display_name || "Alex Turner";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border/60 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            FitTrack Dashboard
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live Synced
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Log Activity Button */}
        <button
          id="btn-quick-log-activity"
          onClick={onOpenActivityModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-bg font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Activity</span>
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-dark-border/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-brand-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-brand-500/30">
            {userInitials || <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">{displayName}</p>
            <p className="text-[10px] text-slate-400 font-medium">Standard Athlete</p>
          </div>
        </div>
      </div>
    </header>
  );
}
