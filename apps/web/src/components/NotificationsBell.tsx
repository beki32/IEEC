import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useChatDock } from '../lib/chatDock';
import { useSession } from '../lib/session';

export function NotificationsBell({ startOpen = false }: { startOpen?: boolean } = {}) {
  const { refresh, unreadCount } = useSession();
  const { openChat } = useChatDock();
  const navigate = useNavigate();
  const [open, setOpen] = useState(startOpen);
  const [tick, setTick] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  void tick;

  const notifications = demoStore.listMyNotifications(true);

  function bump() {
    refresh();
    setTick((t) => t + 1);
  }

  useEffect(() => {
    function openFromRoute() {
      if (sessionStorage.getItem('ieec-open-notifications') === '1') {
        sessionStorage.removeItem('ieec-open-notifications');
        setOpen(true);
      }
    }
    openFromRoute();
    window.addEventListener('ieec-open-notifications', openFromRoute);
    return () => window.removeEventListener('ieec-open-notifications', openFromRoute);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function openNotification(id: string, linkPath: string | null) {
    try {
      demoStore.markNotificationRead(id);
      bump();
    } catch {
      // ignore
    }
    setOpen(false);
    if (!linkPath) return;
    if (linkPath === '/app/chat' || linkPath.startsWith('/app/chat')) {
      openChat();
      return;
    }
    navigate(linkPath);
  }

  return (
    <div className="notif-popover-root" ref={rootRef}>
      <button
        type="button"
        className={`cms-icon-btn ${open ? 'active' : ''}`}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
        </svg>
        {unreadCount > 0 ? <span className="cms-icon-badge">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="notif-popover" role="dialog" aria-label="Notifications">
          <div className="notif-popover-header">
            <strong>Notifications</strong>
            <button
              type="button"
              className="linkish"
              onClick={() => {
                demoStore.markAllNotificationsRead();
                bump();
              }}
            >
              Mark all read
            </button>
          </div>

          <div className="notif-popover-list">
            {notifications.length === 0 ? (
              <p className="muted notif-empty">No notifications yet</p>
            ) : null}
            {notifications.map((n) => (
              <article key={n.id} className={`notif-popover-item ${n.status === 'read' ? 'read' : 'unread'}`}>
                <button
                  type="button"
                  className="notif-popover-main"
                  onClick={() => openNotification(n.id, n.linkPath)}
                >
                  <div className="notif-popover-title-row">
                    <strong>{n.title}</strong>
                    {n.status !== 'read' ? <span className="badge ok">new</span> : null}
                  </div>
                  <p>{n.body}</p>
                  <span className="muted">{new Date(n.createdAt).toLocaleString()}</span>
                </button>
                <button
                  type="button"
                  className="linkish notif-dismiss"
                  onClick={() => {
                    demoStore.dismissNotification(n.id);
                    bump();
                  }}
                >
                  Dismiss
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
