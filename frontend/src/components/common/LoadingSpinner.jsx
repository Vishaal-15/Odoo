import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 20,
    md: 36,
    lg: 52,
  };
  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: `${dimension}px`,
          height: `${dimension}px`,
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--primary-500)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
