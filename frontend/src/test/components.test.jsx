import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../components/common/Badge';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';

describe('Common Components', () => {
  it('renders Badge with custom text and status', () => {
    render(<Badge status="APPROVED">Approved</Badge>);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders StatCard with title, value, and subtitle', () => {
    render(
      <StatCard
        title="Total Workforce"
        value="48"
        subtitle="Active staff"
      />
    );
    expect(screen.getByText('Total Workforce')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('Active staff')).toBeInTheDocument();
  });

  it('renders EmptyState with prompt text', () => {
    render(
      <EmptyState
        title="No Leave Records"
        description="Submit your first leave request."
      />
    );
    expect(screen.getByText('No Leave Records')).toBeInTheDocument();
    expect(screen.getByText('Submit your first leave request.')).toBeInTheDocument();
  });
});
