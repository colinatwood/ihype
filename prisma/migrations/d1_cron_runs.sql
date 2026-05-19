CREATE TABLE IF NOT EXISTS cron_runs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  job       TEXT NOT NULL,
  ran_at    INTEGER NOT NULL,  -- unix ms
  duration_ms INTEGER,
  status    TEXT NOT NULL DEFAULT 'ok',  -- 'ok' | 'error'
  error     TEXT
);
CREATE INDEX IF NOT EXISTS idx_cron_runs_job_ran_at ON cron_runs(job, ran_at DESC);
