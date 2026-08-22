import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const NotFoundPage = () => {
  const { user } = useAuth();

  const getHomePath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'HR') return '/hr/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          color: 'var(--primary-500)',
          letterSpacing: '-0.05em',
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '1.5rem' }}>
        The requested HRMS module or resource could not be found or you may not have authorization.
      </p>
      <Link to={getHomePath()} className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
