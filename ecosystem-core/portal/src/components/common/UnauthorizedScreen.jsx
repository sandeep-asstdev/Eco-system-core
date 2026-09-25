import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedScreen({ 
  requiredPermission, 
  title = "Access Denied",
  message = "Your assigned role does not have authorization to view or manage this resource."
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-200 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-sm text-slate-600 max-w-md mb-4">{message}</p>
      {requiredPermission && (
        <div className="inline-block bg-slate-100 text-slate-700 text-xs font-mono font-semibold px-3 py-1.5 rounded-md border border-slate-200 mb-6">
          Required Permission: {requiredPermission}
        </div>
      )}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-medium text-sm rounded-lg border border-slate-300 hover:bg-slate-50 transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );
}
