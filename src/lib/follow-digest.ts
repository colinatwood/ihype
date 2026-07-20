import { db } from '@/lib/db';
import { sendMarketingEmail } from '@/lib/mailer';
import { getBaseUrl } from '@/lib/utils';

const BASE = getBaseUrl();

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function sendFollowDigest(): Promise<{ sent: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // New shows announced in last 24h
  const newShows = await db.show.findMany({
    where: { createdAt: { gte: since }, status: 'SCHEDULED' },
    select: { title: true, slug: true, startsAt: true, headlinerProfile: { select: { id: true, name: true, slug: true } } },
    take: 50
  });

  // New journal posts in last 24h
  const newJournalPosts = await db.artistJournalPost.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, title: true, profile: { select: { id: true, name: true, slug: true } } },
    take: 50
  });

  // Group by profile
  const profileUpdates = new Map<string, { name: string; slug: string; shows: string[]; posts: string[] }>();
  for (const s of newShows) {
    if (!s.headlinerProfile) continue;
    const p = profileUpdates.get(s.headlinerProfile.id) ?? { name: s.headlinerProfile.name, slug: s.headlinerProfile.slug, shows: [], posts: [] };
    p.shows.push(`<a href="${BASE}/shows/${escHtml(s.slug)}">${escHtml(s.title)}</a>`);
    profileUpdates.set(s.headlinerProfile.id, p);
  }
  for (const j of newJournalPosts) {
    const p = profileUpdates.get(j.profile.id) ?? { name: j.profile.name, slug: j.profile.slug, shows: [], posts: [] };
    // ArtistJournalPost has no dedicated per-post page anywhere in the app
    // (no listing or permalink UI exists) — link to the artist's profile,
    // the closest real destination, rather than a nonexistent journal URL.
    p.posts.push(`<a href="${BASE}/artists/${escHtml(j.profile.slug)}">${escHtml(j.title)}</a>`);
    profileUpdates.set(j.profile.id, p);
  }

  if (profileUpdates.size === 0) return { sent: 0 };

  const allFollows = await db.follow.findMany({
    where: { followeeProfileId: { in: [...profileUpdates.keys()] }, notifyShows: true },
    select: {
      followeeProfileId: true,
      follower: {
        select: {
          id: true,
          email: true,
          notificationPreference: { select: { newShows: true, journalPosts: true } }
        }
      }
    }
  });
  const followersByProfile = new Map<string, typeof allFollows>();
  for (const f of allFollows) {
    const list = followersByProfile.get(f.followeeProfileId) ?? [];
    list.push(f);
    followersByProfile.set(f.followeeProfileId, list);
  }

  let sent = 0;
  for (const [profileId, update] of profileUpdates) {
    const followers = followersByProfile.get(profileId) ?? [];
    for (const f of followers) {
      if (!f.follower.email) continue;
      // Respect per-category email preferences before sending.
      const prefs = f.follower.notificationPreference;
      const showLines = prefs?.newShows === false ? [] : update.shows.map(s => `New show: ${s}`);
      const postLines = prefs?.journalPosts === false ? [] : update.posts.map(p => `New post: ${p}`);
      if (showLines.length === 0 && postLines.length === 0) continue;
      // Titles are user-generated: escape them for the HTML body and use the
      // raw strings for the plaintext body (never regex-strip tags from HTML).
      const allLines = [...showLines, ...postLines];
      const htmlLines = allLines.map(escHtml).join('<br/>');
      try {
        const result = await sendMarketingEmail(f.follower.id, { to: f.follower.email, subject: `${update.name} has new activity on iHYPE`, html: `<p><strong><a href="${BASE}/artists/${escHtml(update.slug)}">${escHtml(update.name)}</a></strong> posted:</p><p>${htmlLines}</p>`, text: allLines.join('\n') });
        if (!result.skipped) sent++;
      } catch { /* continue */ }
    }
  }
  return { sent };
}
