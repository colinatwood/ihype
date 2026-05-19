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
