// iHYPE analytics stub — logs to console + localStorage; swap for real provider at launch

const MAX_EVENTS = 200;
const STORAGE_KEY = 'ihype_events';

export function track(event: string, props?: Record<string, any>) {
  try {
    const plat = typeof window !== 'undefined' ? localStorage.getItem('ihype_platform') || 'unknown' : 'ssr';
    const entry = { event, props: props || {}, ts: Date.now(), plat };
    if (typeof window !== 'undefined') {
      const log = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      log.push(entry);
      if (log.length > MAX_EVENTS) log.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('[track]', event, props || '');
    }
  } catch { /* silent */ }
}

export function getEvents(): any[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
