// Emits data points to Cloudflare Analytics Engine.
// Binding: AE (AnalyticsEngineDataset) from getCloudflareContext()
// Falls back silently if binding not available (local dev).

type AEDataset = {
  writeDataPoint(data: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
};

async function getAEDataset(): Promise<AEDataset | undefined> {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare');
  return (getCloudflareContext().env as Record<string, unknown>).AE as AEDataset | undefined;
}

// Client-side: queues locally, then best-effort forwards to
// /api/analytics/track so the event actually reaches Analytics Engine
// (see trackEvent below) instead of only ever living in localStorage.
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const key = 'ihype_events';
    const stored = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
    stored.push({ event, props, ts: Date.now() });
    if (stored.length > 200) stored.splice(0, stored.length - 200);
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    // best-effort
  }
  try {
    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, props }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // best-effort — e.g. fetch unavailable in some embedded contexts
  }
}

// Server-side: records one named product event (Seeds swipe, checkout,
// referral click, etc.) with its props JSON-encoded into a blob.
export function trackEvent(event: string, props?: Record<string, unknown>): void {
  try {
    void (async () => {
      const ae = await getAEDataset();
      if (!ae) return;
      const propsJson = props ? JSON.stringify(props).slice(0, 4000) : '';
      ae.writeDataPoint({
        blobs: [event, propsJson],
        indexes: [event],
      });
    })();
  } catch {
    // Never throw — analytics is best-effort
  }
}

export function trackRequest(
  pathname: string,
  status: number,
  durationMs: number
): void {
  try {
    void (async () => {
      const ae = await getAEDataset();
      if (!ae) return;
      ae.writeDataPoint({
        blobs: [pathname],
        doubles: [status, durationMs],
        indexes: [pathname],
      });
    })();
  } catch {
    // Never throw — analytics is best-effort
  }
}
