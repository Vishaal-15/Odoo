import React from 'react';
import Card from '../common/Card';
import { Building2, Users } from 'lucide-react';

export const WorkforceStats = ({ departments = [] }) => {
  const defaultDepts = [
    { name: 'Software Engineering', count: 22, lead: 'Alexander Wright' },
    { name: 'Product & Design', count: 8, lead: 'Sarah Connor' },
    { name: 'Human Resources', count: 6, lead: 'Helen Vance' },
    { name: 'Marketing & Growth', count: 7, lead: 'Marcus Brody' },
    { name: 'Finance & Accounting', count: 5, lead: 'Rachel Green' },
  ];

  const depts = departments.length > 0 ? departments : defaultDepts;

  return (
    <Card
      title="Department Headcount Breakdown"
      subtitle="Workforce distribution across functional divisions"
      headerIcon={Building2}
    >
      <div className="space-y-2.5">
        {depts.map((dept, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/70 hover:border-slate-700/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-100">{dept.name}</div>
                <div className="text-[11px] text-slate-400">Team Lead: {dept.lead || 'Department Manager'}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700/60">
                <Users className="w-3 h-3 text-slate-400" />
                {dept.count} members
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default WorkforceStats;
