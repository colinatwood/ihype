'use client';

import { useId, useState } from 'react';

type LinkedEntry = { title: string; url: string; notes: string };

function serialize(entries: LinkedEntry[]): string {
  return entries
    .filter((e) => e.url.trim())
    .map((e) => {
      const parts = [e.title.trim() || e.url.trim(), e.url.trim()];
      if (e.notes.trim()) parts.push(e.notes.trim());
      return parts.join(' | ');
    })
    .join('\n');
}

function parse(raw: string): LinkedEntry[] {
  if (!raw.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      const urlIdx = parts.findIndex((p) => { try { const u = new URL(p); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } });
      if (urlIdx === -1) return null;
      const url = parts[urlIdx];
      const meta = parts.filter((_, i) => i !== urlIdx);
      return { title: meta[0] ?? '', url, notes: meta.slice(1).join(' | ') };
    })
    .filter((e): e is LinkedEntry => e !== null);
}

type LinkedMediaBuilderProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LinkedMediaBuilder({ value, onChange }: LinkedMediaBuilderProps) {
  const uid = useId();
  const [entries, setEntries] = useState<LinkedEntry[]>(() => parse(value));

  function update(next: LinkedEntry[]) {
    setEntries(next);
    onChange(serialize(next));
  }

  function addEntry() {
    update([...entries, { title: '', url: '', notes: '' }]);
  }

  function removeEntry(i: number) {
    update(entries.filter((_, idx) => idx !== i));
  }

  function setField(i: number, field: keyof LinkedEntry, val: string) {
    update(entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.map((entry, i) => (
        <div key={`${uid}-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, alignItems: 'start' }}>
          <label className="field" style={{ margin: 0 }}>
            {i === 0 && <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Title</span>}
            <input
              onChange={(e) => setField(i, 'title', e.target.value)}
              placeholder="Track / EP / Playlist title"
              value={entry.title}
            />
          </label>
          <label className="field" style={{ margin: 0 }}>
            {i === 0 && <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>URL</span>}
            <input
              onChange={(e) => setField(i, 'url', e.target.value)}
              placeholder="https://…"
              type="url"
              value={entry.url}
            />
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {i === 0 && <span style={{ fontSize: '0.7rem', opacity: 0 }}>·</span>}
            <button
              className="button small secondary"
              onClick={() => removeEntry(i)}
              style={{ flexShrink: 0 }}
              title="Remove this link"
              type="button"
            >
              ✕
            </button>
          </div>
          {entry.url && (
            <label className="field" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <input
                onChange={(e) => setField(i, 'notes', e.target.value)}
                placeholder="Notes (version, live room, release context) — optional"
                value={entry.notes}
              />
            </label>
          )}
        </div>
      ))}
      <button className="button small secondary" onClick={addEntry} type="button" style={{ alignSelf: 'flex-start' }}>
        + Add link
      </button>
      {entries.length === 0 && (
        <p className="meta" style={{ fontSize: '0.75rem', margin: 0 }}>
          Add Spotify, SoundCloud, Bandcamp, or any direct audio URL to surface it on your public page.
        </p>
      )}
    </div>
  );
}
