import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorAlert = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        fontSize: '0.875rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle size={18} color="#ef4444" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#ffffff',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <RotateCcw size={12} /> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
