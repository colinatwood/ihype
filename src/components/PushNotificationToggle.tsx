'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setSupported(true);
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(Boolean(sub)))
      .catch(() => {});
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notifications permission was not granted.');
        return;
      }
      const keyRes = await fetch('/api/push/vapid-key');
      const { key } = await keyRes.json();
      if (!key) {
        setError('Push notifications are not configured yet.');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      const json = sub.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (!res.ok) {
        setError('Could not save your subscription.');
        return;
      }
      setEnabled(true);
    } catch {
      setError('Could not enable push notifications.');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
    } catch {
      setError('Could not disable push notifications.');
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">Push notifications</div>
        <div className="settings-row-detail">
          {error ?? 'Get notified on this device, even when iHYPE isn’t open'}
        </div>
      </div>
      <label className="settings-toggle">
        <input checked={enabled} disabled={busy} onChange={(e) => (e.target.checked ? enable() : disable())} type="checkbox" />
        <div className="settings-toggle-track" />
        <div className="settings-toggle-thumb" />
      </label>
    </div>
  );
}
