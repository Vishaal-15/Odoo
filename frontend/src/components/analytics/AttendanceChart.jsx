import React from 'react';
import Card from '../common/Card';
import { BarChart3 } from 'lucide-react';

export const AttendanceChart = ({ data = [] }) => {
  const defaultData = [
    { day: 'Mon', present: 44, absent: 2, leave: 2 },
    { day: 'Tue', present: 46, absent: 1, leave: 1 },
    { day: 'Wed', present: 45, absent: 0, leave: 3 },
    { day: 'Thu', present: 43, absent: 2, leave: 3 },
    { day: 'Fri', present: 42, absent: 2, leave: 4 },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const maxVal = 50;

  return (
    <Card
      title="Weekly Attendance Trend"
      subtitle="Presence vs absences across the current work week"
      headerIcon={BarChart3}
      action={
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
            <span className="text-slate-400">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-400">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-slate-400">Leave</span>
          </div>
        </div>
      }
    >
      <div className="flex justify-between items-end h-44 pt-4 px-2 gap-3 sm:gap-6 border-b border-slate-800/60 pb-2">
        {chartData.map((item, idx) => {
          const presentHeight = Math.min(100, (item.present / maxVal) * 100);
          const absentHeight = Math.min(100, (item.absent / maxVal) * 100);
          const leaveHeight = Math.min(100, (item.leave / maxVal) * 100);

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full group">
              <div className="flex-1 w-full flex items-end justify-center gap-1 sm:gap-1.5">
                {/* Present Bar */}
                <div
                  title={`Present: ${item.present}`}
                  style={{ height: `${presentHeight}%` }}
                  className="w-1/3 max-w-[14px] bg-brand-500 hover:bg-brand-400 rounded-t transition-all duration-300 shadow-sm"
                />
                {/* Absent Bar */}
                <div
                  title={`Absent: ${item.absent}`}
                  style={{ height: `${absentHeight}%` }}
                  className="w-1/3 max-w-[14px] bg-rose-500/80 hover:bg-rose-400 rounded-t transition-all duration-300"
                />
                {/* Leave Bar */}
                <div
                  title={`On Leave: ${item.leave}`}
                  style={{ height: `${leaveHeight}%` }}
                  className="w-1/3 max-w-[14px] bg-amber-500/80 hover:bg-amber-400 rounded-t transition-all duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 mt-2 transition-colors">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AttendanceChart;
