'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ListenerAvatarCreatorProps = {
  profileId: string;
  profileName: string;
  defaultPrompt: string;
  initialAvatarImage: string | null;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ListenerAvatarCreator({
  profileId,
  profileName,
  defaultPrompt,
  initialAvatarImage
}: ListenerAvatarCreatorProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [avatarImage, setAvatarImage] = useState(initialAvatarImage);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const response = await fetch('/api/listener-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        prompt
      })
    });

    const data = await response.json();

    if (response.ok) {
      setAvatarImage(data.avatarImage ?? null);
      setMessage('Avatar updated.');
      router.refresh();
    } else {
      setMessage(data.error ?? 'Could not generate avatar');
    }

    setPending(false);
  }

  return (
    <section className="panel avatar-creator">
      <div className="avatar-creator-header">
        <div className="avatar-creator-preview">
          {avatarImage ? (
            <img alt={`${profileName} avatar`} className="profile-avatar profile-avatar-large" src={avatarImage} />
          ) : (
            <div className="profile-avatar profile-avatar-large profile-avatar-fallback">{getInitials(profileName)}</div>
          )}
        </div>
        <div>
          <h2>AI cartoon avatar</h2>
          <p className="kicker">
            Generate a listener-only cartoon portrait from a short prompt. This saves to your page avatar automatically.
          </p>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Avatar prompt</span>
          <textarea
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the vibe, colors, mood, and scene you want."
            rows={4}
            value={prompt}
          />
        </label>

        <div className="cta-row">
          <button className="button" disabled={pending} type="submit">
            {pending ? 'Generating...' : 'Generate avatar'}
          </button>
          <button
            className="button small secondary"
            onClick={() => setPrompt(defaultPrompt)}
            type="button"
          >
            Reset prompt
          </button>
          {message ? <span className="meta">{message}</span> : null}
        </div>
      </form>
    </section>
  );
}
