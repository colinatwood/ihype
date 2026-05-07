import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyMuxWebhook } from '@/lib/mux';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('mux-signature');

  if (!verifyMuxWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    id?: string;
    type: string;
    data: { playback_ids?: Array<{ id: string }> };
  };

  // Mux retries failed deliveries. Use the event ID as a unique key so
  // duplicate deliveries are silently dropped instead of double-processed.
  if (event.id) {
    try {
      await db.processedWebhookEvent.create({
        data: { source: 'mux', eventId: event.id }
      });
    } catch {
      // Unique constraint violation → already processed. Return 200 so Mux
      // stops retrying but do nothing further.
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const playbackId = event.data.playback_ids?.[0]?.id;

  if (playbackId) {
    const status = event.type.includes('active')
      ? 'LIVE'
      : event.type.includes('idle')
        ? 'ENDED'
        : undefined;

    if (status) {
      await db.show.updateMany({
        where: { streamPlaybackId: playbackId },
        data: { status }
      });
    }
  }

  return NextResponse.json({ ok: true });
}
