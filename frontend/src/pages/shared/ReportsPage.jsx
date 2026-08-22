import React, { useState, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { analyticsService } from '../../services/analyticsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { FileText, Download, Calendar, CheckCircle2, Clock, Filter } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const ReportsPage = () => {
  const { addToast } = useNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getReportsSummary();
        setReports(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleExportReport = async (reportType, format) => {
    setExporting(true);
    try {
      const res = await analyticsService.exportReport(reportType, format);
      addToast(res.message || `Exporting ${reportType} report...`, 'success');
    } catch (err) {
      addToast('Failed to export report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const quickExportTemplates = [
    {
      title: 'Monthly Attendance Register',
      desc: 'Complete employee shift punch logs, presence rates, and absence breakdown',
      type: 'Monthly Attendance',
      format: 'csv',
      badge: 'CSV Data',
    },
    {
      title: 'Payroll Outlay Statement',
      desc: 'Disbursement audit breakdown, tax withholdings, allowances, and net salaries',
      type: 'Payroll Statement',
      format: 'pdf',
      badge: 'PDF Report',
    },
    {
      title: 'Leave Balances & Quota Audit',
      desc: 'Annual leave quotas, active utilization records by employee & division',
      type: 'Leave Audit',
      format: 'csv',
      badge: 'CSV Data',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Corporate Reports & Data Exports"
        subtitle="Generate, audit, and export official attendance registers, payroll statements, and time-off audits"
        breadcrumbs={['Intelligence', 'Reports']}
      />

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickExportTemplates.map((tpl, idx) => (
          <Card
            key={idx}
            className="flex flex-col justify-between"
            title={tpl.title}
            action={<Badge variant="brand" size="xs">{tpl.badge}</Badge>}
          >
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{tpl.desc}</p>
            <Button
              onClick={() => handleExportReport(tpl.type, tpl.format)}
              isLoading={exporting}
              variant="outline"
              size="sm"
              className="w-full justify-center"
              icon={Download}
            >
              Export {tpl.format.toUpperCase()}
            </Button>
          </Card>
        ))}
      </div>

      {/* Generated Reports Table Card */}
      <Card
        title="Archived Compliance Reports & Exports"
        subtitle="Historical audit log of generated corporate reports"
        headerIcon={FileText}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No report logs"
            description="Generated reports will be archived here for reference."
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Category</th>
                  <th>Generated Date</th>
                  <th>File Size</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{r.name}</span>
                    </td>
                    <td className="text-xs text-slate-300">{r.category}</td>
                    <td className="text-xs text-slate-400">{formatDate(r.date)}</td>
                    <td className="text-xs text-slate-400 font-mono">{r.size}</td>
                    <td>
                      <Badge status={r.status} size="xs" />
                    </td>
                    <td className="text-right">
                      <Button
                        onClick={() => handleExportReport(r.name, 'pdf')}
                        variant="ghost"
                        size="xs"
                        icon={Download}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
