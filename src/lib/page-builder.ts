// Parses the published page-builder JSON (Profile.pagePublished) into the
// small set of overrides the public profile pages can consume today.
//
// SECURITY: everything in the builder JSON is untrusted user input. Only
// plain strings come out of here, with tags stripped and lengths capped —
// callers must render them as React text, never as HTML.
import type { ProfileDesignPreset } from '@/lib/profile-design';

export type PublishedPageOverrides = {
  /** Hero tagline from the builder — maps to the profile headline slot. */
  headline: string | null;
  /** About/bio copy from the builder. */
  bio: string | null;
  /** Closest existing profile design preset for the published theme. */
  themePreset: ProfileDesignPreset | null;
};

// The builder's theme vocabulary (palette/font/layout) is richer than the
// public pages' preset system, so we map the published mood to the closest
// existing preset rather than inventing new rendering paths.
const MOOD_TO_PRESET: Record<string, ProfileDesignPreset> = {
  dark: 'midnight-neon',
  light: 'sunset-paper'
};

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  // Defense-in-depth: strip anything tag-shaped even though output is
  // rendered as React text nodes only.
  const text = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  return text.length > max ? text.slice(0, max) : text;
}

export function parsePublishedPage(raw: string | null | undefined): PublishedPageOverrides | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;

  const data = parsed as { theme?: unknown; content?: unknown };
  const content = (data.content && typeof data.content === 'object' ? data.content : {}) as Record<string, unknown>;
  const theme = (data.theme && typeof data.theme === 'object' ? data.theme : {}) as Record<string, unknown>;

  const headline = cleanText(content.tagline, 180);
  const bio = cleanText(content.bio, 2000);
  const mood = typeof theme.mood === 'string' ? theme.mood : '';
  const themePreset = MOOD_TO_PRESET[mood] ?? null;

  if (!headline && !bio && !themePreset) return null;
  return { headline, bio, themePreset };
}
