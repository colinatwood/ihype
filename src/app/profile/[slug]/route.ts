import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'ihype-profile.html');

// Cache the template in memory after first read (it's static)
let templateCache: string | null = null;
async function getTemplate(): Promise<string> {
  if (!templateCache) {
    templateCache = await fs.readFile(TEMPLATE_PATH, 'utf-8');
  }
  return templateCache;
}

function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Fetch just enough for OG meta — one lightweight query
  const profile = await db.profile.findUnique({
    where: { slug },
    select: {
      name: true,
      headline: true,
      bio: true,
      type: true,
      genres: true,
      city: true,
      stateRegion: true,
      country: true,
      hypeCount: true,
      avatarImage: true,
      verified: true,
    }
  });

  const origin = new URL(request.url).origin;
  const pageUrl = `${origin}/profile/${slug}`;

  // ── Build OG values ────────────────────────────────────────────
  const TYPE_LABEL: Record<string, string> = { ARTIST: 'Artist', DJ: 'Promoter', VENUE: 'Venue' };

  let ogTitle       = 'iHYPE';
  let ogDescription = 'Independent music platform — transparent by design.';
  let ogImage       = `${origin}/og-default.png`;
  let pageTitle     = 'Profile · iHYPE';

  if (profile) {
    const typeLabel = TYPE_LABEL[profile.type] ?? 'Artist';
    const loc       = [profile.city, profile.stateRegion].filter(Boolean).join(', ');
    const genres    = profile.genres.slice(0, 3).join(', ');

    ogTitle = `${profile.name} · iHYPE`;
    pageTitle = ogTitle;
    ogDescription = [
      typeLabel,
      genres || null,
      loc || null,
      profile.hypeCount ? `${profile.hypeCount} HYPE` : null,
      profile.headline || null,
    ].filter(Boolean).join(' · ');

    if (profile.avatarImage) ogImage = profile.avatarImage;
  }

  // ── Inject tags ────────────────────────────────────────────────
  const injected = `
  <!-- Open Graph / social preview -->
  <title>${escAttr(pageTitle)}</title>
  <meta name="description" content="${escAttr(ogDescription)}">
  <link rel="canonical" href="${escAttr(pageUrl)}">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="iHYPE">
  <meta property="og:url" content="${escAttr(pageUrl)}">
  <meta property="og:title" content="${escAttr(ogTitle)}">
  <meta property="og:description" content="${escAttr(ogDescription)}">
  <meta property="og:image" content="${escAttr(ogImage)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escAttr(ogTitle)}">
  <meta name="twitter:description" content="${escAttr(ogDescription)}">
  <meta name="twitter:image" content="${escAttr(ogImage)}">`;

  let html = await getTemplate();
  // Replace static <title> and inject OG tags right before </head>
  html = html.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace('</head>', injected + '\n</head>');

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
