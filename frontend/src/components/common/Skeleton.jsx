import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variantStyles = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full',
    card: 'rounded-xl h-28 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-slate-800/60 border border-slate-700/30 ${variantStyles[variant] || variantStyles.rect} ${className}`}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>

      {/* Main content split skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="saas-table-container animate-fade-in">
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex gap-4 items-center py-2.5">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton key={cIdx} className={`h-4 ${cIdx === 0 ? 'w-1/4' : 'flex-1'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
