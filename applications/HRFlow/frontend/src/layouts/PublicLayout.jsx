import React from 'react';
import { Outlet } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 max-w-5xl mx-auto w-full">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">HRFlow</span>
            <span className="text-[10px] block font-medium text-indigo-600 -mt-1 tracking-wider uppercase">
              Candidate Onboarding Portal
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 HRFlow HRMS. Secure onboarding portal.
      </footer>
    </div>
  );
};

export default PublicLayout;
