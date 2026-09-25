import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      {text && <p className="mt-4 text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
}
