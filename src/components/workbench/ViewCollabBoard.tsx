'use client';
import React, { useState } from 'react';
import { WorkbenchData, WbCollabPost } from '@/types/workbench';

const ROLES = ['vocalist', 'guitarist', 'bassist', 'drummer', 'producer', 'DJ', 'venue', 'other'];
const ROLE_COLORS: Record<string, string> = {
  vocalist: '#ff3e9a', guitarist: '#ff5029', bassist: '#ffb84a',
  drummer: '#22e5d4', producer: '#b983ff', DJ: '#5fd38a', venue: '#4ec9f0', other: 'rgba(255,255,255,.4)',
};

export default function ViewCollabBoard({ data }: { data: WorkbenchData }) {
  const [posts, setPosts] = useState<WbCollabPost[]>(data.collabPosts ?? []);
  const [form, setForm] = useState({ type: 'looking-for', role: 'vocalist', body: '', contact: '' });
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.body.trim()) return;
    setPosting(true);
    try {
      const res = await fetch('/api/collab-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const { post } = await res.json();
        setPosts(ps => [post, ...ps]);
        setForm({ type: 'looking-for', role: 'vocalist', body: '', contact: '' });
        setShowForm(false);
      }
    } finally {
      setPosting(false);
    }
  }

  async function deletePost(id: string) {
    await fetch(`/api/collab-board?id=${id}`, { method: 'DELETE' });
    setPosts(ps => ps.filter(p => p.id !== id));
  }

  const typeColor = (t: string) => t === 'looking-for' ? '#ffb84a' : '#22e5d4';
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
      <div style={{ padding: '28px 36px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 22, fontWeight: 800, color: 'var(--ink,#f4efe9)', margin: 0 }}>Collab Board</h2>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.4)', marginTop: 4 }}>Find bandmates, venues, and collaborators</div>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--f-m,monospace)', fontSize: 12, fontWeight: 700, background: 'rgba(255,184,74,.12)', border: '1px solid rgba(255,184,74,.3)', color: '#ffb84a' }}>
            {showForm ? 'Cancel' : '+ Post'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.08))', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-3,#1a1612)', border: '1px solid var(--line-2,rgba(255,255,255,.08))', borderRadius: 8, color: 'var(--ink,#f4efe9)', fontFamily: 'var(--f-m,monospace)', fontSize: 12 }}>
                <option value="looking-for">Looking for</option>
                <option value="available">Available</option>
              </select>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-3,#1a1612)', border: '1px solid var(--line-2,rgba(255,255,255,.08))', borderRadius: 8, color: 'var(--ink,#f4efe9)', fontFamily: 'var(--f-m,monospace)', fontSize: 12 }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Describe what you're looking for or what you offer..." maxLength={500} rows={3} style={{ padding: '10px 12px', background: 'var(--bg-3,#1a1612)', border: '1px solid var(--line-2,rgba(255,255,255,.08))', borderRadius: 8, color: 'var(--ink,#f4efe9)', fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, resize: 'vertical' }} />
            <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Contact (optional: email, IG, etc.)" maxLength={100} style={{ padding: '8px 12px', background: 'var(--bg-3,#1a1612)', border: '1px solid var(--line-2,rgba(255,255,255,.08))', borderRadius: 8, color: 'var(--ink,#f4efe9)', fontFamily: 'var(--f-m,monospace)', fontSize: 12 }} />
            <button type="submit" disabled={posting || !form.body.trim()} style={{ padding: '9px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--f-m,monospace)', fontSize: 12, fontWeight: 700, background: 'rgba(255,184,74,.15)', border: '1px solid rgba(255,184,74,.4)', color: '#ffb84a', opacity: posting ? 0.6 : 1 }}>
              {posting ? 'Posting…' : 'Post to board'}
            </button>
          </form>
        )}

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(244,239,233,.3)', fontFamily: 'var(--f-m,monospace)', fontSize: 13 }}>No posts yet — be the first!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {posts.map(p => (
              <div key={p.id} style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: typeColor(p.type), background: `${typeColor(p.type)}1a`, border: `1px solid ${typeColor(p.type)}40`, padding: '2px 8px', borderRadius: 99 }}>{p.type.replace('-', ' ')}</span>
                  <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: ROLE_COLORS[p.role] ?? 'rgba(255,255,255,.4)', background: `${ROLE_COLORS[p.role] ?? 'rgba(255,255,255,.4)'}1a`, border: `1px solid ${ROLE_COLORS[p.role] ?? 'rgba(255,255,255,.15)'}40`, padding: '2px 8px', borderRadius: 99 }}>{p.role}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.3)' }}>{timeAgo(p.createdAt)}</span>
                  {p.isOwn && <button onClick={() => deletePost(p.id)} style={{ padding: '2px 8px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--f-m,monospace)', fontSize: 10, background: 'transparent', border: '1px solid rgba(255,80,41,.2)', color: 'rgba(255,80,41,.6)' }}>remove</button>}
                </div>
                <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 14, color: 'rgba(244,239,233,.85)', lineHeight: 1.55 }}>{p.body}</div>
                {p.contact && <div style={{ marginTop: 8, fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.4)' }}>Contact: {p.contact}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
