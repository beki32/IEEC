import { useState } from 'react';
import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function NotificationsPage() {
  const { refresh } = useSession();
  const [tick, setTick] = useState(0);
  void tick;
  const notifications = demoStore.listMyNotifications(true);

  function bump() {
    refresh();
    setTick((t) => t + 1);
  }

  return (
    <div className="grid">
      <section className="hero">
        <p className="badge">In-app inbox</p>
        <h1>Notifications</h1>
        <p className="muted">
          Chat, calendar, assignments, and queue alerts. Push/email can fan out later (Chapter 11).
        </p>
      </section>

      <div className="row">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            demoStore.markAllNotificationsRead();
            bump();
          }}
        >
          Mark all read
        </button>
        <Link className="btn secondary" to="/app">Team home</Link>
      </div>

      <div className="panel">
        {notifications.length === 0 ? <p className="muted">No notifications</p> : null}
        <ul className="list">
          {notifications.map((n) => (
            <li key={n.id} className={`notif-item ${n.status === 'read' ? 'read' : 'unread'}`}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="row">
                    <strong>{n.title}</strong>
                    {n.status !== 'read' ? <span className="badge ok">new</span> : null}
                    <span className="badge">{n.type}</span>
                  </div>
                  <p className="muted" style={{ margin: '0.35rem 0' }}>{n.body}</p>
                  <div className="muted">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="row">
                  {n.linkPath ? (
                    <Link
                      className="btn secondary"
                      to={n.linkPath}
                      onClick={() => {
                        try {
                          demoStore.markNotificationRead(n.id);
                          bump();
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      Open
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        demoStore.markNotificationRead(n.id);
                        bump();
                      }}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => {
                      demoStore.dismissNotification(n.id);
                      bump();
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
