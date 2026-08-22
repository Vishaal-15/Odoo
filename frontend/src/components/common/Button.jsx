import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white shadow-sm hover:shadow-glow-brand border border-brand-500/30 focus-visible:ring-brand-500/50',
    secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-800/90 text-slate-200 border border-slate-700/80 focus-visible:ring-slate-500/40',
    outline: 'bg-transparent hover:bg-slate-800/70 text-slate-300 hover:text-white border border-slate-700/80 focus-visible:ring-slate-500/40',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 focus-visible:ring-slate-500/40',
    danger: 'bg-rose-600/90 hover:bg-rose-500 active:bg-rose-700 text-white border border-rose-500/30 focus-visible:ring-rose-500/50 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-500/30 focus-visible:ring-emerald-500/50 shadow-sm',
  };

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 rounded-lg gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
