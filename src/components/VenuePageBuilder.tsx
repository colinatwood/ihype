'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSafeBackgroundImageStyle, getSafeImageUrl, getSafeVideoUrl } from '@/lib/asset-safety';
import {
  getProfileDesignStyleVars,
  normalizeProfileAccentTone,
  normalizeProfileBackdropTone,
  normalizeProfileDesignPreset,
  normalizeProfileFontPreset,
  profileAccentTones,
  profileBackdropTones,
  profileDesignPresets,
  profileFontPresets,
  type ProfileAccentTone,
  type ProfileBackdropTone,
  type ProfileDesignPreset,
  type ProfileFontPreset
} from '@/lib/profile-design';

type VenuePageBuilderProps = {
  profileId: string;
  profileName: string;
  previewGenres: string[];
  startOpen?: boolean;
  hideToggle?: boolean;
  initialValues: {
    headline: string;
    bio: string;
    heroImage: string;
    logoImage: string;
    galleryImage: string;
    featureVideoUrl: string;
    addressLine1: string;
    contactInfo: string;
    hoursText: string;
    hometown: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    country: string;
    parkingDetails: string;
    stayRecommendations: string;
    aboutContent: string;
    requestContent: string;
    upcomingContent: string;
    previousShowHighlights: string;
    themePreset?: string | null;
    themeFontPreset?: string | null;
    themeAccentTone?: string | null;
    themeBackdropTone?: string | null;
    fanShareEnabled?: boolean;
  };
};

type VenueBuilderValues = {
  headline: string;
  bio: string;
  heroImage: string;
  logoImage: string;
  galleryImage: string;
  featureVideoUrl: string;
  addressLine1: string;
  contactInfo: string;
  hoursText: string;
  hometown: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  parkingDetails: string;
  stayRecommendations: string;
  aboutContent: string;
  requestContent: string;
  upcomingContent: string;
  previousShowHighlights: string;
  themePreset: ProfileDesignPreset;
  themeFontPreset: ProfileFontPreset;
  themeAccentTone: ProfileAccentTone;
  themeBackdropTone: ProfileBackdropTone;
  fanShareEnabled: boolean;
};

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function getPreviewSnippet(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.length > 180 ? `${trimmed.slice(0, 177).trimEnd()}...` : trimmed;
}

