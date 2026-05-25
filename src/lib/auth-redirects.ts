export const WORKBENCH_PATH = '/home';

export function isSafeLocalRedirect(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return false;
  if (path.includes('\n') || path.includes('\r')) return false;
  return true;
}

export function resolvePostAuthRedirect(path: string | null | undefined): string {
  if (!isSafeLocalRedirect(path)) return WORKBENCH_PATH;
  if (path === '/login' || path.startsWith('/login?')) return WORKBENCH_PATH;
  if (path.startsWith('/auth/')) return WORKBENCH_PATH;
  if (path === '/workbench' || path.startsWith('/workbench?')) return WORKBENCH_PATH;
  if (path === '/dashboard' || path.startsWith('/dashboard?')) return WORKBENCH_PATH;
  return path;
}
