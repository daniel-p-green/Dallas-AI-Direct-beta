import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test.describe('ui mobile audit', () => {
  test('signup has no horizontal scroll at 375x812', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded' });

    const noHorizontalScroll = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth <= el.clientWidth;
    });

    expect(noHorizontalScroll).toBeTruthy();
  });

  test('room does not show email-like text and shows session context', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/room`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Session:')).toBeVisible();

    const bodyText = (await page.locator('body').innerText()) || '';
    expect(bodyText).not.toContain('@');
  });
});
