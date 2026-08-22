import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  className = '',
  onClick,
}) => {
  const colorMap = {
    primary: {
      bg: 'bg-brand-500/10',
      text: 'text-brand-400',
      border: 'border-brand-500/20',
      glow: 'group-hover:border-brand-500/40',
    },
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'group-hover:border-emerald-500/40',
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'group-hover:border-amber-500/40',
    },
    danger: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      glow: 'group-hover:border-rose-500/40',
    },
    info: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-500/20',
      glow: 'group-hover:border-sky-500/40',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-card backdrop-blur-md transition-all duration-200 hover:border-slate-700 hover:shadow-card-hover hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-slate-400 truncate">{title}</span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${scheme.bg} ${scheme.text} ${scheme.border} transition-colors duration-200`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Metric value and trend */}
      <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-sans">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{trend.text}</span>
          </span>
        )}
      </div>

      {/* Subtitle / Context */}
      {subtitle && <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
