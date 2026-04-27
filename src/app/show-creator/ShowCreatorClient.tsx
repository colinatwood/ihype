'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Profile = { id: string; name: string; type: string; slug: string };

type Props = { profiles: Profile[] };

type Step = 1 | 2 | 3;

type FormState = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  tags: string;
  promoterProfileId: string;
  venueProfileId: string;
  headlinerProfileId: string;
  isTicketed: boolean;
  ticketPriceDollars: string;
  ticketCapacity: string;
  venuePayoutPercent: string;
  artistPayoutPercent: string;
};

const EMPTY: FormState = {
  title: '',
  description: '',
  startsAt: '',
  endsAt: '',
  tags: '',
  promoterProfileId: '',
  venueProfileId: '',
  headlinerProfileId: '',
  isTicketed: false,
  ticketPriceDollars: '',
  ticketCapacity: '',
  venuePayoutPercent: '45',
  artistPayoutPercent: '45',
};

export function ShowCreatorClient({ profiles }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const promoterProfiles = profiles.filter((p) => p.type === 'DJ');
  const venueProfiles = profiles.filter((p) => p.type === 'VENUE');
  const artistProfiles = profiles.filter((p) => p.type === 'ARTIST' || p.type === 'DJ');

  function set(field: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function step1Valid() {
    return form.title.trim().length >= 3 && form.startsAt;
  }

  function step2Valid() {
    if (!form.isTicketed) return true;
    const price = parseFloat(form.ticketPriceDollars);
    const cap = parseInt(form.ticketCapacity);
    const venue = parseInt(form.venuePayoutPercent);
    const artist = parseInt(form.artistPayoutPercent);
    return price >= 0 && cap > 0 && venue + artist <= 90 && venue >= 0 && artist >= 0;
  }

  async function submit(status: 'SCHEDULED' | 'DRAFT') {
    setError('');
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        promoterProfileId: form.promoterProfileId || undefined,
        venueProfileId: form.venueProfileId || undefined,
        headlinerProfileId: form.headlinerProfileId || undefined,
        isTicketed: form.isTicketed,
        status,
      };

      if (form.isTicketed) {
        body.ticketPriceCents = Math.round(parseFloat(form.ticketPriceDollars) * 100);
        body.ticketCapacity = parseInt(form.ticketCapacity);
        body.venuePayoutPercent = parseInt(form.venuePayoutPercent);
        body.artistPayoutPercent = parseInt(form.artistPayoutPercent);
      }

      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed (${res.status})`);
      }

      const show = await res.json();
      router.push(`/shows/${show.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  const venuePercent = parseInt(form.venuePayoutPercent) || 0;
  const artistPercent = parseInt(form.artistPayoutPercent) || 0;
  const promoterPercent = 5;
  const splitValid = venuePercent + artistPercent <= 90;

  return (
    <main className="container section">
      <section className="hero" style={{ paddingBottom: '2rem' }}>
        <div className="hero-eyebrow">
          <span className="dot" /> Show creator · {step} of 3
        </div>
        <h1 className="t-h1">
          {step === 1 && <>Show details.</>}
          {step === 2 && <>Tickets &amp; splits.</>}
          {step === 3 && <>Review &amp; ship.</>}
        </h1>
      </section>

      {/* Stepper */}
      <div className="stepper" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem', marginBottom: '2rem', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '.45rem' }}>
        {(['Show details', 'Tickets', 'Review & ship'] as const).map((label, i) => {
          const n = (i + 1) as Step;
          const done = step > n;
          const active = step === n;
          return (
            <div
              key={label}
              onClick={() => done && setStep(n)}
              style={{
                padding: '.7rem .9rem',
                borderRadius: 'var(--r-sm)',
                border: `1px solid ${active ? 'var(--line-2)' : 'transparent'}`,
                background: active ? 'var(--bg)' : 'transparent',
                cursor: done ? 'pointer' : 'default',
                opacity: !done && !active ? 0.5 : 1,
              }}
            >
              <div style={{ fontFamily: 'var(--f-m)', fontSize: '.62rem', letterSpacing: '.18em', textTransform: 'uppercase', color: active ? 'var(--accent)' : done ? 'var(--r-venue)' : 'var(--ink-3)', fontWeight: 600, marginBottom: '.3rem' }}>
                Step 0{n}{done ? ' · Done' : active ? ' · Now' : ''}
              </div>
              <div style={{ fontFamily: 'var(--f-d)', fontWeight: 600, fontSize: '.95rem' }}>{label}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ maxWidth: 680 }}>

        {/* ── Step 1: Show details ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Field label="Show title *">
              <input
                               placeholder="e.g. After Hours · Vol. 4"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                autoFocus
              />
            </Field>

            <Field label="Description">
              <textarea
                               rows={3}
                placeholder="What's this show about?"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Starts at *">
                <input
                                   type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => set('startsAt', e.target.value)}
                />
              </Field>
              <Field label="Ends at">
                <input
                                   type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => set('endsAt', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Tags" hint="Comma-separated, e.g. electronic, lo-fi, late-night">
              <input
                               placeholder="electronic, lo-fi, late-night"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
              />
            </Field>

            {promoterProfiles.length > 0 && (
              <Field label="Your promoter profile">
                <select className="field-input" value={form.promoterProfileId} onChange={(e) => set('promoterProfileId', e.target.value)}>
                  <option value="">None</option>
                  {promoterProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            )}

            {venueProfiles.length > 0 && (
              <Field label="Your venue">
                <select className="field-input" value={form.venueProfileId} onChange={(e) => set('venueProfileId', e.target.value)}>
                  <option value="">None</option>
                  {venueProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            )}

            {artistProfiles.length > 0 && (
              <Field label="Headliner">
                <select className="field-input" value={form.headlinerProfileId} onChange={(e) => set('headlinerProfileId', e.target.value)}>
                  <option value="">None</option>
                  {artistProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            )}

            <div style={{ paddingTop: '.5rem' }}>
              <button className="button" disabled={!step1Valid()} onClick={() => setStep(2)}>
                Next: Tickets →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Tickets ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.85rem', cursor: 'pointer', padding: '1rem', background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)' }}>
              <input
                type="checkbox"
                checked={form.isTicketed}
                onChange={(e) => set('isTicketed', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 600, fontSize: '.95rem' }}>This show has tickets</div>
                <div style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginTop: '.15rem' }}>Leave unchecked for free / streaming-only shows</div>
              </div>
            </label>

            {form.isTicketed && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="Ticket price ($)">
                    <input
                                           type="number"
                      min="0"
                      step="0.01"
                      placeholder="15.00"
                      value={form.ticketPriceDollars}
                      onChange={(e) => set('ticketPriceDollars', e.target.value)}
                    />
                  </Field>
                  <Field label="Capacity">
                    <input
                                           type="number"
                      min="1"
                      placeholder="500"
                      value={form.ticketCapacity}
                      onChange={(e) => set('ticketCapacity', e.target.value)}
                    />
                  </Field>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontFamily: 'var(--f-m)', fontSize: '.7rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600, marginBottom: '.85rem' }}>Payout split</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '.85rem' }}>
                    <Field label="Venue %">
                      <input className="field-input" type="number" min="0" max="90" value={form.venuePayoutPercent} onChange={(e) => set('venuePayoutPercent', e.target.value)} />
                    </Field>
                    <Field label="Artist %">
                      <input className="field-input" type="number" min="0" max="90" value={form.artistPayoutPercent} onChange={(e) => set('artistPayoutPercent', e.target.value)} />
                    </Field>
                    <Field label="Promoter %">
                      <input className="field-input" type="number" value={promoterPercent} disabled style={{ opacity: .6 }} />
                    </Field>
                  </div>
                  {!splitValid ? (
                    <div style={{ fontSize: '.82rem', color: 'var(--accent)', fontWeight: 500 }}>Venue + Artist cannot exceed 90% (5% reserved for promoter pool)</div>
                  ) : (
                    <div style={{ fontSize: '.82rem', color: 'var(--r-venue)' }}>
                      ✓ Split: {venuePercent}% venue · {artistPercent}% artist · {promoterPercent}% promoter · 0% platform
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '.6rem', paddingTop: '.5rem' }}>
              <button className="button secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="button" disabled={!step2Valid()} onClick={() => setStep(3)}>
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & ship ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ReviewRow label="Title" value={form.title} />
            <ReviewRow label="Starts" value={form.startsAt ? new Date(form.startsAt).toLocaleString() : '—'} />
            {form.endsAt && <ReviewRow label="Ends" value={new Date(form.endsAt).toLocaleString()} />}
            {form.description && <ReviewRow label="Description" value={form.description} />}
            {form.tags && <ReviewRow label="Tags" value={form.tags} />}
            {form.venueProfileId && <ReviewRow label="Venue" value={venueProfiles.find(p => p.id === form.venueProfileId)?.name ?? '—'} />}
            {form.headlinerProfileId && <ReviewRow label="Headliner" value={artistProfiles.find(p => p.id === form.headlinerProfileId)?.name ?? '—'} />}
            {form.promoterProfileId && <ReviewRow label="Promoter" value={promoterProfiles.find(p => p.id === form.promoterProfileId)?.name ?? '—'} />}
            <ReviewRow label="Ticketed" value={form.isTicketed ? 'Yes' : 'No — free / streaming'} />
            {form.isTicketed && (
              <>
                <ReviewRow label="Price" value={`$${parseFloat(form.ticketPriceDollars || '0').toFixed(2)}`} />
                <ReviewRow label="Capacity" value={form.ticketCapacity} />
                <ReviewRow label="Split" value={`${form.venuePayoutPercent}% venue · ${form.artistPayoutPercent}% artist · 5% promoter · 0% platform`} />
              </>
            )}

            {error && (
              <div style={{ padding: '.85rem 1rem', background: 'rgba(216,58,22,.08)', border: '1px solid rgba(216,58,22,.25)', borderRadius: 'var(--r-md)', color: 'var(--accent)', fontSize: '.88rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', paddingTop: '.5rem' }}>
              <button className="button secondary" onClick={() => setStep(2)} disabled={submitting}>← Back</button>
              <button className="button secondary" disabled={submitting} onClick={() => submit('DRAFT')}>
                {submitting ? 'Saving…' : 'Save as draft'}
              </button>
              <button className="button" disabled={submitting} onClick={() => submit('SCHEDULED')}>
                {submitting ? 'Scheduling…' : 'Schedule show →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <span>{label}</span>
      {children}
      {hint && <div style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>{hint}</div>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '.55rem 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: '.86rem', color: 'var(--ink-2)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--f-m)', fontSize: '.86rem', color: 'var(--ink)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}
