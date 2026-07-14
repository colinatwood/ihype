import { runVisionAI } from '@/lib/ai';

export interface ImageVettingResult {
  cleared: boolean;
  requiresManualReview: boolean;
  reasoning: string;
}

/**
 * AI vetting for uploaded image bytes — profile avatars/heroes/logos/gallery
 * images and ad creatives, none of which the text-only `runAI` path can
 * inspect. Uses the vision-capable Workers AI binding to describe policy
 * concerns (nudity/sexual content, graphic violence, hate symbols, spam
 * overlays, content unrelated to a music profile).
 *
 * Fail-open by design, matching vetFreeUseSample: when the AI binding is
 * unavailable (local dev) the upload behaves exactly as before.
 */
export async function vetImageUpload(imageBytes: Uint8Array, context: string): Promise<ImageVettingResult> {
  const raw = await runVisionAI(
    imageBytes,
    `You are the automated content-vetting officer for iHYPE.org, an audio-only music platform. This image was uploaded as a ${context}. Reply with exactly one line: "CLEARED: <short reason>" if the image contains no nudity/sexual content, no graphic violence or gore, no hate symbols, and no spam/scam text overlay. Otherwise reply "FLAGGED: <short reason>".`,
    128
  );

  if (!raw) {
    return { cleared: true, requiresManualReview: false, reasoning: 'Automated image vetting unavailable; allowed by default.' };
  }

  const flagged = /^\s*FLAGGED/i.test(raw);
  const reasoning = raw.replace(/^\s*(CLEARED|FLAGGED):?\s*/i, '').trim().slice(0, 300);

  return {
    cleared: !flagged,
    requiresManualReview: false,
    reasoning: reasoning || (flagged ? 'Flagged by automated image review.' : 'Cleared by automated image review.'),
  };
}
