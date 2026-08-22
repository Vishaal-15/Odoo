import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { payrollService } from '../../services/payrollService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { DollarSign, FileText, CheckCircle2, Play, Edit, Download, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const HrPayroll = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunCycleModalOpen, setIsRunCycleModalOpen] = useState(false);
  const [payPeriodToRun, setPayPeriodToRun] = useState('September 2026');
  const [running, setRunning] = useState(false);

  // Edit salary structure modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getPayrollOverview();
      setPayrollRecords(data);
    } catch (err) {
      console.error('Failed to load payroll overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const handleRunPayrollCycle = async (e) => {
    e.preventDefault();
    setRunning(true);
    try {
      const res = await payrollService.generatePayroll(payPeriodToRun);
      setIsRunCycleModalOpen(false);
      addToast(res.message || `Payroll generated for ${payPeriodToRun}`, 'success');
      loadPayroll();
    } catch (err) {
      addToast(err.message || 'Failed to execute payroll cycle', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleSaveSalaryStructure = (e) => {
    e.preventDefault();
    setPayrollRecords((prev) =>
      prev.map((r) => (r.id === selectedRecord.id ? selectedRecord : r))
    );
    setIsEditModalOpen(false);
    addToast('Salary structure updated and recalculated.', 'success');
  };

  const totalDisbursed = payrollRecords.reduce((acc, curr) => acc + (curr.net_salary || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Payroll Controls & Disbursements"
        subtitle="Execute monthly pay batches, adjust employee salary structures, and audit compensation"
        breadcrumbs={['HR Operations', 'Payroll Controls']}
        actions={
          <Button onClick={() => setIsRunCycleModalOpen(true)} variant="primary" size="sm" icon={Play}>
            Execute Pay Cycle
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Monthly Outlay"
          value={formatCurrency(totalDisbursed || 345800)}
          subtitle="Disbursed to active staff"
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Processed Payslips"
          value={payrollRecords.length}
          subtitle="Statements ready for download"
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Disbursement Status"
          value="100% Paid"
          subtitle="Current month fully balanced"
          icon={CheckCircle2}
          color="info"
        />
      </div>

      {/* Payroll Table Card */}
      <Card
        title={`Company Payroll Register (${payrollRecords.length})`}
        subtitle="Individual employee earnings, deductions, and payment status"
      >
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : payrollRecords.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No payroll records generated"
            description="Run a payroll cycle batch to generate employee salary statements."
            actionLabel="Run Pay Cycle"
            onAction={() => setIsRunCycleModalOpen(true)}
            actionIcon={Play}
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Pay Period</th>
                  <th>Gross Base</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Take-Home</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-semibold text-slate-100">{r.employee_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{r.employee_id}</div>
                    </td>
                    <td className="text-xs text-slate-300">{r.pay_period}</td>
                    <td className="font-medium text-slate-200">{formatCurrency(r.base_salary)}</td>
                    <td className="text-xs font-semibold text-emerald-400">+{formatCurrency(r.allowances)}</td>
                    <td className="text-xs font-semibold text-rose-400">-{formatCurrency(r.deductions)}</td>
                    <td className="font-bold text-slate-100 font-sans">{formatCurrency(r.net_salary)}</td>
                    <td>
                      <Badge status={r.payment_status} size="xs" />
                    </td>
                    <td className="text-right">
                      <Button
                        onClick={() => {
                          setSelectedRecord({ ...r });
                          setIsEditModalOpen(true);
                        }}
                        variant="ghost"
                        size="xs"
                        icon={Edit}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Run Pay Cycle Modal */}
      <Modal
        isOpen={isRunCycleModalOpen}
        onClose={() => setIsRunCycleModalOpen(false)}
        title="Execute Monthly Payroll Batch"
        subtitle="Calculate net earnings and prepare compensation disbursement"
      >
        <form onSubmit={handleRunPayrollCycle} className="space-y-4">
          <Select
            label="Pay Period Batch"
            value={payPeriodToRun}
            onChange={(e) => setPayPeriodToRun(e.target.value)}
          >
            <option value="August 2026">August 2026 (Current Cycle)</option>
            <option value="September 2026">September 2026 (Upcoming)</option>
            <option value="October 2026">October 2026 (Future)</option>
          </Select>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-slate-100">Batch Processing Summary:</div>
            <p className="text-slate-400">
              Generating payroll statements will compute base salary, standard allowances (HRA, transport), and tax deductions for all active staff.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsRunCycleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={running} icon={Play}>
              Process Batch Now
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Salary Structure Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Adjust Compensation: ${selectedRecord?.employee_name || ''}`}
        subtitle="Modify salary components and allowances"
      >
        {selectedRecord && (
          <form onSubmit={handleSaveSalaryStructure} className="space-y-4">
            <Input
              label="Basic Base Salary ($)"
              type="number"
              value={selectedRecord.base_salary}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setSelectedRecord({
                  ...selectedRecord,
                  base_salary: val,
                  net_salary: val + (selectedRecord.allowances || 0) - (selectedRecord.deductions || 0),
                });
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Allowances ($)"
                type="number"
                value={selectedRecord.allowances}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSelectedRecord({
                    ...selectedRecord,
                    allowances: val,
                    net_salary: (selectedRecord.base_salary || 0) + val - (selectedRecord.deductions || 0),
                  });
                }}
              />
              <Input
                label="Deductions ($)"
                type="number"
                value={selectedRecord.deductions}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSelectedRecord({
                    ...selectedRecord,
                    deductions: val,
                    net_salary: (selectedRecord.base_salary || 0) + (selectedRecord.allowances || 0) - val,
                  });
                }}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Computed Net Take-Home:</span>
              <span className="text-base font-bold text-emerald-400 font-sans">
                {formatCurrency(selectedRecord.net_salary)}
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Recalculate
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HrPayroll;