export function VenuePageBuilder({
  profileId,
  profileName,
  previewGenres,
  startOpen = false,
  hideToggle = false,
  initialValues
}: VenuePageBuilderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(startOpen);
  const [showPreview, setShowPreview] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitIntent, setSubmitIntent] = useState<'save' | 'launch'>('save');
  const [formValues, setFormValues] = useState<VenueBuilderValues>({
    ...initialValues,
    themePreset: normalizeProfileDesignPreset(initialValues.themePreset),
    themeFontPreset: normalizeProfileFontPreset(initialValues.themeFontPreset),
    themeAccentTone: normalizeProfileAccentTone(initialValues.themeAccentTone),
    themeBackdropTone: normalizeProfileBackdropTone(initialValues.themeBackdropTone),
    fanShareEnabled: Boolean(initialValues.fanShareEnabled)
  });

  const previewStyle = useMemo(
    () =>
      getProfileDesignStyleVars(formValues.themePreset, {
        accentTone: formValues.themeAccentTone,
        backdropTone: formValues.themeBackdropTone,
        fontPreset: formValues.themeFontPreset
      }),
    [formValues.themeAccentTone, formValues.themeBackdropTone, formValues.themeFontPreset, formValues.themePreset]
  );

  const previewBannerStyle = getSafeBackgroundImageStyle(formValues.heroImage);
  const previewLogo = getSafeImageUrl(formValues.logoImage);
  const previewGalleryImage = getSafeImageUrl(formValues.galleryImage);
  const previewVideo = getSafeVideoUrl(formValues.featureVideoUrl);
  const locationLine = [formValues.addressLine1, formValues.city, formValues.stateRegion, formValues.postalCode]
    .filter(Boolean)
    .join(', ');
  const aboutPreview = getPreviewSnippet(
    formValues.aboutContent || formValues.bio,
    'Set the room tone, explain the vibe, and make the venue easy for fans and artists to understand.'
  );
  const requestPreview = getPreviewSnippet(
    formValues.requestContent,
    'Use this section to explain what kinds of artists, nights, and bookings the venue wants to receive.'
  );
  const upcomingPreview = getPreviewSnippet(
    formValues.upcomingContent || formValues.previousShowHighlights,
    'Frame the calendar and tell visitors what kind of energy lives in the room on upcoming nights.'
  );

  async function handleAssetSelection(
    event: ChangeEvent<HTMLInputElement>,
    field: 'heroImage' | 'logoImage' | 'galleryImage' | 'featureVideoUrl',
    kind: 'image' | 'video'
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = kind === 'video' ? 12 * 1024 * 1024 : 4 * 1024 * 1024;
    const expectedPrefix = kind === 'video' ? 'video/' : 'image/';

    if (!file.type.startsWith(expectedPrefix)) {
      setMessage(`Choose a ${kind} file for this slot.`);
      event.target.value = '';
      return;
    }

    if (file.size > maxSizeBytes) {
      setMessage(
        kind === 'video'
          ? 'Video uploads are capped at 12MB for this builder.'
          : 'Image uploads are capped at 4MB for this builder.'
      );
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormValues((current) => ({
        ...current,
        [field]: dataUrl
      }));
      setMessage(`${file.name} loaded into the preview.`);
    } catch {
      setMessage(`Could not load ${file.name}.`);
    } finally {
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const shouldLaunch = submitIntent === 'launch';

    const response = await fetch(`/api/profile-pages/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: formValues.headline,
        bio: formValues.bio,
        heroImage: formValues.heroImage,
        logoImage: formValues.logoImage,
        galleryImage: formValues.galleryImage,
        featureVideoUrl: formValues.featureVideoUrl,
        addressLine1: formValues.addressLine1,
        contactInfo: formValues.contactInfo,
        hoursText: formValues.hoursText,
        hometown: formValues.hometown,
        city: formValues.city,
        stateRegion: formValues.stateRegion,
        postalCode: formValues.postalCode,
        country: formValues.country,
        parkingDetails: formValues.parkingDetails,
        stayRecommendations: formValues.stayRecommendations,
        aboutContent: formValues.aboutContent,
        requestContent: formValues.requestContent,
        upcomingContent: formValues.upcomingContent,
        previousShowHighlights: formValues.previousShowHighlights,
        themePreset: formValues.themePreset,
        themeFontPreset: formValues.themeFontPreset,
        themeAccentTone: formValues.themeAccentTone,
        themeBackdropTone: formValues.themeBackdropTone,
        fanShareEnabled: shouldLaunch ? true : formValues.fanShareEnabled
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? 'Could not update this venue page.');
      setPending(false);
      return;
    }

    setFormValues((current) => ({
      ...current,
      fanShareEnabled: shouldLaunch ? true : current.fanShareEnabled
    }));
    setMessage(shouldLaunch ? 'Venue page launched for fans.' : 'Draft saved.');
    setPending(false);
    router.refresh();
  }

  return (
    <section className="panel artist-page-builder">
      <div className="artist-page-builder-header">
        <div>
          <div className="badge">Page Builder</div>
          <h2>Build your venue page</h2>
          <p className="kicker">
            Change the room look, upload visuals, update venue operations, and preview the public page before you launch it.
          </p>
        </div>
        <div className="artist-page-builder-actions">
          <span className={formValues.fanShareEnabled ? 'status-chip artist-builder-status live' : 'status-chip artist-builder-status'}>
            {formValues.fanShareEnabled ? 'Live for fans' : 'Draft only'}
          </span>
          {!hideToggle ? (
            <button
              className="button small secondary"
              onClick={() => setIsOpen((current) => !current)}
              type="button"
            >
              {isOpen ? 'Hide builder' : 'Open builder'}
            </button>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <form className="artist-page-builder-layout" onSubmit={handleSubmit}>
          <div className="artist-page-builder-fields">
            <div className="artist-page-builder-section">
              <div className="artist-page-builder-section-head">
                <h3>Visuals</h3>
                <button
                  className="button small secondary"
                  onClick={() => setShowPreview((current) => !current)}
                  type="button"
                >
                  {showPreview ? 'Hide preview' : 'Preview page'}
                </button>
              </div>

              <label className="field">
                <span>Headline banner</span>
                <input
                  maxLength={140}
                  onChange={(event) => setFormValues((current) => ({ ...current, headline: event.target.value }))}
                  placeholder="What should visitors feel when they land here?"
                  value={formValues.headline}
                />
              </label>

              <label className="field">
                <span>Short intro</span>
                <textarea
                  onChange={(event) => setFormValues((current) => ({ ...current, bio: event.target.value }))}
                  rows={3}
                  value={formValues.bio}
                />
              </label>

              <div className="artist-builder-control-grid">
                <label className="field">
                  <span>Color preset</span>
                  <select
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        themePreset: normalizeProfileDesignPreset(event.target.value)
                      }))
                    }
                    value={formValues.themePreset}
                  >
                    {profileDesignPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Font preset</span>
                  <select
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        themeFontPreset: normalizeProfileFontPreset(event.target.value)
                      }))
                    }
                    value={formValues.themeFontPreset}
                  >
                    {profileFontPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Accent color</span>
                  <select
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        themeAccentTone: normalizeProfileAccentTone(event.target.value)
                      }))
                    }
                    value={formValues.themeAccentTone}
                  >
                    {profileAccentTones.map((tone) => (
                      <option key={tone.id} value={tone.id}>
                        {tone.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Backdrop tone</span>
                  <select
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        themeBackdropTone: normalizeProfileBackdropTone(event.target.value)
                      }))
                    }
                    value={formValues.themeBackdropTone}
                  >
                    {profileBackdropTones.map((tone) => (
                      <option key={tone.id} value={tone.id}>
                        {tone.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="artist-builder-upload-grid">
                <label className="field artist-builder-upload-field">
                  <span>Background upload</span>
                  <input accept="image/*" onChange={(event) => handleAssetSelection(event, 'heroImage', 'image')} type="file" />
                </label>

                <label className="field artist-builder-upload-field">
                  <span>Logo upload</span>
                  <input accept="image/*" onChange={(event) => handleAssetSelection(event, 'logoImage', 'image')} type="file" />
                </label>

                <label className="field artist-builder-upload-field">
                  <span>Picture upload</span>
                  <input accept="image/*" onChange={(event) => handleAssetSelection(event, 'galleryImage', 'image')} type="file" />
                </label>

                <label className="field artist-builder-upload-field">
                  <span>Video upload</span>
                  <input accept="video/*" onChange={(event) => handleAssetSelection(event, 'featureVideoUrl', 'video')} type="file" />
                </label>
              </div>
            </div>

            <div className="artist-page-builder-section">
              <div className="artist-page-builder-section-head">
                <h3>Venue info</h3>
              </div>

              <div className="artist-builder-control-grid">
                <label className="field">
                  <span>Street address</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, addressLine1: event.target.value }))}
                    value={formValues.addressLine1}
                  />
                </label>

                <label className="field">
                  <span>Contact information</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, contactInfo: event.target.value }))}
                    placeholder="bookings@venue.com | +1 555 101 3030"
                    value={formValues.contactInfo}
                  />
                </label>

                <label className="field">
                  <span>Hours</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, hoursText: event.target.value }))}
                    placeholder="Thu-Sat 8PM-2AM"
                    value={formValues.hoursText}
                  />
                </label>

                <label className="field">
                  <span>Local stay area</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, hometown: event.target.value }))}
                    value={formValues.hometown}
                  />
                </label>

                <label className="field">
                  <span>City</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, city: event.target.value }))}
                    value={formValues.city}
                  />
                </label>

                <label className="field">
                  <span>State / province</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, stateRegion: event.target.value }))}
                    value={formValues.stateRegion}
                  />
                </label>

                <label className="field">
                  <span>ZIP / postal</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, postalCode: event.target.value }))}
                    value={formValues.postalCode}
                  />
                </label>

                <label className="field">
                  <span>Country</span>
                  <input
                    onChange={(event) => setFormValues((current) => ({ ...current, country: event.target.value }))}
                    value={formValues.country}
                  />
                </label>
              </div>

              <label className="field">
                <span>About</span>
                <textarea
                  onChange={(event) => setFormValues((current) => ({ ...current, aboutContent: event.target.value }))}
                  rows={4}
                  value={formValues.aboutContent}
                />
              </label>

              <div className="artist-builder-control-grid">
                <label className="field">
                  <span>Request artist</span>
                  <textarea
                    onChange={(event) => setFormValues((current) => ({ ...current, requestContent: event.target.value }))}
                    rows={4}
                    value={formValues.requestContent}
                  />
                </label>

                <label className="field">
                  <span>Upcoming shows</span>
                  <textarea
                    onChange={(event) => setFormValues((current) => ({ ...current, upcomingContent: event.target.value }))}
                    rows={4}
                    value={formValues.upcomingContent}
                  />
                </label>
              </div>

              <div className="artist-builder-control-grid">
                <label className="field">
                  <span>Parking</span>
                  <textarea
                    onChange={(event) => setFormValues((current) => ({ ...current, parkingDetails: event.target.value }))}
                    rows={4}
                    value={formValues.parkingDetails}
                  />
                </label>

                <label className="field">
                  <span>Stay nearby</span>
                  <textarea
                    onChange={(event) => setFormValues((current) => ({ ...current, stayRecommendations: event.target.value }))}
                    rows={4}
                    value={formValues.stayRecommendations}
                  />
                </label>
              </div>

              <label className="field">
                <span>Previous show highlights</span>
                <textarea
                  onChange={(event) => setFormValues((current) => ({ ...current, previousShowHighlights: event.target.value }))}
                  rows={4}
                  value={formValues.previousShowHighlights}
                />
              </label>
            </div>

            <div className="cta-row artist-builder-cta-row">
              <button
                className="button secondary"
                disabled={pending}
                onClick={() => setSubmitIntent('save')}
                type="submit"
              >
                {pending && submitIntent === 'save' ? 'Saving draft...' : 'Save draft'}
              </button>
              <button
                className="button"
                disabled={pending}
                onClick={() => setSubmitIntent('launch')}
                type="submit"
              >
                {pending && submitIntent === 'launch'
                  ? 'Launching...'
                  : formValues.fanShareEnabled
                    ? 'Update live page'
                    : 'Launch page'}
              </button>
              {message ? <span className="meta">{message}</span> : null}
            </div>
          </div>

          {showPreview ? (
            <aside className="artist-page-builder-preview-shell profile-design-shell" style={previewStyle}>
              <div className="artist-page-builder-preview-card">
                <header className="artist-page-builder-preview-hero panel" style={previewBannerStyle}>
                  <div className="artist-page-builder-preview-copy">
                    <div className="artist-page-builder-preview-topline">
                      <span className="badge">VENUE PREVIEW</span>
                      <span className="status-chip">{formValues.fanShareEnabled ? 'Live' : 'Draft'}</span>
                    </div>
                    {previewLogo ? (
                      <img alt={`${profileName} logo`} className="artist-page-builder-preview-logo" src={previewLogo} />
                    ) : null}
                    <h3>{profileName}</h3>
                    <p className="artist-headline">
                      {formValues.headline || 'Your venue headline preview lands here.'}
                    </p>
                    <p className="subtitle">
                      {formValues.bio || 'Preview the public room intro, visuals, and venue atmosphere here before launch.'}
                    </p>
                    <div className="tag-row">
                      {previewGenres.slice(0, 3).map((genre) => (
                        <span className="tag" key={genre}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </header>

                <div className="artist-page-builder-preview-panels">
                  <article className="panel artist-page-builder-preview-panel">
                    <span className="badge">About</span>
                    <p>{aboutPreview}</p>
                    {locationLine ? <p className="meta">{locationLine}</p> : null}
                    {formValues.hoursText ? <p className="meta">Hours: {formValues.hoursText}</p> : null}
                  </article>

                  <article className="panel artist-page-builder-preview-panel">
                    <span className="badge">Request</span>
                    <p>{requestPreview}</p>
                    {formValues.parkingDetails ? <p className="meta">Parking: {formValues.parkingDetails}</p> : null}
                  </article>

                  <article className="panel artist-page-builder-preview-panel">
                    <span className="badge">Upcoming</span>
                    <p>{upcomingPreview}</p>
                    {previewGalleryImage ? (
                      <img alt={`${profileName} gallery preview`} className="artist-page-builder-preview-image" src={previewGalleryImage} />
                    ) : null}
                    {previewVideo ? (
                      <video className="artist-page-builder-preview-video" controls preload="metadata" src={previewVideo} />
                    ) : null}
                  </article>
                </div>
              </div>
            </aside>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}
