'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch('/api/notifications?all=1')
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAllRead() {
    if (marking || unreadCount === 0) return;
    setMarking(true);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch('/api/notifications', { method: 'POST' }).catch(() => null);
    setMarking(false);
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 100px' }}>

      <div style={{ marginBottom: 32 }}>
        <Link href="/home" style={{ fontSize: 12, color: 'rgba(240,235,229,.4)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '.06em' }}>
          ← HOME
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-.03em', margin: 0 }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{
                padding: '3px 10px', background: 'var(--accent, #ff5029)',
                borderRadius: 9999, fontSize: 11, fontFamily: 'var(--font-mono)',
                letterSpacing: '.06em', color: '#fff',
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8,
                padding: '7px 14px', cursor: 'pointer', color: 'rgba(240,235,229,.55)',
                fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '.04em',
                transition: 'border-color 150ms, color 150ms',
              }}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(240,235,229,.3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading…</p>
      ) : notifications.length === 0 ? (
        <div className="ihype-empty-state">
          <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <h3>All clear</h3>
          <p>You&apos;ll get notified about new shows, milestones, and journal posts.</p>
          <Link href="/discover" className="ihype-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Discover artists →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notifications.map(n => {
            const date = new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            const inner = (
              <div
                style={{
                  padding: '16px 18px',
                  background: n.read ? 'var(--bg-2, #100d09)' : 'rgba(255,80,41,.06)',
                  borderLeft: `3px solid ${n.read ? 'transparent' : 'var(--accent, #ff5029)'}`,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,.06)',
                  borderLeftWidth: 3,
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  transition: 'background 300ms',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{n.body}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(240,235,229,.35)', fontFamily: 'var(--font-mono)' }}>{date}</p>
                </div>
                {!n.read && (
                  <div style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--accent)', flexShrink: 0, marginTop: 5 }} />
                )}
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link} style={{ textDecoration: 'none' }}>{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <Link href="/settings" className="ihype-btn-ghost">Notification settings →</Link>
      </div>
    </div>
  );
}
