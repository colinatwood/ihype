import 'dotenv/config'
import { defineConfig } from 'prisma/config'

if (!process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL_POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_POSTGRES_PRISMA_URL
  } else {
    // Provide a dummy URL so prisma generate can run in build environments
    // without a live database. The app will fail at runtime, not at build time.
    process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
})
