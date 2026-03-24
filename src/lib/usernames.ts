const usernamePattern = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/;
const reservedUsernames = new Set([
  'admin',
  'administrator',
  'billing',
  'contact',
  'help',
  'ihype',
  'ihype.org',
  'moderator',
  'official',
  'owner',
  'root',
  'security',
  'support',
  'system',
  'team'
]);

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string) {
  const normalized = normalizeUsername(value);
  return usernamePattern.test(normalized) && !reservedUsernames.has(normalized);
}

export function getUsernameValidationMessage() {
  return 'Username must be 3-30 characters, use letters, numbers, dots, dashes, or underscores, and cannot use reserved names like admin or support.';
}
