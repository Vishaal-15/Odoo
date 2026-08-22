import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1rem'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-500)', marginBottom: '1rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        The requested resource does not exist or has moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
