import React from 'react';

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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Weekly Attendance Trend</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Workforce presence across current work week</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--primary-500)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--danger)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--warning)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Leave</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '160px', padding: '0 0.5rem', gap: '1rem' }}>
        {chartData.map((item, idx) => {
          const presentHeight = (item.present / maxVal) * 100;
          const absentHeight = (item.absent / maxVal) * 100;
          const leaveHeight = (item.leave / maxVal) * 100;

          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px' }}>
                <div
                  title={`Present: ${item.present}`}
                  style={{
                    width: '30%',
                    height: `${presentHeight}%`,
                    backgroundColor: 'var(--primary-500)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                />
                <div
                  title={`Absent: ${item.absent}`}
                  style={{
                    width: '30%',
                    height: `${absentHeight}%`,
                    backgroundColor: 'var(--danger)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                />
                <div
                  title={`Leave: ${item.leave}`}
                  style={{
                    width: '30%',
                    height: `${leaveHeight}%`,
                    backgroundColor: 'var(--warning)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceChart;
