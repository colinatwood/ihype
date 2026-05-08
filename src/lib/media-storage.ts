import { put } from '@vercel/blob';

function getBlobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null;
}

function sanitizePathSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

export function isBlobMediaStorageConfigured() {
  return Boolean(getBlobToken());
}

export async function uploadArtistMediaToBlob({
  file,
  hexId,
  profileId
}: {
  file: File;
  hexId: string;
  profileId: string;
}) {
  const safeName = sanitizePathSegment(file.name || `${hexId}.media`) || `${hexId}.media`;
  const path = `artist-media/${sanitizePathSegment(profileId)}/${hexId}/${safeName}`;
  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: file.type
  });

  return {
    provider: 'vercel-blob',
    key: blob.pathname,
    url: blob.url
  };
}
