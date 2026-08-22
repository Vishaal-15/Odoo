import React from 'react';

export const LeaveBreakdownChart = ({ stats = [] }) => {
  const defaultStats = [
    { type: 'Paid Vacation', count: 12, percent: 60, color: '#6366f1' },
    { type: 'Medical / Sick', count: 6, percent: 30, color: '#10b981' },
    { type: 'Casual / Unpaid', count: 2, percent: 10, color: '#f59e0b' },
  ];

  const items = stats.length > 0 ? stats : defaultStats;

  return (
    <div className="card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Leave Utilization Breakdown</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Distribution of leaves requested across departments</p>
      </div>

      <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.25rem', backgroundColor: 'var(--bg-main)' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              width: `${item.percent}%`,
              backgroundColor: item.color || '#6366f1',
              transition: 'width 0.4s ease',
            }}
            title={`${item.type}: ${item.count} (${item.percent}%)`}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color || '#6366f1' }} />
              <span style={{ color: 'var(--text-main)' }}>{item.type}</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              {item.count} days ({item.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBreakdownChart;
