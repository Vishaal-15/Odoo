import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorAlert = ({
  title,
  message,
  onDismiss,
  className = '',
}) => {
  if (!message && !title) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-fade-in ${className}`}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-semibold text-rose-200 mb-0.5">{title}</h4>}
        <p className="text-xs sm:text-sm text-rose-300/90 leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
