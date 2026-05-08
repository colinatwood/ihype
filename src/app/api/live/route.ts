import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getMuxClient } from '@/lib/mux';
import { canManageOwnedResource } from '@/lib/permissions';
import { areLiveStreamsEnabled } from '@/lib/runtime-flags';

const schema = z.object({ showId: z.string().cuid() });

export async function POST(request: Request) {
  if (!areLiveStreamsEnabled()) {
    return NextResponse.json(
      {
        error:
          'Live streaming is disabled. iHYPE promoter shows are currently built as prerecorded radio-style shows.'
      },
      { status: 410 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const { showId } = schema.parse(await request.json());
    const show = await db.show.findUnique({ where: { id: showId } });

    if (!show || !canManageOwnedResource(session, show.creatorId)) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    const mux = getMuxClient();
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
      reduced_latency: true
    });

    const updated = await db.show.update({
      where: { id: showId },
      data: {
        streamProvider: 'Mux',
        streamPlaybackId: liveStream.playback_ids?.[0]?.id ?? null,
        streamKeyMasked: liveStream.stream_key ? `****${liveStream.stream_key.slice(-4)}` : null
      }
    });

    return NextResponse.json({
      showId: updated.id,
      playbackId: updated.streamPlaybackId,
      streamKey: liveStream.stream_key
    });
  } catch (error) {
    return NextResponse.json({ error: 'Could not create live stream' }, { status: 400 });
  }
}
