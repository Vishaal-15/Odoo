import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { payrollService } from '../../services/payrollService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { DollarSign, FileText, Download, Eye, CheckCircle2, ShieldCheck, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const EmployeePayroll = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const loadPayslips = async () => {
      setLoading(true);
      try {
        const data = await payrollService.getMyPayslips();
        setPayslips(data);
      } catch (err) {
        console.error('Failed to load payslips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPayslips();
  }, []);

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setIsDetailsModalOpen(true);
  };

  const handleDownload = (payslip) => {
    addToast(`Downloading payslip for ${payslip.pay_period}...`, 'info');
  };

  const latestSlip = payslips[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compensation & Payslips"
        subtitle="Confidential monthly salary statements, itemized allowances, and tax withholdings"
        breadcrumbs={['Workspace', 'Salary & Payslips']}
      />

      {/* Salary Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Net Take-Home"
          value={formatCurrency(latestSlip?.net_salary || 7430)}
          subtitle={latestSlip?.pay_period || 'August 2026'}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Basic Monthly Base"
          value={formatCurrency(latestSlip?.base_salary || 7500)}
          subtitle="Fixed Base Salary"
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Total Allowances"
          value={formatCurrency(latestSlip?.allowances || 850)}
          subtitle="HRA, Transport, Medical"
          icon={DollarSign}
          color="info"
        />
        <StatCard
          title="Total Deductions"
          value={formatCurrency(latestSlip?.deductions || 920)}
          subtitle="Tax & Healthcare withholding"
          icon={DollarSign}
          color="warning"
        />
      </div>

      {/* Payslips History Table Card */}
      <Card title="Payslip Statement History" subtitle="Archived monthly pay disbursements">
        {loading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : payslips.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No payslips generated"
            description="Your payroll slips will appear here once disbursed by the HR team."
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Pay Period</th>
                  <th>Disbursement Date</th>
                  <th>Gross Base</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Take-Home</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((slip, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-100">{slip.pay_period}</td>
                    <td className="text-xs text-slate-400">{formatDate(slip.payment_date)}</td>
                    <td className="font-medium text-slate-200">{formatCurrency(slip.base_salary)}</td>
                    <td className="text-emerald-400 text-xs font-medium">+{formatCurrency(slip.allowances)}</td>
                    <td className="text-rose-400 text-xs font-medium">-{formatCurrency(slip.deductions)}</td>
                    <td className="font-bold text-slate-100 font-sans">{formatCurrency(slip.net_salary)}</td>
                    <td>
                      <Badge status={slip.payment_status} size="xs" />
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => handleViewPayslip(slip)}
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => handleDownload(slip)}
                          variant="ghost"
                          size="xs"
                          icon={Download}
                        >
                          PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detailed Payslip Statement Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Payslip Statement: ${selectedPayslip?.pay_period || ''}`}
        subtitle="Itemized compensation breakdown"
      >
        {selectedPayslip && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-400">Employee</div>
                <div className="font-bold text-slate-100 text-sm">{user?.first_name} {user?.last_name}</div>
              </div>
              <Badge status={selectedPayslip.payment_status} />
            </div>

            {/* Breakdown Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4" /> Earnings & Allowances
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Basic Base Salary</span>
                    <span className="font-semibold text-slate-100">{formatCurrency(selectedPayslip.base_salary)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-semibold text-emerald-400">+{formatCurrency(selectedPayslip.allowances * 0.6)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Transport / Conveyance</span>
                    <span className="font-semibold text-emerald-400">+{formatCurrency(selectedPayslip.allowances * 0.4)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4" /> Withholdings & Deductions
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Income Tax (TDS)</span>
                    <span className="font-semibold text-rose-400">-{formatCurrency(selectedPayslip.deductions * 0.7)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Provident Fund (PF)</span>
                    <span className="font-semibold text-rose-400">-{formatCurrency(selectedPayslip.deductions * 0.3)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance & Leave Computation Basis */}
            {selectedPayslip.remarks && (
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs">
                <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Attendance & Leave Computation Basis:
                </div>
                <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                  {selectedPayslip.remarks}
                </p>
              </div>
            )}

            {/* Total Net Take-Home */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/50 to-slate-900 border border-purple-500/30 flex justify-between items-center">
              <div>
                <div className="text-xs font-semibold text-purple-300">Net Take-Home Disbursed</div>
                <div className="text-xs text-slate-400">Paid on {formatDate(selectedPayslip.payment_date)}</div>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(selectedPayslip.net_salary)}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Download} onClick={() => handleDownload(selectedPayslip)}>
                Download Payslip PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeePayroll;
