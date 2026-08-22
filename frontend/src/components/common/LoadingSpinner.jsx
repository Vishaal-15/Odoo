import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({
  message = 'Loading data...',
  size = 'md',
  fullPage = false,
}) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
      <div className="relative">
        <Loader2 className={`${sizeMap[size] || sizeMap.md} text-brand-500 animate-spin`} />
        <div className="absolute inset-0 blur-sm bg-brand-500/20 rounded-full animate-pulse-subtle" />
      </div>
      {message && <p className="text-xs sm:text-sm text-slate-400 font-medium">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
