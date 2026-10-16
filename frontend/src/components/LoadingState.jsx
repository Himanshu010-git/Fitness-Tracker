import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = "Loading fitness data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-brand-500/20 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-300">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Connecting to intelligent backend</p>
    </div>
  );
}
