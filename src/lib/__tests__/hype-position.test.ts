import { describe, it, expect } from 'vitest';
import { bucketHypePosition, computeShowDurationSecs } from '../hype-position';

describe('bucketHypePosition', () => {
  it('buckets the first third as early', () => {
    expect(bucketHypePosition(0, 900)).toBe('early');
    expect(bucketHypePosition(299, 900)).toBe('early');
  });

  it('buckets the middle third as mid', () => {
    expect(bucketHypePosition(300, 900)).toBe('mid');
    expect(bucketHypePosition(599, 900)).toBe('mid');
  });

  it('buckets the final third as late', () => {
    expect(bucketHypePosition(600, 900)).toBe('late');
    expect(bucketHypePosition(899, 900)).toBe('late');
  });

  it('returns null when duration is unknown', () => {
    expect(bucketHypePosition(30, 0)).toBeNull();
    expect(bucketHypePosition(30, -5)).toBeNull();
  });
});

describe('computeShowDurationSecs', () => {
  it('sums radioTracks durations first', () => {
    const secs = computeShowDurationSecs({
      radioTracks: [{ durationSecs: 180 }, { durationSecs: 240 }],
      productionPlan: null,
    });
    expect(secs).toBe(420);
  });

  it('falls back to productionPlan duration when there are no radio tracks', () => {
    const plan = {
      mediaItems: [{
        mediaId: '0xabc123',
        title: 'Track One',
        url: 'https://example.com/track.mp3',
        artistProfileId: 'clh1234567890123456789012',
        artistName: 'Test Artist',
        durationSeconds: 200,
      }],
      voiceOvers: [],
      samplePads: [],
      sequence: [{ id: 's1', kind: 'MEDIA' as const, refId: '0xabc123', label: 'Track One' }],
      advertising: { enabled: false, scope: 'local' as const, frequency: 3, clips: [] },
    };
    const secs = computeShowDurationSecs({ radioTracks: [], productionPlan: plan });
    expect(secs).toBe(200);
  });

  it('falls back to the 3600s default when nothing else is known', () => {
    const secs = computeShowDurationSecs({ radioTracks: [], productionPlan: null });
    expect(secs).toBe(3600);
  });

  it('ignores tracks with no known duration', () => {
    const secs = computeShowDurationSecs({
      radioTracks: [{ durationSecs: null }, { durationSecs: null }],
      productionPlan: null,
    });
    expect(secs).toBe(3600);
  });
});
