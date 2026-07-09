import { expect, test } from '@playwright/test';

test.describe('Public application smoke', () => {
  test('landing and login pages render without server errors', async ({ page }) => {
    for (const path of ['/', '/login']) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should return a successful response`).toBeLessThan(400);
      await expect(page).toHaveTitle(/iHYPE/i);
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
    }
  });

  test('protected home redirects anonymous visitors to login', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/\/login(?:\?|$)/, { timeout: 8_000 });
  });

  test('public health endpoint is a lightweight liveness probe', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: 'ok',
      scope: 'liveness',
    });
  });
});
