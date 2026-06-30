import { NextResponse } from 'next/server';
import type { ProfileType } from '@prisma/client/wasm';
import { auth } from '@/lib/auth';
import { detectRequestLocation } from '@/lib/request-location';
import { getRecommendations } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type')?.toUpperCase() as ProfileType | null;
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '40', 10);
    const limit = Number.isNaN(limitParam) ? 40 : limitParam;

    const [session, requestLocation] = await Promise.all([
      auth().catch(() => null),
      detectRequestLocation().catch(() => null),
    ]);

    const result = await getRecommendations(session?.user?.id ?? null, requestLocation, {
      type: typeParam,
      limit,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/recommend] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
