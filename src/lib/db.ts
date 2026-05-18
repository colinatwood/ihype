import { Prisma, PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const RUNTIME_POSTGRES_URL_CANDIDATES = [
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL_POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'DATABASE_URL_POSTGRES_URL',
  'DIRECT_DATABASE_URL',
  'DATABASE_DIRECT_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL_NO_SSL',
  'DATABASE_URL_POSTGRES_URL_NO_SSL'
] as const;

function isPostgresUrl(url: string | undefined) {
  return Boolean(url?.startsWith('postgresql://') || url?.startsWith('postgres://'));
}

function normalizeRuntimeDatabaseUrl() {
  if (isPostgresUrl(process.env.DATABASE_URL)) {
    return;
  }

  for (const key of RUNTIME_POSTGRES_URL_CANDIDATES) {
    const value = process.env[key]?.trim();
    if (isPostgresUrl(value)) {
      process.env.DATABASE_URL = value;
      return;
    }
  }
}

function makePrisma() {
  normalizeRuntimeDatabaseUrl();
  return new PrismaClient().$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof makePrisma> };

export const db = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

function isRetryablePrismaError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P5010' || error.message.includes('fetch failed'))
  );
}

export async function withDbRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryablePrismaError(error) || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 150));
    }
  }

  throw lastError;
}
