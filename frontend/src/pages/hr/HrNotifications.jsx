import React, { useState, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { notificationService } from '../../services/notificationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { Bell, Send, CheckCheck, Megaphone, Plus } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const HrNotifications = () => {
  const { addToast } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    target: 'ALL',
  });
  const [sending, setSending] = useState(false);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleBroadcast = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      const newNotif = {
        id: Date.now(),
        title: broadcastData.title,
        message: broadcastData.message,
        created_at: new Date().toISOString(),
        is_read: false,
        type: 'general',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setIsBroadcastModalOpen(false);
      setBroadcastData({ title: '', message: '', target: 'ALL' });
      setSending(false);
      addToast('Announcement broadcasted to all employees!', 'success');
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '950px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>HR Corporate Communications & Alerts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Broadcast company-wide alerts, policy memos, and management notifications
          </p>
        </div>

        <button
          onClick={() => setIsBroadcastModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <Megaphone size={16} /> Broadcast Announcement
        </button>
      </div>

      {/* Notifications List */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          Active Corporate Announcements & Feeds
        </h3>

        {loading ? (
          <LoadingSpinner message="Loading communications feed..." />
        ) : notifications.length === 0 ? (
          <EmptyState title="No active announcements" description="Broadcast an alert to notify staff." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {n.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: 'block' }}>
                      Broadcasted {formatDate(n.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Announcement to Employees"
      >
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Announcement Subject
            </label>
            <input
              type="text"
              required
              value={broadcastData.title}
              onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
              placeholder="e.g. Q3 Performance Review Timeline"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Target Audience
            </label>
            <select
              value={broadcastData.target}
              onChange={(e) => setBroadcastData({ ...broadcastData, target: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="ALL">All Departments (Entire Company)</option>
              <option value="ENGINEERING">Software Engineering Only</option>
              <option value="SALES">Sales & Marketing Only</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Notification Message Content
            </label>
            <textarea
              rows={4}
              required
              value={broadcastData.message}
              onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
              placeholder="Write the details of the announcement here..."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={sending} className="btn btn-primary">
              {sending ? 'Broadcasting...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HrNotifications;
