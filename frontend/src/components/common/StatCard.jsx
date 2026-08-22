import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => {
  const colorMap = {
    primary: { iconBg: 'rgba(99, 102, 241, 0.15)', iconColor: '#818cf8' },
    success: { iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#34d399' },
    warning: { iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#fbbf24' },
    danger: { iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#f87171' },
    info: { iconBg: 'rgba(59, 130, 246, 0.15)', iconColor: '#60a5fa' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: scheme.iconBg,
              color: scheme.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: trend.isPositive ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default StatCard;
