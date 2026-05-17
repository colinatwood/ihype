'use client';

import { useEffect, useState } from 'react';

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  async function subscribe() {
    setBusy(true);
    setMsg('');
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setMsg('Notification permission was denied.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setMsg('Push notifications not configured.');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      const subJson = sub.toJSON() as { endpoint: string; keys: { auth: string; p256dh: string } };
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subJson)
      });

      if (res.ok) {
        setSubscribed(true);
        setMsg('Push notifications enabled.');
      } else {
        setMsg('Could not save subscription.');
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Subscription failed.');
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setMsg('');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint })
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMsg('Push notifications disabled.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not unsubscribe.');
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Push notifications</h3>
      <p style={{ fontFamily: 'var(--f-m)', fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>
        Get notified about shows, hype milestones, and more — directly in your browser.
      </p>
      {subscribed || permission === 'granted' ? (
        <button className="button secondary" onClick={unsubscribe} disabled={busy} type="button">
          {busy ? 'Disabling...' : 'Disable push notifications'}
        </button>
      ) : (
        <button className="button" onClick={subscribe} disabled={busy || permission === 'denied'} type="button">
          {busy ? 'Enabling...' : 'Enable push notifications'}
        </button>
      )}
      {permission === 'denied' && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>Notifications are blocked in your browser settings.</p>}
      {msg ? <p style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6 }}>{msg}</p> : null}
    </div>
  );
}
