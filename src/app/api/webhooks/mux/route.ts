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
    type: string;
    data: { playback_ids?: Array<{ id: string }> };
  };

  const playbackId = event.data.playback_ids?.[0]?.id;

  if (playbackId) {
    const status = event.type.includes('active') ? 'LIVE' : event.type.includes('idle') ? 'ENDED' : undefined;
    if (status) {
      await db.show.updateMany({
        where: { streamPlaybackId: playbackId },
        data: { status }
      });
    }
  }

  return NextResponse.json({ ok: true });
}
