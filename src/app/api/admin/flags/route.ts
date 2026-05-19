import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/permissions';
import { kvPut } from '@/lib/kv';

/**
 * POST /api/admin/flags
 *
 * Sets a runtime feature flag in KV storage.
 * Body: { key: string; value: string }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.key !== 'string' || typeof body.value !== 'string') {
    return NextResponse.json({ error: 'Invalid request body. Expected { key, value }.' }, { status: 400 });
  }

  const { key, value } = body as { key: string; value: string };

  await kvPut('flags:' + key, value);
  const storedInKv = true;

  return NextResponse.json({ ok: true, key, value, storedInKv });
}
