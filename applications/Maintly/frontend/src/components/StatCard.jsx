import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function StatCard({ title, count, color, bg, border, isCritical, onClick, icon: Icon }) {
  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${bg || 'bg-white'} ${border || 'border-slate-200'} ${isCritical ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && <Icon className={`w-4 h-4 ${color || 'text-slate-400'}`} />}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className={`text-2xl font-bold tracking-tight ${color || 'text-slate-900'}`}>
          {count !== undefined ? count : 0}
        </span>
        <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 flex items-center gap-0.5 transition-colors">
          View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
