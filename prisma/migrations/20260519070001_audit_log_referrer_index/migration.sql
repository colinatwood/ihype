-- Expression index for fast referral count queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "AuditLog_referrer_idx"
  ON "AuditLog" ((metadata->>'referrer'))
  WHERE action = 'REFERRAL_SIGNUP';
