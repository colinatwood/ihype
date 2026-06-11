# Deployment reference

## Hosting

Deployed to **Cloudflare Workers** via OpenNext. CI pipeline:
`.github/workflows/deploy-production.yml` → `wrangler deploy`.

There is no Vercel deployment. Ignore any legacy references to Vercel in old
comments or stale docs.

## Database

- **Production DB:** Supabase (Postgres 17, us-east-1). The old Neon database
  is deprecated and pending decommission.
- **GitHub Actions secrets** `DATABASE_URL` and `DIRECT_URL` both hold the
  Supabase **session pooler** connection string
  (`aws-1-us-east-1.pooler.supabase.com:5432`, username `postgres.<ref>`).
  The direct host is IPv6-only and Actions runners lack IPv6, so the pooler
  string is used for both vars.
- **schema.prisma** declares `env("DIRECT_DATABASE_URL")` for the migration
  URL. The deploy workflow maps the secret into that variable:
  ```yaml
  DIRECT_DATABASE_URL: ${{ secrets.DIRECT_URL }}
  ```
- **Runtime (Workers):** `src/lib/db.ts` prefers the `HYPERDRIVE` Cloudflare
  Hyperdrive binding and falls back to `DATABASE_URL` outside Workers.

## Migrations

Migrations run in the deploy workflow **before** the build step, not inside any
npm build script. The workflow runs `prisma migrate deploy` with a retry loop
and **fails closed** — a migration error blocks the deploy entirely. Never
reintroduce status-grep or any fail-open migration pattern.

The database was baselined on 2026-06-10; `_prisma_migrations` now tracks all
migrations and `prisma migrate deploy` is always safe to run.

## Environment variables (required for deploy)

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | wrangler deploy auth |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account target |
| `DATABASE_URL` | Supabase session pooler (runtime + migration) |
| `DIRECT_URL` | Supabase session pooler — mapped to `DIRECT_DATABASE_URL` for Prisma migrations |
| `AUTH_SECRET` | NextAuth session signing key |
| `CLOUDFLARE_ZONE_ID` | Cache purge after deploy |
| `CLOUDFLARE_CACHE_PURGE_TOKEN` | Cache purge API token |
| `SMOKE_BYPASS_TOKEN` | Post-deploy smoke check auth |

## Deploy steps (automated)

1. `npm ci`
2. `npx prisma generate`
3. `npx tsc --noEmit`
4. `npm run guard:design`
5. `npm test`
6. `prisma migrate deploy` (with retry; fails closed)
7. `npm run cf:build` (OpenNext Cloudflare bundle)
8. `wrangler deploy worker.js`
9. `wrangler deploy --config wrangler.cron.toml` (cron Worker)
10. Post-deploy smoke checks against `https://ihype.org`
11. Cloudflare cache purge

## Local setup

```bash
cp .env.example .env   # fill in values
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Cloudflare resources

- KV: Workers KV for rate-limiter fallback (local dev)
- Durable Objects: `RateLimiterDO` (binding `RATE_LIMITER_DO`) in `worker.js`
- Hyperdrive: binding `HYPERDRIVE` for pooled DB access at runtime
- Cache purge: Cloudflare Cache API with `CLOUDFLARE_ZONE_ID`
- Cron jobs: `wrangler.cron.toml`
