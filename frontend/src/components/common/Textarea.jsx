import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  id,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="text-xs sm:text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full bg-slate-900/90 border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-slate-950 resize-y ${
          error
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-100'
            : 'border-slate-700/80 focus:border-brand-500 focus:ring-brand-500/20'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
