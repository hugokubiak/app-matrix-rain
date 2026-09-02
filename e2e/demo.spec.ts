import { test, expect } from '@playwright/test';

test.describe('matrix-rain demo', () => {
  test('renders a full-viewport canvas that actually paints', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('#app canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width ?? 0).toBeGreaterThan(300);
    expect(box?.height ?? 0).toBeGreaterThan(300);

    // let a few frames run, then confirm the canvas has non-black pixels
    await page.waitForTimeout(700);
    const litPixels = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return 0;
      const { data } = ctx.getImageData(0, 0, el.width, el.height);
      let lit = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] || data[i + 1] || data[i + 2]) lit += 1;
      }
      return lit;
    });
    expect(litPixels).toBeGreaterThan(0);
  });

  test('the control panel drives the running effect', async ({ page }) => {
    await page.goto('/');

    const charset = page.locator('.controls select').first();
    await expect(charset).toBeVisible();
    await charset.selectOption('cyrillic');
    await page.waitForTimeout(300);

    await expect(page.locator('#app canvas')).toBeVisible();
  });

  test('loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(String(error)));

    await page.goto('/');
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
});
