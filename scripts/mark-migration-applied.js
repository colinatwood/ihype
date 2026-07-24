#!/usr/bin/env node
// Break-glass tool: upsert a migration's _prisma_migrations record so
// `migrate deploy` sees it as already applied — for the case where a
// migration's SQL genuinely ran against the DB (e.g. applied by hand, or a
// deploy that crashed after the DDL but before Prisma recorded it) but its
// row is missing or marked rolled-back, blocking every later migration.
// Prisma may use migration_sql from _prisma_migrations rather than the file
// on disk when re-applying a rolled-back migration, so we update that
// column too.
//
// Originally hardcoded to one specific incident
// (20260507000001_radio_track_block_label) — generalized so it can't be
// mistaken for a general tool while silently only affecting that one old
// migration. Verify the migration's SQL actually ran before using this;
// it does not run any SQL itself, only edits Prisma's bookkeeping.
//
// Usage: DIRECT_URL=... node scripts/mark-migration-applied.js <migration_name>
const { Client } = require('pg');
const { createHash } = require('crypto');
const { readFileSync } = require('fs');
const path = require('path');

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error('DIRECT_URL env var not set');

  const migrationName = process.argv[2];
  if (!migrationName) {
    throw new Error('Usage: node scripts/mark-migration-applied.js <migration_name>');
  }
  const migrationFile = path.join(
    process.cwd(),
    'prisma/migrations',
    migrationName,
    'migration.sql'
  );
  const migrationSql = readFileSync(migrationFile, 'utf8');
  const checksum = createHash('sha256').update(migrationSql).digest('hex');

  console.log('Migration file content:', JSON.stringify(migrationSql));
  console.log('Checksum:', checksum);

  const client = new Client({ connectionString: url });
  await client.connect();
  console.log('Connected');

  const existing = await client.query(
    `SELECT id, migration_name, finished_at, rolled_back_at, applied_steps_count,
            left(migration_sql, 120) AS sql_preview
     FROM _prisma_migrations
     WHERE migration_name = $1`,
    [migrationName]
  );
  console.log('Existing records:', JSON.stringify(existing.rows, null, 2));

  if (existing.rows.length > 0) {
    const updated = await client.query(
      `UPDATE _prisma_migrations
       SET migration_sql      = $1,
           checksum           = $2,
           finished_at        = COALESCE(finished_at, NOW()),
           applied_steps_count = 1,
           rolled_back_at     = NULL,
           logs               = NULL
       WHERE migration_name = $3
       RETURNING id, finished_at, applied_steps_count`,
      [migrationSql, checksum, migrationName]
    );
    console.log('Updated:', JSON.stringify(updated.rows, null, 2));
  } else {
    const inserted = await client.query(
      `INSERT INTO _prisma_migrations
         (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count, migration_sql)
       VALUES (gen_random_uuid()::text, $1, NOW(), $2, NULL, NULL, NOW(), 1, $3)
       RETURNING id`,
      [checksum, migrationName, migrationSql]
    );
    console.log('Inserted:', JSON.stringify(inserted.rows, null, 2));
  }

  await client.end();
  console.log('Done');
}

main().catch(err => {
  console.error('mark-migration-applied failed:', err.message);
  process.exit(1);
});
