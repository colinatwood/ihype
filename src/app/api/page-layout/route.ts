import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const layoutSchema = z.array(z.string().max(64)).max(50);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ layout: null });
  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { pageLayout: true },
    });
    return NextResponse.json({ layout: user?.pageLayout ?? null });
  } catch (error) {
    console.error('[page-layout] failed to load layout', error);
    return NextResponse.json({ error: 'Could not load page layout.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = layoutSchema.safeParse((await req.json())?.layout);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const layout = parsed.data;
  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { pageLayout: layout },
    });
  } catch (error) {
    console.error('[page-layout] failed to save layout', error);
    return NextResponse.json({ ok: false, error: 'Could not save page layout.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
