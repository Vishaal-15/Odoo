import React from 'react';
import { Building2, Users, Briefcase } from 'lucide-react';

export const WorkforceStats = ({ departments = [] }) => {
  const defaultDepts = [
    { name: 'Software Engineering', count: 22, lead: 'Alexander Wright' },
    { name: 'Product & Design', count: 8, lead: 'Sarah Connor' },
    { name: 'Human Resources', count: 6, lead: 'Helen Vance' },
    { name: 'Marketing & Growth', count: 7, lead: 'Marcus Brody' },
    { name: 'Finance & Accounting', count: 5, lead: 'Rachel Green' },
  ];

  const depts = departments.length > 0 ? departments : defaultDepts;

  return (
    <div className="card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Department Headcount Breakdown</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Workforce distribution across functional teams</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {depts.map((dept, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{dept.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Lead: {dept.lead}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-100)' }}>
                {dept.count} members
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkforceStats;
