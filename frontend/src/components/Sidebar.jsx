import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Target,
  BarChart3,
  Sparkles,
  User,
  Flame,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Activity Tracker', to: '/activities', icon: Activity },
  { name: 'Fitness Goals', to: '/goals', icon: Target },
  { name: 'Progress Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'AI Insights', to: '/insights', icon: Sparkles, badge: 'ML' },
  { name: 'Profile & Settings', to: '/profile', icon: User },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-dark-surface/95 border-r border-dark-border/80 flex flex-col transition-transform duration-300 ease-in-out backdrop-blur-xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-dark-border/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              FitTrack <span className="text-brand-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">AI</span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Smart Fitness & Analytics</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/15 to-transparent text-brand-400 border-l-2 border-brand-500'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-opacity ${
                          isActive ? 'opacity-100 text-brand-400' : 'opacity-0 group-hover:opacity-60 text-slate-400'
                        }`}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Viva & Academic Badge */}
        <div className="p-4 mx-3 mb-4 rounded-xl glass-card border border-dark-border/80 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">ML Engine Status</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            4 Academic Algorithms active: KNN (Reg/Clf), Find-S & ID3 Decision Tree.
          </p>
        </div>
      </aside>
    </>
  );
}
