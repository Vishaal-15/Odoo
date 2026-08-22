import React from 'react';
import { DollarSign, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PayrollSummaryCard = ({ payrollSummary, onGeneratePayroll }) => {
  const summary = payrollSummary || {
    totalPayrollExpense: 345800.0,
    averageSalary: 7204.0,
    pendingDisbursements: 0,
    nextPayDay: '2026-08-31',
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Payroll Overview & Processing</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current pay cycle budget and disbursements</p>
        </div>
        {onGeneratePayroll && (
          <button onClick={onGeneratePayroll} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            Run Payroll Cycle
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Monthly Outlay</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {formatCurrency(summary.totalPayrollExpense)}
          </div>
        </div>

        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Net Compensation</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {formatCurrency(summary.averageSalary)}
          </div>
        </div>

        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upcoming Disbursement</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-100)', marginTop: '4px' }}>
            {summary.nextPayDay}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSummaryCard;
