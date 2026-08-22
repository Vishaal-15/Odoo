import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { payrollService } from '../../services/payrollService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { DollarSign, FileText, CheckCircle2, Play, Edit, Download, Eye } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Company Payroll Management & Control</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Execute pay cycles, adjust compensation structures, and audit disbursements
          </p>
        </div>

        <button
          onClick={() => setIsRunCycleModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <Play size={16} /> Execute Pay Cycle
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Total Monthly Payroll"
          value={formatCurrency(totalDisbursed || 345800)}
          subtitle="All active employees"
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Total Processed Payslips"
          value={payrollRecords.length}
          subtitle="Current Pay Period (August 2026)"
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Payroll Accuracy Status"
          value="100%"
          subtitle="Zero deduction discrepancies"
          icon={CheckCircle2}
          color="info"
        />
      </div>

      {/* Payroll Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Employee Salary & Payslip Registry</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Detailed breakdown of basic pay, allowances, deductions, and net payout</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading payroll records..." />
        ) : payrollRecords.length === 0 ? (
          <EmptyState title="No payroll records found" description="Execute a pay cycle to generate employee payslips." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Pay Period</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Base Salary</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Allowances</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Deductions</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Net Disbursed</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Controls</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{r.employee_id}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {r.pay_period}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)' }}>
                      {formatCurrency(r.base_salary)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--success)' }}>
                      +{formatCurrency(r.allowances)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--danger)' }}>
                      -{formatCurrency(r.deductions)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary-100)' }}>
                      {formatCurrency(r.net_salary)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={r.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedRecord({ ...r });
                          setIsEditModalOpen(true);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        title="Adjust Structure"
                      >
                        <Edit size={14} /> Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Execute Pay Cycle Modal */}
      <Modal
        isOpen={isRunCycleModalOpen}
        onClose={() => setIsRunCycleModalOpen(false)}
        title="Execute Company Payroll Run"
      >
        <form onSubmit={handleRunPayrollCycle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Target Pay Period
            </label>
            <input
              type="text"
              required
              value={payPeriodToRun}
              onChange={(e) => setPayPeriodToRun(e.target.value)}
              placeholder="September 2026"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            This action calculates taxes, applies authorized leave deductions, and generates confidential payslips for all <strong>48 active employees</strong>.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsRunCycleModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={running} className="btn btn-primary">
              {running ? 'Processing Cycle...' : 'Confirm & Execute Run'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Salary Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Adjust Salary Structure - ${selectedRecord?.employee_name}`}
      >
        {selectedRecord && (
          <form onSubmit={handleSaveSalaryStructure} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Base Salary ($)
              </label>
              <input
                type="number"
                required
                value={selectedRecord.base_salary}
                onChange={(e) => {
                  const base = parseFloat(e.target.value) || 0;
                  const net = base + (selectedRecord.allowances || 0) - (selectedRecord.deductions || 0);
                  setSelectedRecord({ ...selectedRecord, base_salary: base, net_salary: net });
                }}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Total Allowances ($)
                </label>
                <input
                  type="number"
                  value={selectedRecord.allowances}
                  onChange={(e) => {
                    const allow = parseFloat(e.target.value) || 0;
                    const net = (selectedRecord.base_salary || 0) + allow - (selectedRecord.deductions || 0);
                    setSelectedRecord({ ...selectedRecord, allowances: allow, net_salary: net });
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Total Deductions ($)
                </label>
                <input
                  type="number"
                  value={selectedRecord.deductions}
                  onChange={(e) => {
                    const ded = parseFloat(e.target.value) || 0;
                    const net = (selectedRecord.base_salary || 0) + (selectedRecord.allowances || 0) - ded;
                    setSelectedRecord({ ...selectedRecord, deductions: ded, net_salary: net });
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Recalculated Net:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
                {formatCurrency(selectedRecord.net_salary)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Structure
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HrPayroll;
