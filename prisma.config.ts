import 'dotenv/config'
import { defineConfig } from 'prisma/config'

function isPostgresUrl(url: string) {
  return url.startsWith('postgresql://') || url.startsWith('postgres://')
}

// Normalise DATABASE_URL to a postgresql:// URL so Prisma schema validation passes.
// Vercel's Neon integration may set DATABASE_URL or DATABASE_URL_POSTGRES_PRISMA_URL
// to a prisma:// Accelerate URL, which the postgresql provider rejects at validate time.
const rawUrl = process.env.DATABASE_URL ?? process.env.DATABASE_URL_POSTGRES_PRISMA_URL ?? ''
if (isPostgresUrl(rawUrl)) {
  process.env.DATABASE_URL = rawUrl
} else {
  // No usable postgres URL found — set a placeholder so prisma generate can run.
  // The app will fail at runtime until DATABASE_URL is configured with a real database.
  process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
})
