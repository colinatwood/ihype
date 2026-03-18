'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ArtistUploadPolicy } from '@/components/ArtistUploadPolicy';
import { RegisterAccountChoices } from '@/components/RegisterAccountChoices';

export type RegisterRole = 'FAN' | 'ARTIST' | 'DJ' | 'VENUE';

type RegisterFormProps = {
  defaultRole: RegisterRole;
};

type RoleConfig = {
  primaryFields: Array<{
    name: string;
    label: string;
    type?: 'text' | 'email' | 'password';
    placeholder?: string;
    required?: boolean;
  }>;
};

const roleConfigs: Record<RegisterRole, RoleConfig> = {
  FAN: {
    primaryFields: [
      { name: 'postalCode', label: 'Home ZIP code', placeholder: '60601' },
      { name: 'username', label: 'Username', placeholder: 'nightowl' },
      { name: 'email', label: 'Recovery email', type: 'email', placeholder: 'fan@ihype.org' },
      { name: 'password', label: 'Password', type: 'password' }
    ]
  },
  ARTIST: {
    primaryFields: [
      { name: 'name', label: 'Artist name', placeholder: 'Nova Pulse' },
      { name: 'contactInfo', label: 'Contact info', placeholder: 'manager@artist.com | +1 555 101 2020' },
      { name: 'hometown', label: 'Hometown', placeholder: 'Chicago, IL' },
      { name: 'username', label: 'Username', placeholder: 'novapulse' },
      { name: 'email', label: 'Recovery email', type: 'email', placeholder: 'artist@ihype.org' },
      { name: 'password', label: 'Password', type: 'password' }
    ]
  },
  DJ: {
    primaryFields: [
      { name: 'name', label: 'Promoter name', placeholder: 'DJ Echo' },
      { name: 'username', label: 'Username', placeholder: 'djecho' },
      { name: 'email', label: 'Recovery email', type: 'email', placeholder: 'promoter@ihype.org' },
      { name: 'password', label: 'Password', type: 'password' }
    ]
  },
  VENUE: {
    primaryFields: [
      { name: 'name', label: 'Venue name', placeholder: 'Neon Harbor' },
      { name: 'addressLine1', label: 'Venue address', placeholder: '41 Bogart Street' },
      { name: 'contactInfo', label: 'Venue contact info', placeholder: 'bookings@venue.com | +1 555 303 4040' },
      { name: 'username', label: 'Username', placeholder: 'neonharbor' },
      { name: 'email', label: 'Recovery email', type: 'email', placeholder: 'venue@ihype.org' },
      { name: 'password', label: 'Password', type: 'password' }
    ]
  }
};

function requiresArtistUploadPolicy(role: RegisterRole) {
  return role === 'ARTIST' || role === 'DJ';
}

function getAudienceLabel(role: RegisterRole) {
  return role === 'ARTIST' ? 'artist' : 'promoter';
}

export function RegisterForm({
  defaultRole
}: RegisterFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isThirteenOrOlder, setIsThirteenOrOlder] = useState(false);
  const selectedRole = defaultRole;
  const roleConfig = roleConfigs[selectedRole];
  const showPolicy = requiresArtistUploadPolicy(selectedRole);
  const showAgeGate = selectedRole === 'FAN';

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    const payload = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue | boolean>;
    const email = String(payload.email ?? '');
    const password = String(payload.password ?? '');

    payload.role = selectedRole;
    payload.acceptedArtistUploadPolicy = showPolicy ? acceptedPolicy : true;
    payload.isThirteenOrOlder = showAgeGate ? isThirteenOrOlder : true;

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? 'Registration failed');
      return;
    }

    const destination = data.profilePath ?? '/auth/landing';
    const signInResult = await signIn('credentials', {
      identifier: String(data.username ?? email),
      password,
      redirect: false,
      callbackUrl: destination
    });

    if (signInResult?.error) {
      setMessage(
        data.profilePath
          ? `Account created. Sign in did not complete automatically, but your page is ready at ${data.profilePath}.`
          : 'Account created. Sign in did not complete automatically.'
      );
      return;
    }

    window.location.assign(signInResult?.url ?? destination);
  }

  return (
    <main className="container section register-shell">
      <div className="register-grid">
        <div className="panel register-panel">
          <div className="register-header">
            <RegisterAccountChoices activeRole={selectedRole} />
          </div>

          <form className="form register-form-stack" action={handleSubmit}>
            {roleConfig.primaryFields.map((field) => (
              <label className="field" key={field.name}>
                <span>{field.label}</span>
                <input
                  minLength={field.name === 'password' ? 8 : undefined}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required ?? true}
                  type={field.type ?? 'text'}
                />
              </label>
            ))}

            {showPolicy ? (
              <label className="checkbox-row register-checkbox">
                <input
                  checked={acceptedPolicy}
                  onChange={(event) => setAcceptedPolicy(event.target.checked)}
                  required
                  type="checkbox"
                />
                <span>
                  I agree to the iHYPE.org Artist Upload &amp; Limited Use License Policy for {getAudienceLabel(selectedRole)} accounts.
                </span>
              </label>
            ) : null}

            {showAgeGate ? (
              <label className="checkbox-row register-checkbox">
                <input
                  checked={isThirteenOrOlder}
                  onChange={(event) => setIsThirteenOrOlder(event.target.checked)}
                  required
                  type="checkbox"
                />
                <span>
                  I attest that I am 13 years of age or older and I recognize that iHYPE is not responsible for any content within.
                </span>
              </label>
            ) : null}

            <button className="button" type="submit">
              Create account
            </button>
            {message ? <p className="meta">{message}</p> : null}
          </form>
        </div>

        {showPolicy ? <ArtistUploadPolicy audienceLabel={getAudienceLabel(selectedRole)} /> : null}
      </div>
    </main>
  );
}
