import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFoundPage = () => {
  const { user } = useAuth();

  const getHomePath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'HR') return '/hr/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="relative">
        <div className="text-8xl sm:text-9xl font-extrabold tracking-tight text-brand-500/20 select-none font-sans">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center shadow-glow-brand">
            <FileQuestion className="w-7 h-7" />
          </div>
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
          Page or Route Not Found
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          The requested HRMS view does not exist or you may not have the required permission tier to access it.
        </p>
      </div>

      <Link to={getHomePath()}>
        <Button variant="primary" size="md" icon={Home}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
