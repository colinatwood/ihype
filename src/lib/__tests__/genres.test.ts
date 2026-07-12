import { describe, expect, it } from 'vitest';
import { MUSIC_GENRES } from '@/lib/genres';

describe('MUSIC_GENRES', () => {
  it('is a substantial, non-trivial list', () => {
    expect(MUSIC_GENRES.length).toBeGreaterThanOrEqual(40);
  });

  it('has no duplicate entries', () => {
    expect(new Set(MUSIC_GENRES).size).toBe(MUSIC_GENRES.length);
  });

  it('has no empty or untrimmed entries', () => {
    for (const g of MUSIC_GENRES) {
      expect(g).toBe(g.trim());
      expect(g.length).toBeGreaterThan(0);
    }
  });

  it('spans beyond electronic (cross-genre coverage)', () => {
    for (const g of ['Hip-Hop', 'Rock', 'Pop', 'Jazz', 'Country', 'Latin']) {
      expect(MUSIC_GENRES).toContain(g);
    }
  });
});
