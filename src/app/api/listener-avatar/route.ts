import { createHash } from 'node:crypto';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { canManageOwnedResource } from '@/lib/permissions';

const generateSchema = z.object({
  profileId: z.string().cuid(),
  prompt: z.string().trim().min(3, 'Write a short phrase for your character first.').max(600),
  variantCount: z.number().int().min(1).max(4).optional().default(4)
});

const saveSchema = z.object({
  action: z.literal('save'),
  profileId: z.string().cuid(),
  profileHexId: z.string().regex(/^0x[a-f0-9]+$/i, 'A valid fan hex ID is required.'),
  avatarImage: z.string().startsWith('data:image/').max(8_000_000)
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
    `Create an original simple cartoon avatar portrait for the music fan profile "${name}".`,
    'Turn the fan phrase into one animated original character only, head-and-shoulders composition, centered character, clean silhouette, playful expression.',
    'Simple animated illustration finish, nightlife energy, music-discovery personality, bold but limited color palette, no text, no watermark, no logos.',
    'Avoid matching any copyrighted character or celebrity likeness.',
    genreLine,
    locationLine,
    topFiveLine,
    `Fan phrase: ${userPrompt}`
  ]
    .filter(Boolean)
    .join(' ');
}

const avatarHairChoices = [
  'soft curls',
  'short blunt bob',
  'shaved sides with a bright top',
  'messy wave cut',
  'braided crown',
  'rounded afro silhouette'
];

const avatarAccessoryChoices = [
  'chunky headphones',
  'star earrings',
  'small tinted glasses',
  'a subtle nose ring',
  'a simple chain necklace',
  'no accessory'
];

const avatarPaletteChoices = [
  'neon coral and cyan',
  'electric blue and cream',
  'lime and midnight',
  'peach and indigo',
  'silver and hot pink',
  'sunset orange and teal'
];

const avatarMoodChoices = [
  'curious smile',
  'laid-back grin',
  'daydreaming look',
  'confident stage-ready stare',
  'soft friendly expression',
  'excited music-fan energy'
];

const avatarOutfitChoices = [
  'oversized hoodie',
  'bomber jacket',
  'graphic tee',
  'cropped windbreaker',
  'minimal clubwear top',
  'vintage denim jacket'
];

const avatarBackdropChoices = [
  'flat pastel background',
  'simple abstract club lights',
  'minimal gradient halo',
  'clean circle backdrop',
  'tiny music-wave accents',
  'subtle starburst backdrop'
];

function pickRandom<T>(values: readonly T[]) {
  return values[Math.floor(Math.random() * values.length)];
}

function pickDeterministic<T>(values: readonly T[], seed: string, salt: string) {
  const digest = createHash('sha256').update(`${seed}:${salt}`).digest();
  return values[digest[0] % values.length];
}

function encodeSvgAsDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const fallbackSkinTones = ['#f7d7c4', '#f0c1a6', '#d89a73', '#9f6a47', '#6f4633'] as const;
const fallbackHairTones = ['#10121b', '#3d2b1f', '#6e4730', '#cab08b', '#6f4cff', '#1fd4c7'] as const;
const fallbackBackdropTones = ['#0f1728', '#1b2440', '#281947', '#102a34', '#2b1631'] as const;
const fallbackAccentTones = ['#23d0d8', '#ff6ea8', '#ffe066', '#8f5bff', '#7cf29c'] as const;

