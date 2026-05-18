import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';
import { readClientAddress } from '@/lib/request-meta';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = readClientAddress(request);
  const rl = await consumeRateLimit(`ad-impression:${ip ?? 'unknown'}`, { limit: 50, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const { id } = await params;
  try {
    await db.adSubmission.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
