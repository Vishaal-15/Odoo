import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  containerClassName = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs sm:text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full bg-slate-900/90 border rounded-lg py-2 text-sm text-slate-100 placeholder-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-slate-950 ${
            Icon ? 'pl-9' : 'pl-3.5'
          } ${RightIcon ? 'pr-9' : 'pr-3.5'} ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-100'
              : 'border-slate-700/80 focus:border-brand-500 focus:ring-brand-500/20'
          } ${className}`}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
