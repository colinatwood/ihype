'use client';

import { useEffect, useState } from 'react';

type Attendee = { name: string | null; avatar: string | null };

export function ShowEngagement({
  showId,
  canRsvp,
  initialCount,
  initialGoing,
  canRemind,
  initialReminded,
  showEnded
}: {
  showId: string;
  canRsvp: boolean;
  initialCount: number;
  initialGoing: boolean;
  canRemind: boolean;
  initialReminded: boolean;
  showEnded: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [going, setGoing] = useState(initialGoing);
  const [rsvpBusy, setRsvpBusy] = useState(false);

  const [reminded, setReminded] = useState(initialReminded);
  const [remindLoading, setRemindLoading] = useState(false);

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [attendeeLoading, setAttendeeLoading] = useState(false);

  useEffect(() => {
    // Sync RSVP state
    fetch(`/api/shows/${showId}/rsvp`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        if (typeof j.count === 'number') setCount(j.count);
        if (typeof j.going === 'boolean') setGoing(j.going);
      })
      .catch(() => {});

    // Load who's going
    fetch(`/api/shows/${showId}/attendees`)
      .then((r) => r.json())
      .then((data) => {
        setAttendees(data.attendees ?? []);
        setAttendeeCount(data.count ?? 0);
      })
      .catch(() => {});
  }, [showId]);

  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [remindError, setRemindError] = useState<string | null>(null);
  const [attendeeError, setAttendeeError] = useState<string | null>(null);

  async function toggleRsvp() {
    if (!canRsvp || rsvpBusy) return;
    setRsvpBusy(true);
    setRsvpError(null);
    const prevGoing = going;
    const prevCount = count;
    // Optimistic update
    setGoing(!prevGoing);
    setCount(prevGoing ? Math.max(0, prevCount - 1) : prevCount + 1);
    try {
      const res = await fetch(`/api/shows/${showId}/rsvp`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { going?: boolean; count?: number; error?: string };
      if (res.ok) {
        if (typeof json.count === 'number') setCount(json.count);
        if (typeof json.going === 'boolean') setGoing(json.going);
      } else {
        setGoing(prevGoing);
        setCount(prevCount);
        setRsvpError(json.error ?? 'Could not update RSVP');
      }
    } catch {
      setGoing(prevGoing);
      setCount(prevCount);
      setRsvpError('Could not update RSVP (network error)');
    } finally {
      setRsvpBusy(false);
    }
  }

  async function toggleRemind() {
    if (!canRemind || showEnded) return;
    setRemindLoading(true);
    setRemindError(null);
    const prevReminded = reminded;
    // Optimistic update
    setReminded(!prevReminded);
    try {
      const res = await fetch(`/api/shows/${showId}/remind`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { reminded?: boolean };
        setReminded(Boolean(data.reminded));
      } else {
        setReminded(prevReminded);
        setRemindError('Could not update reminder');
      }
    } catch {
      setReminded(prevReminded);
      setRemindError('Could not update reminder (network error)');
    } finally {
      setRemindLoading(false);
    }
  }

  async function toggleAttendee() {
    setAttendeeLoading(true);
    setAttendeeError(null);
    const prevOptedIn = optedIn;
    const prevAttendees = attendees;
    const prevAttendeeCount = attendeeCount;
    // Optimistic update
    const nextOptedIn = !prevOptedIn;
    setOptedIn(nextOptedIn);
    setAttendeeCount(nextOptedIn ? prevAttendeeCount + 1 : Math.max(0, prevAttendeeCount - 1));
    try {
      const res = await fetch(`/api/shows/${showId}/attendees`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOptedIn(data.optedIn);
        // Refresh the attendee list in the background
        fetch(`/api/shows/${showId}/attendees`)
          .then((r) => r.json())
          .then((refreshData) => {
            setAttendees(refreshData.attendees ?? []);
            setAttendeeCount(refreshData.count ?? 0);
          })
          .catch(() => {});
      } else {
        setOptedIn(prevOptedIn);
        setAttendees(prevAttendees);
        setAttendeeCount(prevAttendeeCount);
        setAttendeeError('Could not update attendance');
      }
    } catch {
      setOptedIn(prevOptedIn);
      setAttendees(prevAttendees);
      setAttendeeCount(prevAttendeeCount);
      setAttendeeError('Could not update attendance (network error)');
    } finally {
      setAttendeeLoading(false);
    }
  }

  const visible = attendees.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* RSVP + Remind row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={toggleRsvp}
          disabled={!canRsvp || rsvpBusy}
          className={`button small ${going ? '' : 'secondary'}`}
          aria-pressed={going}
          aria-label={going ? 'Cancel RSVP' : 'RSVP to this show'}
          title={canRsvp ? 'Toggle RSVP' : 'Sign in to RSVP'}
        >
          {going ? '✓ Going' : 'Going?'} ({count})
        </button>

        {canRemind && !showEnded && (
          <button
            className={`button small ${reminded ? '' : 'secondary'}`}
            onClick={toggleRemind}
            disabled={remindLoading}
            type="button"
            aria-pressed={reminded}
            aria-label={reminded ? 'Remove reminder for this show' : 'Set reminder for this show'}
          >
            {reminded ? 'Reminder set ✓' : 'Remind me'}
          </button>
        )}
      </div>
      {rsvpError ? <span className="meta">{rsvpError}</span> : null}
      {remindError ? <span className="meta">{remindError}</span> : null}

      {/* Who's going */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex' }}>
          {visible.map((a, i) => (
            <div
              key={i}
              title={a.name ?? 'Fan'}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent, #ff3e9a)', border: '2px solid var(--bg, #0a0a14)',
                marginLeft: i > 0 ? -10 : 0, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}
            >
              {a.avatar ? (
                <img alt={a.name ?? 'Fan'} src={a.avatar} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (a.name?.[0] ?? '?').toUpperCase()
              )}
            </div>
          ))}
        </div>
        {attendeeCount > 0 && (
          <span className="meta">
            {attendeeCount} fan{attendeeCount !== 1 ? 's' : ''} going{attendeeCount > 8 ? ` (+${attendeeCount - 8} more)` : ''}
          </span>
        )}
        <button
          className={`button small ${optedIn ? '' : 'secondary'}`}
          disabled={attendeeLoading}
          onClick={toggleAttendee}
          type="button"
          aria-pressed={optedIn ?? false}
          aria-label={optedIn ? 'Remove yourself from attendee list' : 'Add yourself to attendee list'}
          style={{ marginLeft: 4 }}
        >
          {optedIn === true ? "I'm going ✓" : optedIn === false ? 'Not going' : "I'm going!"}
        </button>
      </div>
      {attendeeError ? <span className="meta">{attendeeError}</span> : null}
    </div>
  );
}
