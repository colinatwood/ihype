import { describe, it, expect } from 'vitest';
import { reportSchema } from '../content-report-schema';

// ---------------------------------------------------------------------------
// Content report targetType — must stay aligned with the admin moderation
// enforcement switch (src/app/api/admin/moderation/[id]/route.ts), which only
// ever handles 'track' (keyed on ArtistMediaAsset.hexId), not 'media'/'ticket'.
// A schema/enforcement mismatch here means a real user report can never
// actually be actioned, silently.
// ---------------------------------------------------------------------------

describe('content report targetType', () => {
  it('accepts the enforceable target types', () => {
    for (const targetType of ['profile', 'show', 'track']) {
      const result = reportSchema.safeParse({ targetType, targetId: 'abc123', reason: 'spam' });
      expect(result.success).toBe(true);
    }
  });

  it('rejects targetTypes with no enforcement action', () => {
    for (const targetType of ['media', 'ticket', 'comment', 'ad-audio']) {
      const result = reportSchema.safeParse({ targetType, targetId: 'abc123', reason: 'spam' });
      expect(result.success).toBe(false);
    }
  });

  it('requires a targetId and reason of sane length', () => {
    expect(reportSchema.safeParse({ targetType: 'track', targetId: 'ab', reason: 'spam' }).success).toBe(false);
    expect(reportSchema.safeParse({ targetType: 'track', targetId: 'abc123', reason: 'x' }).success).toBe(false);
    expect(reportSchema.safeParse({ targetType: 'track', targetId: 'abc123', reason: 'spam' }).success).toBe(true);
  });
});
