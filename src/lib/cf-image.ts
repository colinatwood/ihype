type ImageTransformOptions = {
  width?: number;
  height?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
};

export function cfImageUrl(src: string | null | undefined, opts: ImageTransformOptions = {}): string | null {
  if (!src) return null;

  const base = process.env.NEXT_PUBLIC_CF_IMAGES_BASE;

  if (!base || !src.startsWith(base)) {
    return src;
  }

  const path = src.slice(base.length).replace(/^\//, '');

  const options: ImageTransformOptions = { format: 'auto', ...opts };

  const params: string[] = [];
  if (options.width !== undefined) params.push(`width=${options.width}`);
  if (options.height !== undefined) params.push(`height=${options.height}`);
  if (options.fit !== undefined) params.push(`fit=${options.fit}`);
  if (options.format !== undefined) params.push(`format=${options.format}`);
  if (options.quality !== undefined) params.push(`quality=${options.quality}`);

  const paramString = params.join(',');

  return `${base}/cdn-cgi/image/${paramString}/${path}`;
}

export function cfAvatarUrl(src: string | null | undefined): string | null {
  return cfImageUrl(src, { width: 400, format: 'auto', fit: 'cover' });
}

export function cfPosterUrl(src: string | null | undefined): string | null {
  return cfImageUrl(src, { width: 800, format: 'auto', fit: 'cover' });
}
