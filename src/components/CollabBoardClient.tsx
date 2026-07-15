'use client';

import { useEffect, useState } from 'react';

type Post = {
  id: string;
  type: 'looking-for' | 'available';
  role: string;
  body: string;
  contact: string | null;
  createdAt: string;
  isOwn: boolean;
};

const ROLES = ['drummer', 'venue', 'vocalist', 'producer', 'guitarist', 'bassist', 'DJ', 'other'];

export function CollabBoardClient() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);
  const [type, setType] = useState<'looking-for' | 'available'>('looking-for');
  const [role, setRole] = useState(ROLES[0]);
  const [body, setBody] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    fetch('/api/collab-board')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setError(true));
  }

  useEffect(load, []);

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/collab-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, role, body: body.trim(), contact: contact.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? 'Could not post.');
        return;
      }
      setPosts((prev) => (prev ? [data.post, ...prev] : [data.post]));
      setBody('');
      setContact('');
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/collab-board?id=${id}`, { method: 'DELETE' });
    if (res.ok) setPosts((prev) => (prev ?? []).filter((p) => p.id !== id));
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 64px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.16em', color: '#22e5d4' }}>COLLAB BOARD</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem,5vw,2.4rem)', letterSpacing: '-.03em', margin: '10px 0 10px', color: 'var(--ink)' }}>
        Find your next collaborator
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-a60)', lineHeight: 1.6, marginBottom: 28, maxWidth: '56ch' }}>
        Post that you&apos;re looking for a bandmate, a venue, or a producer — or that you&apos;re available for hire.
      </p>

      <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 20, marginBottom: 32, background: 'var(--bg2, #0e0b08)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setType('looking-for')}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: type === 'looking-for' ? '#ff5029' : 'var(--line)', color: type === 'looking-for' ? '#fff' : 'var(--ink)' }}
            type="button"
          >
            Looking for
          </button>
          <button
            onClick={() => setType('available')}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: type === 'available' ? '#22e5d4' : 'var(--line)', color: type === 'available' ? '#0a0805' : 'var(--ink)' }}
            type="button"
          >
            Available for
          </button>
        </div>
        <select
          onChange={(e) => setRole(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--hair-100)', background: 'var(--bg)', color: 'var(--ink)', fontSize: 13 }}
          value={role}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <textarea
          onChange={(e) => setBody(e.target.value)}
          placeholder="What are you looking for / offering?"
          rows={3}
          style={{ width: '100%', marginBottom: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--hair-100)', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'inherit', resize: 'vertical' }}
          value={body}
        />
        <input
          onChange={(e) => setContact(e.target.value)}
          placeholder="Contact (optional — email, IG, etc.)"
          style={{ width: '100%', marginBottom: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--hair-100)', background: 'var(--bg)', color: 'var(--ink)', fontSize: 13 }}
          value={contact}
        />
        {formError && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 10 }}>{formError}</p>}
        <button
          disabled={submitting || !body.trim()}
          onClick={submit}
          style={{ width: '100%', padding: '10px 16px', borderRadius: 9999, border: 'none', background: '#ff5029', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          type="button"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>

      {error && <p style={{ color: '#ff5029', fontSize: 13 }}>Couldn&apos;t load the board right now.</p>}
      {!error && posts === null && <p style={{ color: 'var(--ink-a50)', fontSize: 13 }}>Loading…</p>}
      {posts && posts.length === 0 && <p style={{ color: 'var(--ink-a50)', fontSize: 13 }}>No posts yet — be the first.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {posts?.map((p) => (
          <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 16, background: '#100d09' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, color: p.type === 'looking-for' ? '#ff5029' : '#22e5d4', background: p.type === 'looking-for' ? 'rgba(255,80,41,.12)' : 'rgba(34,229,212,.12)' }}>
                {p.type === 'looking-for' ? 'Looking for' : 'Available for'} · {p.role}
              </span>
              {p.isOwn && (
                <button onClick={() => remove(p.id)} style={{ background: 'none', border: 'none', color: 'var(--ink-a45)', fontSize: 12, cursor: 'pointer' }} type="button">
                  Delete
                </button>
              )}
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5, margin: '0 0 6px' }}>{p.body}</p>
            {p.contact && <p style={{ fontSize: 12, color: 'var(--ink-a55)', margin: 0 }}>{p.contact}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
