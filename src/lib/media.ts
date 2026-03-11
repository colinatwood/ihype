export type ArtistMediaEntry = {
  id: string;
  title: string;
  url: string;
  notes: string | null;
};

export type ParsedArtistMediaContent = {
  notes: string | null;
  entries: ArtistMediaEntry[];
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildTitleFromUrl(value: string) {
  try {
    const pathname = new URL(value).pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    if (!lastSegment) {
      return 'Artist upload';
    }

    return decodeURIComponent(lastSegment)
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return 'Artist upload';
  }
}

function parseMediaLine(line: string, index: number): ArtistMediaEntry | null {
  const parts = line
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return null;
  }

  const urlIndex = parts.findIndex((part) => isValidUrl(part));
  if (urlIndex === -1) {
    return null;
  }

  const url = parts[urlIndex];
  const metadataParts = parts.filter((_, partIndex) => partIndex !== urlIndex);
  const title = metadataParts[0] || buildTitleFromUrl(url);
  const notes = metadataParts.slice(1).join(' | ') || null;

  return {
    id: `media-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'track'}`,
    title,
    url,
    notes
  };
}

export function parseArtistMediaContent(content: string | null | undefined): ParsedArtistMediaContent {
  if (!content?.trim()) {
    return { notes: null, entries: [] };
  }

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries: ArtistMediaEntry[] = [];
  const noteLines: string[] = [];

  for (const line of lines) {
    const parsedLine = parseMediaLine(line, entries.length + 1);
    if (parsedLine) {
      entries.push(parsedLine);
    } else {
      noteLines.push(line);
    }
  }

  return {
    notes: noteLines.length ? noteLines.join('\n\n') : null,
    entries
  };
}
