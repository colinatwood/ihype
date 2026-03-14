function isAllowedProtocol(value: string) {
  return (
    value.startsWith('/') ||
    value.startsWith('https://') ||
    value.startsWith('http://') ||
    value.startsWith('data:image/') ||
    value.startsWith('blob:')
  );
}

export function getSafeImageUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  return isAllowedProtocol(trimmedValue) ? trimmedValue : null;
}

export function getSafeBackgroundImageStyle(value?: string | null) {
  const safeValue = getSafeImageUrl(value);

  if (!safeValue) {
    return undefined;
  }

  return {
    backgroundImage: `linear-gradient(rgba(7, 11, 20, 0.45), rgba(7, 11, 20, 0.88)), url("${safeValue}")`
  };
}
