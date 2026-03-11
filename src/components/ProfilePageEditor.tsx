'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type EditableFieldKey =
  | 'headline'
  | 'bio'
  | 'heroImage'
  | 'aboutContent'
  | 'journalContent'
  | 'mediaContent'
  | 'tourContent'
  | 'merchContent'
  | 'requestContent'
  | 'recommendContent'
  | 'topFiveContent';

type EditableField = {
  key: EditableFieldKey;
  label: string;
  kind?: 'input' | 'textarea' | 'url';
  rows?: number;
  placeholder?: string;
};

type ProfilePageEditorProps = {
  profileId: string;
  title: string;
  description: string;
  fields: EditableField[];
  initialValues: Record<EditableFieldKey, string>;
};

export function ProfilePageEditor({
  profileId,
  title,
  description,
  fields,
  initialValues
}: ProfilePageEditorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<EditableFieldKey, string>>(initialValues);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const response = await fetch(`/api/profile-pages/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues)
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Page updated.');
      router.refresh();
    } else {
      setMessage(data.error ?? 'Could not update this page');
    }

    setPending(false);
  }

  return (
    <section className="panel artist-editor">
      <div className="artist-editor-header">
        <div>
          <h2>{title}</h2>
          <p className="kicker">{description}</p>
        </div>
        <button
          className="button small secondary"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? 'Hide editor' : 'Edit page'}
        </button>
      </div>

      {isOpen ? (
        <form className="form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label className="field" key={field.key}>
              <span>{field.label}</span>
              {field.kind === 'textarea' ? (
                <textarea
                  onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 6}
                  value={formValues[field.key]}
                />
              ) : (
                <input
                  maxLength={field.key === 'headline' ? 140 : undefined}
                  onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                  type={field.kind === 'url' ? 'url' : 'text'}
                  value={formValues[field.key]}
                />
              )}
            </label>
          ))}

          <div className="cta-row">
            <button className="button" disabled={pending} type="submit">
              {pending ? 'Saving...' : 'Save page'}
            </button>
            {message ? <span className="meta">{message}</span> : null}
          </div>
        </form>
      ) : null}
    </section>
  );
}
