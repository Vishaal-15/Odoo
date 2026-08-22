import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PayrollSummaryCard = ({ payrollSummary, onGeneratePayroll }) => {
  const summary = payrollSummary || {
    totalPayrollExpense: 345800.0,
    averageSalary: 7204.0,
    pendingDisbursements: 0,
    nextPayDay: '2026-08-31',
  };

  return (
    <Card
      title="Payroll Overview & Forecast"
      subtitle="Current pay cycle commitments and upcoming disbursements"
      headerIcon={DollarSign}
      action={
        onGeneratePayroll && (
          <Button onClick={onGeneratePayroll} size="xs" variant="primary">
            Run Batch
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400">Total Monthly Outlay</div>
          <div className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            {formatCurrency(summary.totalPayrollExpense)}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Balanced budget
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400">Average Net Compensation</div>
          <div className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            {formatCurrency(summary.averageSalary)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Per active employee</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400">Upcoming Disbursement</div>
          <div className="text-lg sm:text-xl font-bold text-brand-300 mt-1">
            {summary.nextPayDay}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-brand-400" /> Auto-scheduled
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PayrollSummaryCard;
