import React from 'react';
import Card from '../common/Card';
import { PieChart } from 'lucide-react';

export const LeaveBreakdownChart = ({ stats = [] }) => {
  const defaultStats = [
    { type: 'Paid Vacation', count: 12, percent: 60, colorClass: 'bg-brand-500', textClass: 'text-brand-400' },
    { type: 'Medical / Sick', count: 6, percent: 30, colorClass: 'bg-emerald-500', textClass: 'text-emerald-400' },
    { type: 'Casual / Unpaid', count: 2, percent: 10, colorClass: 'bg-amber-500', textClass: 'text-amber-400' },
  ];

  const items = stats.length > 0 ? stats : defaultStats;

  return (
    <Card
      title="Leave Utilization Breakdown"
      subtitle="Distribution of leaves requested across company"
      headerIcon={PieChart}
    >
      {/* Progress Bar Representation */}
      <div className="flex h-3 rounded-full overflow-hidden mb-5 bg-slate-950/60 p-0.5 border border-slate-800">
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{ width: `${item.percent}%` }}
            className={`h-full ${item.colorClass || 'bg-brand-500'} transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
            title={`${item.type}: ${item.count} days (${item.percent}%)`}
          />
        ))}
      </div>

      {/* Legend & Breakdown List */}
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.colorClass || 'bg-brand-500'} shrink-0`} />
              <span className="text-xs sm:text-sm font-medium text-slate-200">{item.type}</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-400">
              {item.count} days <span className="text-slate-500">({item.percent}%)</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LeaveBreakdownChart;
