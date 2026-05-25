import { describe, expect, it } from 'vitest';
import { WORKBENCH_PATH, isSafeLocalRedirect, resolvePostAuthRedirect } from '@/lib/auth-redirects';

describe('auth redirects', () => {
  it('sends empty auth redirects to the workbench route', () => {
    expect(resolvePostAuthRedirect(undefined)).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect(null)).toBe(WORKBENCH_PATH);
  });

  it('normalizes transitional auth routes to workbench', () => {
    expect(resolvePostAuthRedirect('/auth/landing')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/auth/landing?module=tool-hub')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/auth/magic')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/auth/magic?token=abc')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/workbench')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/workbench?tool=settings')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/dashboard')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/dashboard?tab=tickets')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/login')).toBe(WORKBENCH_PATH);
    expect(resolvePostAuthRedirect('/login?callbackUrl=/home')).toBe(WORKBENCH_PATH);
  });

  it('preserves safe in-app callback destinations', () => {
    expect(resolvePostAuthRedirect('/radio/studio')).toBe('/radio/studio');
    expect(resolvePostAuthRedirect('/shows/my-show')).toBe('/shows/my-show');
  });

  it('rejects external or malformed callback destinations', () => {
    expect(isSafeLocalRedirect('https://example.com')).toBe(false);
    expect(isSafeLocalRedirect('//example.com')).toBe(false);
    expect(isSafeLocalRedirect('/\\example.com')).toBe(false);
    expect(isSafeLocalRedirect('/home\nx')).toBe(false);
  });
});
