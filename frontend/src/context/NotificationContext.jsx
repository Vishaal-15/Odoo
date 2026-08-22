import React, { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          container: 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-lg',
          iconColor: 'text-emerald-400',
        };
      case 'error':
        return {
          icon: AlertCircle,
          container: 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-lg',
          iconColor: 'text-rose-400',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          container: 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-lg',
          iconColor: 'text-amber-400',
        };
      case 'info':
      default:
        return {
          icon: Info,
          container: 'bg-slate-900/95 border-brand-500/40 text-brand-300 shadow-lg',
          iconColor: 'text-brand-400',
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border backdrop-blur-md animate-slide-in ${config.container}`}
              role="status"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${config.iconColor}`} />
                <span className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