function buildFallbackAvatarDataUrl({
  seed,
  label,
  phrase
}: {
  seed: string;
  label: string;
  phrase: string;
}) {
  const skin = pickDeterministic(fallbackSkinTones, seed, 'skin');
  const hair = pickDeterministic(fallbackHairTones, seed, 'hair');
  const backdrop = pickDeterministic(fallbackBackdropTones, seed, 'backdrop');
  const accent = pickDeterministic(fallbackAccentTones, seed, 'accent');
  const eyeOffset = 18 + (createHash('sha256').update(`${seed}:eyes`).digest()[0] % 6);
  const mouthWidth = 30 + (createHash('sha256').update(`${seed}:mouth`).digest()[0] % 12);
  const hoodieTone = pickDeterministic(['#f4f6ff', '#d7e7ff', '#f2d7ff', '#d8fff0'], seed, 'hoodie');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${backdrop}" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="44" fill="url(#bg)" />
      <circle cx="420" cy="92" r="54" fill="${accent}" fill-opacity="0.16" />
      <circle cx="108" cy="418" r="72" fill="#ffffff" fill-opacity="0.08" />
      <ellipse cx="256" cy="202" rx="124" ry="128" fill="${skin}" />
      <path d="M142 187c0-72 47-118 114-118 59 0 105 34 125 93-34-25-59-34-98-31-42 3-77 13-141 56Z" fill="${hair}" />
      <path d="M136 197c18-34 43-55 76-68" stroke="${hair}" stroke-width="22" stroke-linecap="round" />
      <path d="M376 197c-18-34-43-55-76-68" stroke="${hair}" stroke-width="22" stroke-linecap="round" />
      <rect x="162" y="158" width="42" height="100" rx="21" fill="${accent}" />
      <rect x="308" y="158" width="42" height="100" rx="21" fill="${accent}" />
      <rect x="194" y="170" width="124" height="24" rx="12" fill="${accent}" />
      <circle cx="${256 - eyeOffset}" cy="206" r="10" fill="#10121b" />
      <circle cx="${256 + eyeOffset}" cy="206" r="10" fill="#10121b" />
      <path d="M${256 - mouthWidth / 2} 254c12 16 48 16 60 0" stroke="#7a4231" stroke-width="10" stroke-linecap="round" fill="none" />
      <path d="M154 390c18-64 67-99 102-99 35 0 84 35 102 99" fill="${hoodieTone}" />
      <path d="M184 324c18 24 42 36 72 36 30 0 54-12 72-36" stroke="${accent}" stroke-width="10" stroke-linecap="round" fill="none" />
      <text x="256" y="456" text-anchor="middle" fill="#ffffff" fill-opacity="0.82" font-family="Avenir Next, Segoe UI, sans-serif" font-size="20">${phrase.slice(0, 24)}</text>
    </svg>
  `;

  return encodeSvgAsDataUrl(svg);
}

function buildFallbackOptions({
  profile,
  prompt,
  variantCount
}: {
  profile: {
    id: string;
    hexId: string;
    name: string;
  };
  prompt: string;
  variantCount: number;
}) {
  return Array.from({ length: variantCount }, (_, index) => {
    const variant = buildRandomVariantPrompt();
    const seed = `${profile.hexId}:${prompt}:${index + 1}`;

    return {
      id: `option-${index + 1}`,
      label: variant.label,
      avatarImage: buildFallbackAvatarDataUrl({
        seed,
        label: variant.label,
        phrase: prompt
      }),
      revisedPrompt: `Fallback character sketch based on: ${prompt}`
    };
  });
}

function buildRandomVariantPrompt() {
  const hair = pickRandom(avatarHairChoices);
  const accessory = pickRandom(avatarAccessoryChoices);
  const palette = pickRandom(avatarPaletteChoices);
  const mood = pickRandom(avatarMoodChoices);
  const outfit = pickRandom(avatarOutfitChoices);
  const backdrop = pickRandom(avatarBackdropChoices);

  return {
    label: mood,
    prompt: `Make the character feel like a music fan with ${hair}, ${accessory}, ${outfit}, ${mood}, and a ${palette} palette. Use a ${backdrop}. Keep it simple, original, and cute.`
  };
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
    const rawBody = await request.json();
    const isSaveRequest = rawBody?.action === 'save';
    const baseBody = isSaveRequest ? saveSchema.parse(rawBody) : generateSchema.parse(rawBody);

    const profile = await db.profile.findUnique({
      where: { id: baseBody.profileId },
      select: {
        id: true,
        hexId: true,
        ownerId: true,
        type: true,
        name: true,
        city: true,
        country: true,
        genres: true,
        topFiveContent: true,
        avatarImage: true
      }
    });

    if (!profile || profile.type !== 'LISTENER') {
      return NextResponse.json({ error: 'Fan page not found' }, { status: 404 });
    }

    if (!canManageOwnedResource(session, profile.ownerId)) {
      return NextResponse.json({ error: 'Only the fan who owns this page can generate an avatar' }, { status: 403 });
    }

    if (isSaveRequest) {
      const body = saveSchema.parse(rawBody);

      if (body.profileHexId.toLowerCase() !== profile.hexId.toLowerCase()) {
        return NextResponse.json({ error: 'That avatar can only be tagged to its matching fan ID.' }, { status: 400 });
      }

      await db.profile.update({
        where: { id: profile.id },
        data: { avatarImage: body.avatarImage }
      });

      return NextResponse.json({
        avatarImage: body.avatarImage,
        fanHexId: profile.hexId
      });
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const body = generateSchema.parse(rawBody);

    const options: Array<{
      id: string;
      label: string;
      avatarImage: string;
      revisedPrompt: string | null;
    }> = [];

    try {
      for (let index = 0; index < body.variantCount; index += 1) {
        const variant = buildRandomVariantPrompt();
        const result = await openai.images.generate({
          model: 'gpt-image-1',
          prompt: buildAvatarPrompt({
            name: profile.name,
            city: profile.city,
            country: profile.country,
            genres: profile.genres,
            topFiveContent: profile.topFiveContent,
            userPrompt: [body.prompt, variant.prompt].filter(Boolean).join(' ')
          }),
          size: '1024x1024',
          quality: 'medium',
          background: 'transparent',
          output_format: 'png',
          user: `${profile.hexId}-fan-avatar-${index + 1}`
        });

        const image = result.data?.[0];
        if (!image?.b64_json) {
          continue;
        }

        options.push({
          id: `option-${index + 1}`,
          label: variant.label,
          avatarImage: `data:image/png;base64,${image.b64_json}`,
          revisedPrompt: image.revised_prompt ?? null
        });
      }
    } catch (error) {
      const openAiError = error as { code?: string; message?: string };

      return NextResponse.json({
        options: buildFallbackOptions({
          profile: {
            id: profile.id,
            hexId: profile.hexId,
            name: profile.name
          },
          prompt: body.prompt,
          variantCount: body.variantCount
        }),
        fanHexId: profile.hexId,
        generationMode: 'fallback',
        notice:
          openAiError.code === 'billing_hard_limit_reached'
            ? 'OpenAI image credits are unavailable right now, so iHYPE generated local character sketches instead.'
            : 'The OpenAI image service is temporarily unavailable, so iHYPE generated local character sketches instead.',
        savedAvatarImage: profile.avatarImage ?? null
      });
    }

    if (!options.length) {
      return NextResponse.json({
        options: buildFallbackOptions({
          profile: {
            id: profile.id,
            hexId: profile.hexId,
            name: profile.name
          },
          prompt: body.prompt,
          variantCount: body.variantCount
        }),
        fanHexId: profile.hexId,
        generationMode: 'fallback',
        notice: 'The OpenAI image service returned empty results, so iHYPE generated local character sketches instead.',
        savedAvatarImage: profile.avatarImage ?? null
      });
    }

    return NextResponse.json({
      options,
      fanHexId: profile.hexId,
      generationMode: 'openai',
      savedAvatarImage: profile.avatarImage ?? null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Could not generate avatar right now' }, { status: 500 });
  }
}
