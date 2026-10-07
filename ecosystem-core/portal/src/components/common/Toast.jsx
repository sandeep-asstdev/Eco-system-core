import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

export default function Toast({ 
  message, 
  title, 
  type = 'error', 
  onClose, 
  duration = 6000 
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;
  if (typeof document === 'undefined') return null;

  const typeConfig = {
    error: {
      bg: 'bg-rose-50 border-rose-300 text-rose-900',
      iconBg: 'bg-rose-100 text-rose-600',
      icon: AlertCircle,
      defaultTitle: 'Authentication Error'
    },
    suspended: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: ShieldAlert,
      defaultTitle: 'Account Suspended'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: CheckCircle2,
      defaultTitle: 'Success'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-300 text-amber-900',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: AlertTriangle,
      defaultTitle: 'Warning'
    },
    info: {
      bg: 'bg-blue-50 border-blue-300 text-blue-900',
      iconBg: 'bg-blue-100 text-blue-600',
      icon: Info,
      defaultTitle: 'Information'
    }
  };

  const config = typeConfig[type] || typeConfig.error;
  const IconComponent = config.icon;

  const content = (
    <div 
      id="toast-notification"
      role="alert"
      style={{ zIndex: 99999 }}
      className="fixed top-5 right-5 z-[99999] max-w-md w-full sm:w-96 shadow-2xl transition-all duration-300 ease-out"
    >
      <div className={`p-4 rounded-xl border-2 shadow-2xl flex items-start gap-3 ${config.bg} backdrop-blur-md`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.iconBg} shadow-sm`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-bold text-xs leading-none mb-1 text-slate-900">
            {title || config.defaultTitle}
          </p>
          <p className="text-xs leading-relaxed font-medium opacity-90 break-words">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-black/10 transition shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
