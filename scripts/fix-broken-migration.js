#!/usr/bin/env node
// One-shot script: delete the failed _prisma_migrations record so migrate deploy
// can apply the corrected migration file from scratch.
const { Client } = require('pg');

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error('DIRECT_URL env var not set');

  const client = new Client({ connectionString: url });
  await client.connect();

  const result = await client.query(
    "DELETE FROM _prisma_migrations WHERE migration_name = '20260507000001_radio_track_block_label'"
  );
  console.log(`Deleted ${result.rowCount} row(s) from _prisma_migrations`);

  await client.end();
}

main().catch(err => {
  console.error('fix-broken-migration failed:', err.message);
  process.exit(1);
});
