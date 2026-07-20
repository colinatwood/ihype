import { db } from '@/lib/db';
import { sendMarketingEmail } from '@/lib/mailer';

type ProfileStub = { id: string; name: string; owner: { id: string; email: string | null; name: string | null } | null };

async function sendDigestForProfile(profile: ProfileStub): Promise<void> {
  if (!profile.owner?.email) return;

  // Respect the owner's weekly digest preference before doing any work.
  const prefs = await db.notificationPreference.findUnique({
    where: { userId: profile.owner.id },
    select: { weeklyDigest: true }
  });
  if (prefs?.weeklyDigest === false) return;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [playCount, hypeCount, followerCount] = await Promise.all([
    db.mediaListen.count({
      where: { artistProfileSlug: { not: null }, createdAt: { gte: sevenDaysAgo } }
    }),
    db.profileHypeEvent.count({
      where: { profileId: profile.id, createdAt: { gte: sevenDaysAgo } }
    }),
    db.follow.count({ where: { followeeProfileId: profile.id } })
  ]);

  const subject = `Your iHYPE weekly digest — ${profile.name}`;
  const text = [
    `Hi ${profile.owner.name ?? profile.name},`,
    '',
    `Here's your iHYPE artist digest for the past 7 days:`,
    '',
    `  - Plays: ${playCount}`,
    `  - New hypes: ${hypeCount}`,
    `  - Total followers: ${followerCount}`,
    '',
    `Keep it up — see you on stage.`,
    '',
    `The iHYPE team`
  ].join('\n');

  await sendMarketingEmail(profile.owner.id, { to: profile.owner.email, subject, text, html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${text}</pre>` });
}

// Batch entry point used by the cron job — avoids N+1 profile lookups
export async function sendArtistWeeklyDigestBatch(profiles: ProfileStub[]): Promise<{ sent: number }> {
  let sent = 0;
  for (const profile of profiles) {
    try {
      await sendDigestForProfile(profile);
      sent++;
    } catch {
      // continue to next profile
    }
  }
  return { sent };
}
