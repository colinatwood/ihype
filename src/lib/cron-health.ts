import { kvGet, kvPut } from '@/lib/kv';

const CRON_JOB_NAMES = [
  'cleanup-expired-sessions',
  'send-scheduled-emails',
  'sync-ticket-metadata',
];

export async function pingCronAlive(jobName: string): Promise<void> {
  await kvPut('cron-alive:' + jobName, Date.now(), { ex: 48 * 60 * 60 });
}

export async function checkCronHealth(): Promise<{ stale: string[] }> {
  const stale: string[] = [];

  for (const job of CRON_JOB_NAMES) {
    const lastPing = await kvGet<number>('cron-alive:' + job);
    if (lastPing === null) {
      stale.push(job);
    }
  }

  return { stale };
}

type D1Database = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
};

async function getD1(): Promise<D1Database | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const d1 = (getCloudflareContext().env as Record<string, unknown>).D1 as D1Database | null;
    return d1 ?? null;
  } catch {
    return null;
  }
}

export async function logCronRun(
  job: string,
  durationMs: number,
  status: 'ok' | 'error',
  error?: string
): Promise<void> {
  const d1 = await getD1();
  if (!d1) {
    console.info('[cron-health] D1 not available, skipping logCronRun', { job, status });
    return;
  }

  try {
    await d1
      .prepare(
        'INSERT INTO cron_runs (job, ran_at, duration_ms, status, error) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(job, Date.now(), durationMs, status, error ?? null)
      .run();
  } catch (err) {
    console.error('[cron-health] Failed to log cron run to D1', err);
  }
}

type CronRunRow = {
  ran_at: number;
  duration_ms: number | null;
  status: string;
  error: string | null;
};

export async function getCronRunHistory(
  job: string,
  limit = 50
): Promise<CronRunRow[]> {
  const d1 = await getD1();
  if (!d1) {
    console.info('[cron-health] D1 not available, returning empty history', { job });
    return [];
  }

  try {
    const result = await d1
      .prepare(
        'SELECT ran_at, duration_ms, status, error FROM cron_runs WHERE job = ? ORDER BY ran_at DESC LIMIT ?'
      )
      .bind(job, limit)
      .all<CronRunRow>();
    return result.results;
  } catch (err) {
    console.error('[cron-health] Failed to query cron run history from D1', err);
    return [];
  }
}
