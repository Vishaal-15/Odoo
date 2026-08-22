import React from 'react';
import { getStatusColor } from '../../utils/formatters';

export const Badge = ({ children, status, variant, size = 'sm', className = '' }) => {
  const colorType = variant || (status ? getStatusColor(status) : 'secondary');

  const colorStyles = {
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/25',
      dot: 'bg-emerald-400',
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      border: 'border-amber-500/25',
      dot: 'bg-amber-400',
    },
    danger: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-500/25',
      dot: 'bg-rose-400',
    },
    info: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-300',
      border: 'border-sky-500/25',
      dot: 'bg-sky-400',
    },
    brand: {
      bg: 'bg-brand-500/10',
      text: 'text-brand-300',
      border: 'border-brand-500/25',
      dot: 'bg-brand-400',
    },
    secondary: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-300',
      border: 'border-slate-500/25',
      dot: 'bg-slate-400',
    },
  };

  const style = colorStyles[colorType] || colorStyles.secondary;
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide uppercase ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      <span>{children || status}</span>
    </span>
  );
};

export default Badge;
