import React, { useState, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileText, Download, Filter, Calendar, CheckCircle2 } from 'lucide-react';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Corporate Reports Generator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Generate, audit, and export official attendance registers, payroll summaries, and time-off audits
        </p>
      </div>

      {/* Quick Export Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Attendance Register</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Full monthly employee check-in & absence log</p>
          </div>
          <button
            onClick={() => handleExportReport('Monthly Attendance', 'csv')}
            disabled={exporting}
            className="btn btn-outline"
            style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', fontSize: '0.8rem' }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Payroll Outlay Statement</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Disbursement breakdown, tax withholdings, net pay</p>
          </div>
          <button
            onClick={() => handleExportReport('Payroll Statement', 'pdf')}
            disabled={exporting}
            className="btn btn-outline"
            style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', fontSize: '0.8rem' }}
          >
            <Download size={14} /> Export PDF
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Leave Balances Audit</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Annual leave utilization by employee & department</p>
          </div>
          <button
            onClick={() => handleExportReport('Leave Audit', 'csv')}
            disabled={exporting}
            className="btn btn-outline"
            style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', fontSize: '0.8rem' }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Reports History */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          Generated Reports Archive
        </h3>

        {loading ? (
          <LoadingSpinner message="Loading reports registry..." />
        ) : reports.length === 0 ? (
          <EmptyState title="No archived reports" description="Generated reports will appear in this registry." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Report Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Generated Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Format</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {rep.title}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {rep.type}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {formatDate(rep.date)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-100)' }}>
                        {rep.format}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleExportReport(rep.title, rep.format)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Download size={14} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
