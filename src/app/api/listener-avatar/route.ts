import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const schema = z.object({
  profileId: z.string().cuid(),
  prompt: z.string().trim().min(12).max(600)
});

function buildAvatarPrompt({
  name,
  city,
  country,
  genres,
  topFiveContent,
  userPrompt
}: {
  name: string;
  city: string | null;
  country: string | null;
  genres: string[];
  topFiveContent: string | null;
  userPrompt: string;
}) {
  const location = [city, country].filter(Boolean).join(', ');
  const genreLine = genres.length ? `Music taste cues: ${genres.join(', ')}.` : '';
  const locationLine = location ? `Location inspiration: ${location}.` : '';
  const topFiveLine = topFiveContent ? `Top five notes: ${topFiveContent.slice(0, 220)}.` : '';

  return [
    `Create an original cartoon avatar portrait for the music listener profile "${name}".`,
    'Head-and-shoulders composition, centered character, expressive face, polished illustrated finish.',
    'Stylized nightlife energy, music-discovery personality, bold color story, clean silhouette, no text, no watermark, no logos.',
    'Avoid matching any copyrighted character or celebrity likeness.',
    genreLine,
    locationLine,
    topFiveLine,
    `User direction: ${userPrompt}`
  ]
    .filter(Boolean)
    .join(' ');
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  if (!env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Avatar generation is not configured yet. Add OPENAI_API_KEY first.' },
      { status: 503 }
    );
  }

  try {
    const body = schema.parse(await request.json());

    const profile = await db.profile.findUnique({
      where: { id: body.profileId },
      select: {
        id: true,
        ownerId: true,
        type: true,
        name: true,
        city: true,
        country: true,
        genres: true,
        topFiveContent: true
      }
    });

    if (!profile || profile.type !== 'LISTENER') {
      return NextResponse.json({ error: 'Listener page not found' }, { status: 404 });
    }

    if (profile.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the listener who owns this page can generate an avatar' }, { status: 403 });
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: buildAvatarPrompt({
        name: profile.name,
        city: profile.city,
        country: profile.country,
        genres: profile.genres,
        topFiveContent: profile.topFiveContent,
        userPrompt: body.prompt
      }),
      size: '1024x1024',
      quality: 'medium',
      background: 'transparent',
      output_format: 'png',
      user: session.user.id
    });

    const image = result.data?.[0];
    if (!image?.b64_json) {
      return NextResponse.json({ error: 'The avatar service returned an empty image' }, { status: 502 });
    }

    const avatarImage = `data:image/png;base64,${image.b64_json}`;

    await db.profile.update({
      where: { id: profile.id },
      data: { avatarImage }
    });

    return NextResponse.json({
      avatarImage,
      revisedPrompt: image.revised_prompt ?? null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Could not generate avatar right now' }, { status: 500 });
  }
}
