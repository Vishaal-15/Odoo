import React, { useState, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { notificationService } from '../../services/notificationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Bell, CheckCheck, Check, Calendar, DollarSign, Info, Sparkles } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const EmployeeNotifications = () => {
  const { addToast } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const loadNotifications = async () => {
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
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    addToast('Marked notification as read', 'info');
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    addToast('All notifications marked as read', 'success');
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'leave':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'payroll':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Notifications & Alerts"
        subtitle="System alerts, time-off approval outcomes, and compensation notices"
        breadcrumbs={['Workspace', 'Notifications']}
        actions={
          unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="secondary" size="sm" icon={CheckCheck}>
              Mark All as Read ({unreadCount})
            </Button>
          )
        }
      />

      {/* Main Notification Card */}
      <Card
        title="Inbox"
        subtitle="Chronological stream of in-app notices"
        action={
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'ALL' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'UNREAD' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        }
      >
        {loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : filteredNotifs.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description={filter === 'UNREAD' ? 'No unread notifications.' : 'You have no notices at this time.'}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  n.is_read
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-300'
                    : 'bg-brand-500/10 border-brand-500/30 text-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0 ring-2 ring-slate-900" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-500 font-mono">{formatDate(n.created_at)}</div>
                  </div>
                </div>

                {!n.is_read && (
                  <Button
                    onClick={() => handleMarkAsRead(n.id)}
                    variant="ghost"
                    size="xs"
                    icon={Check}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeNotifications;
