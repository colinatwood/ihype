import { NextResponse } from 'next/server';
import { renderSVG } from 'uqr';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  const { showId } = await params;

  const show = await db.show.findUnique({
    where: { id: showId },
    select: { slug: true },
  });

  if (!show) {
    return NextResponse.json({ error: 'Show not found.' }, { status: 404 });
  }

  const target = `https://ihype.org/shows/${show.slug}`;

  // Generate the QR in-house (uqr runs on Cloudflare Workers with no native deps).
  // SVG scales losslessly, so it replaces the previous 512x512 PNG download.
  const svg = renderSVG(target, { ecc: 'M', border: 2 });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="qr-${show.slug}.svg"`,
      'Cache-Control': 'public, s-maxage=86400',
    },
  });
}
