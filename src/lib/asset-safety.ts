function isAllowedImageProtocol(value: string) {
  return (
    value.startsWith('/') ||
    value.startsWith('https://') ||
    /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,/i.test(value) ||
    value.startsWith('blob:')
  );
}

export function getSafeImageUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  return isAllowedImageProtocol(trimmedValue) ? trimmedValue : null;
}
