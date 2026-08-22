import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 antialiased flex flex-col font-sans">
      {/* Odoo Top Navigation Bar & Systray */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
