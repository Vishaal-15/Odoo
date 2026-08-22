import React from 'react';
import { getStatusColor } from '../../utils/formatters';

export const Badge = ({ children, status, variant, className = '' }) => {
  const colorType = variant || (status ? getStatusColor(status) : 'secondary');

  const colorStyles = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    info: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    secondary: { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' },
  };

  const style = colorStyles[colorType] || colorStyles.secondary;

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.025em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        textTransform: 'uppercase',
      }}
    >
      {children || status}
    </span>
  );
};

export default Badge;
