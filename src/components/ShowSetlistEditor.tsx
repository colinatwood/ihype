'use client';

import { useState } from 'react';

type SetlistTemplate = { id: string; name: string; tracks: unknown };

export function ShowSetlistEditor({
  showId,
  profileId,
  initialTracks
}: {
  showId: string;
  profileId?: string;
  initialTracks: string[];
}) {
  const [text, setText] = useState(initialTracks.join('\n'));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [templates, setTemplates] = useState<SetlistTemplate[] | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  async function save() {
    setBusy(true);
    setMsg(null);
    const tracks = text.split('\n').map((s) => s.trim()).filter(Boolean);
    const res = await fetch(`/api/shows/${showId}/setlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks })
    });
    if (res.ok) setMsg('Saved.');
    else setMsg('Could not save.');
    setBusy(false);
  }

  async function loadTemplates() {
    if (!profileId) return;
    setLoadingTemplates(true);
    try {
      const res = await fetch(`/api/setlist-templates?profileId=${profileId}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates ?? []);
        setShowTemplates(true);
      }
    } catch {
      // ignore
    } finally {
      setLoadingTemplates(false);
    }
  }

  function applyTemplate(template: SetlistTemplate) {
    const tracks = Array.isArray(template.tracks)
      ? (template.tracks as string[]).join('\n')
      : typeof template.tracks === 'string'
      ? template.tracks
      : '';
    setText(tracks);
    setShowTemplates(false);
    setMsg(`Loaded template "${template.name}".`);
  }

  return (
    <section className="section">
      <h2>Setlist (owner only)</h2>
      {profileId ? (
        <div style={{ marginBottom: 8 }}>
          <button
            className="button small secondary"
            onClick={showTemplates ? () => setShowTemplates(false) : loadTemplates}
            disabled={loadingTemplates}
            type="button"
          >
            {loadingTemplates ? 'Loading...' : showTemplates ? 'Hide templates' : 'Load template'}
          </button>
          {showTemplates && templates !== null ? (
            <div style={{ marginTop: 8, background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 8, padding: 8 }}>
              {templates.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>No templates saved yet.</p>
              ) : (
                templates.map((t) => (
                  <button
                    key={t.id}
                    className="button small secondary"
                    style={{ marginRight: 6, marginBottom: 4 }}
                    onClick={() => applyTemplate(t)}
                    type="button"
                  >
                    {t.name}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      ) : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="One track per line…"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          background: 'var(--bg-3)',
          border: '1px solid var(--line)',
          color: 'var(--ink)',
          fontFamily: 'var(--f-b)'
        }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button className="button small" onClick={save} disabled={busy} type="button">
          {busy ? 'Saving…' : 'Save setlist'}
        </button>
        {msg ? <span className="meta">{msg}</span> : null}
      </div>
    </section>
  );
}
