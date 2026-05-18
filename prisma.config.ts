import 'dotenv/config'
import { defineConfig } from 'prisma/config'

if (!process.env.DATABASE_URL) {
  const candidate = process.env.DATABASE_URL_POSTGRES_PRISMA_URL ?? ''
  if (candidate.startsWith('postgresql://') || candidate.startsWith('postgres://')) {
    process.env.DATABASE_URL = candidate
  } else {
    // Candidate is absent or a prisma:// Accelerate URL — use a placeholder so
    // prisma generate can validate the schema without a live database.
    // The app will fail at runtime until a real DATABASE_URL is configured.
    process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
})
