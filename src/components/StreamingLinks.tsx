type StreamingLink = {
  platform: string;
  emoji: string;
  pattern: RegExp;
};

const STREAMING_PLATFORMS: StreamingLink[] = [
  { platform: 'Spotify', emoji: '🎵', pattern: /spotify\.com/ },
  { platform: 'Apple Music', emoji: '🎵', pattern: /music\.apple\.com/ },
  { platform: 'Bandcamp', emoji: '🎵', pattern: /bandcamp\.com/ },
  { platform: 'SoundCloud', emoji: '🎵', pattern: /soundcloud\.com/ },
  { platform: 'YouTube Music', emoji: '🎵', pattern: /music\.youtube\.com/ },
  { platform: 'Tidal', emoji: '🎵', pattern: /tidal\.com/ }
];

function detectPlatform(url: string): StreamingLink | null {
  for (const p of STREAMING_PLATFORMS) {
    if (p.pattern.test(url)) return p;
  }
  return null;
}

type ParsedLink = { url: string; label?: string };

function parseLinks(linksJson: string | null): ParsedLink[] {
  if (!linksJson) return [];
  try {
    const parsed: unknown = JSON.parse(linksJson);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'string') return { url: item };
          if (typeof item === 'object' && item !== null && 'url' in item) {
            return { url: String((item as Record<string, unknown>).url), label: String((item as Record<string, unknown>).label ?? '') };
          }
          return null;
        })
        .filter((x): x is ParsedLink => x !== null);
    }
  } catch {
    // ignore
  }
  return [];
}

export function StreamingLinks({ linksJson }: { linksJson: string | null }) {
  const links = parseLinks(linksJson);
  const streamingLinks = links
    .map((link) => ({ ...link, detected: detectPlatform(link.url) }))
    .filter((link) => link.detected !== null);

  if (streamingLinks.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {streamingLinks.map(({ url, label, detected }) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="button small secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span>{detected!.emoji}</span>
          <span>{label || detected!.platform}</span>
        </a>
      ))}
    </div>
  );
}
