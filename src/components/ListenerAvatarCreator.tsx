'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { shortenHexId } from '@/lib/hex-id';

type AvatarOption = {
  id: string;
  label: string;
  avatarImage: string;
  revisedPrompt: string | null;
};

type ListenerAvatarCreatorProps = {
  profileId: string;
  profileHexId: string;
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
  profileHexId,
  profileName,
  defaultPrompt,
  initialAvatarImage
}: ListenerAvatarCreatorProps) {
  const router = useRouter();
  const [characterPhrase, setCharacterPhrase] = useState('');
  const [avatarImage, setAvatarImage] = useState(initialAvatarImage);
  const [options, setOptions] = useState<AvatarOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedOption = options.find((option) => option.id === selectedOptionId) ?? null;
  const previewImage = selectedOption?.avatarImage ?? avatarImage;

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const response = await fetch('/api/listener-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        prompt: characterPhrase,
        variantCount: 4
      })
    });

    const data = await response.json();

    if (response.ok) {
      const nextOptions = (data.options ?? []) as AvatarOption[];
      setOptions(nextOptions);
      setSelectedOptionId(nextOptions[0]?.id ?? null);
      setMessage(nextOptions.length ? 'Choose the cartoon avatar you want to keep.' : 'No avatar options came back.');
    } else {
      setMessage(data.error ?? 'Could not generate avatar');
    }

    setPending(false);
  }

  async function handleSaveSelection() {
    if (!selectedOption) {
      setMessage('Pick an avatar option first.');
      return;
    }

    setPending(true);
    setMessage(null);

    const response = await fetch('/api/listener-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        profileId,
        profileHexId,
        avatarImage: selectedOption.avatarImage
      })
    });

    const data = await response.json();

    if (response.ok) {
      setAvatarImage(data.avatarImage ?? selectedOption.avatarImage);
      setMessage(`Animated avatar saved to ${shortenHexId(data.fanHexId ?? profileHexId)} for future fan interactions.`);
      router.refresh();
    } else {
      setMessage(data.error ?? 'Could not save this avatar');
    }

    setPending(false);
  }

  return (
    <section className="panel avatar-creator">
      <div className="avatar-creator-header">
        <div className="avatar-creator-preview">
          {previewImage ? (
            <img alt={`${profileName} avatar`} className="profile-avatar profile-avatar-large" src={previewImage} />
          ) : (
            <div className="profile-avatar profile-avatar-large profile-avatar-fallback">{getInitials(profileName)}</div>
          )}
        </div>
        <div>
          <h2>Animated fan avatar builder</h2>
          <p className="kicker">
            Write a phrase that describes your animated character, preview a few OpenAI-generated looks, and save one to your fan ID.
          </p>
          <p className="meta">Fan ID: {profileHexId}</p>
        </div>
      </div>

      <form className="form" onSubmit={handleGenerate}>
        <label className="field">
          <span>Character phrase</span>
          <textarea
            onChange={(event) => setCharacterPhrase(event.target.value)}
            placeholder={defaultPrompt}
            rows={4}
            value={characterPhrase}
          />
        </label>

        <div className="cta-row">
          <button className="button" disabled={pending} type="submit">
            {pending ? 'Generating...' : 'Generate animated avatars'}
          </button>
          <button
            className="button small secondary"
            onClick={() => setCharacterPhrase('')}
            type="button"
          >
            Clear phrase
          </button>
          <button
            className="button small secondary"
            disabled={!selectedOption || pending}
            onClick={handleSaveSelection}
            type="button"
          >
            Save to fan ID
          </button>
          {message ? <span className="meta">{message}</span> : null}
        </div>
      </form>

      {options.length ? (
        <div className="avatar-option-grid">
          {options.map((option) => (
            <button
              className={option.id === selectedOptionId ? 'avatar-option-card active' : 'avatar-option-card'}
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              type="button"
            >
              <img alt={`${option.label} avatar option`} className="avatar-option-image" src={option.avatarImage} />
              <div className="avatar-option-meta">
                <strong>{option.label}</strong>
                <span>{option.id === selectedOptionId ? `Selected for ${shortenHexId(profileHexId)}` : 'Choose'}</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
