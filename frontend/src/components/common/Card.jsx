import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  headerIcon: Icon,
  className = '',
  bodyClassName = '',
  interactive = false,
  noPadding = false,
  ...props
}) => {
  const hasHeader = title || subtitle || action || Icon;

  return (
    <div
      className={`bg-slate-900/80 border border-slate-800/80 rounded-xl shadow-card backdrop-blur-md transition-all duration-200 ${
        interactive ? 'hover:border-slate-700 hover:shadow-card-hover hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className="text-sm sm:text-base font-semibold text-slate-100">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-5'} ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
