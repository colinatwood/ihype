function isAllowedImageProtocol(value: string) {
  return (
    value.startsWith('/') ||
    value.startsWith('https://') ||
    value.startsWith('http://') ||
    value.startsWith('data:image/') ||
    value.startsWith('blob:')
  );
}

function isAllowedVideoProtocol(value: string) {
  return (
    value.startsWith('https://') ||
    value.startsWith('http://') ||
    value.startsWith('data:video/') ||
    value.startsWith('blob:')
  );
}

export function isSafeImageInput(value?: string | null) {
  if (!value) {
    return true;
  }

  return isAllowedImageProtocol(value.trim());
}

export function isSafeVideoInput(value?: string | null) {
  if (!value) {
    return true;
  }

  return isAllowedVideoProtocol(value.trim());
}

export function getSafeImageUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  return isAllowedImageProtocol(trimmedValue) ? trimmedValue : null;
}

export function getSafeVideoUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  return isAllowedVideoProtocol(trimmedValue) ? trimmedValue : null;
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
