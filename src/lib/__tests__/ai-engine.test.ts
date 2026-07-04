import { describe, expect, it } from 'vitest';
import { parseAiJson } from '@/lib/ai';
import { heuristicDjAdPlan } from '@/lib/ai-dj-ads';

describe('parseAiJson', () => {
  it('parses a bare JSON object', () => {
    expect(parseAiJson<{ ok: boolean }>('{"ok": true}')).toEqual({ ok: true });
  });

  it('extracts JSON wrapped in prose and markdown fences', () => {
    const raw = 'Sure! Here is the result:\n```json\n{"cleared": false, "reasoning": "rip"}\n```';
    expect(parseAiJson<{ cleared: boolean }>(raw)).toEqual({ cleared: false, reasoning: 'rip' });
  });

  it('returns null for empty, missing, or malformed responses', () => {
    expect(parseAiJson(null)).toBeNull();
    expect(parseAiJson('')).toBeNull();
    expect(parseAiJson('no json here')).toBeNull();
    expect(parseAiJson('{broken')).toBeNull();
  });
});

describe('heuristicDjAdPlan', () => {
  const base = {
    name: 'DJ Test',
    genres: ['techno'],
    city: 'Portland',
    stateRegion: 'ME',
    crateSize: 5,
    radioShowCount: 2,
  };

  it('scales ad scope with audience size', () => {
    expect(heuristicDjAdPlan({ ...base, hypeCount: 10 }).scope).toBe('local');
    expect(heuristicDjAdPlan({ ...base, hypeCount: 100 }).scope).toBe('regional');
    expect(heuristicDjAdPlan({ ...base, hypeCount: 500 }).scope).toBe('national');
    expect(heuristicDjAdPlan({ ...base, hypeCount: 5000 }).scope).toBe('global');
  });

  it('is marked as non-AI so callers can tell the fallback apart', () => {
    expect(heuristicDjAdPlan({ ...base, hypeCount: 10 }).aiGenerated).toBe(false);
  });
});
