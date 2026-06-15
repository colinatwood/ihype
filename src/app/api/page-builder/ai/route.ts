import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required.' }, { status: 401 });
  }

  const { role, name, genre, vibe } = await request.json().catch(() => ({}));

  const client = new Anthropic();

  const systemPrompt = `You are an AI page builder for iHYPE, a music platform. Generate 3 distinct page theme directions for a ${role} named "${name}".
Return ONLY valid JSON in this exact shape:
{
  "directions": [
    {
      "name": "Direction name",
      "mood": "dark" | "light" | "warm",
      "tagline": "Short compelling tagline (max 12 words, ends in period.)",
      "bio": "2-3 sentence bio that captures their vibe",
      "palette": {
        "bg": "#hex",
        "surface": "#hex",
        "ink": "#hex",
        "ink2": "#hex",
        "accent": "#hex",
        "accent2": "#hex",
        "line": "rgba(...)"
      }
    }
  ]
}
Make each direction distinct in mood and color palette. The accent color should be vibrant. Dark moods use near-black backgrounds (#0a0805 range). Light moods use warm off-whites. Warm moods use deep warm tones.`;

  const userMsg = `Role: ${role}\nName: ${name}${genre ? `\nGenre: ${genre}` : ''}\nVibe: ${vibe}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }],
    });

    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
