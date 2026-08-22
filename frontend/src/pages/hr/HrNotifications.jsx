import React, { useState, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { notificationService } from '../../services/notificationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Bell, Megaphone, Send, CheckCircle2, Info, Calendar, DollarSign } from 'lucide-react';
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
      addToast('Announcement broadcasted to staff members!', 'success');
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Corporate Communications & Broadcasts"
        subtitle="Broadcast company-wide announcements, policy updates, and executive memos"
        breadcrumbs={['HR Operations', 'Corporate Comms']}
        actions={
          <Button
            onClick={() => setIsBroadcastModalOpen(true)}
            variant="primary"
            size="sm"
            icon={Megaphone}
          >
            Broadcast Announcement
          </Button>
        }
      />

      {/* Announcements List */}
      <Card
        title={`Active Organization Broadcasts (${notifications.length})`}
        subtitle="Chronological feed of notices delivered to employees"
      >
        {loading ? (
          <LoadingSpinner message="Loading communications feed..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No active announcements"
            description="Broadcast a new company announcement to keep staff informed."
            actionLabel="Broadcast Announcement"
            onAction={() => setIsBroadcastModalOpen(true)}
            actionIcon={Megaphone}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {n.title}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-500 font-mono">{formatDate(n.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Company Announcement"
        subtitle="Deliver an instant notice to staff members"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <Input
            label="Announcement Title"
            required
            value={broadcastData.title}
            onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
            placeholder="e.g., Annual Company Holiday Schedule"
          />

          <Select
            label="Target Audience"
            value={broadcastData.target}
            onChange={(e) => setBroadcastData({ ...broadcastData, target: e.target.value })}
          >
            <option value="ALL">All Employees (Company-Wide)</option>
            <option value="ENGINEERING">Engineering Department</option>
            <option value="PRODUCT">Product & Design</option>
            <option value="MANAGERS">Managers & Team Leads</option>
          </Select>

          <Textarea
            label="Message Content"
            required
            rows={4}
            value={broadcastData.message}
            onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
            placeholder="Compose announcement body..."
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsBroadcastModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={sending} icon={Send}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HrNotifications;
