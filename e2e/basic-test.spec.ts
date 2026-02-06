import { test, expect } from '@playwright/test';

test.describe('魔王軍 AGI ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003');
  });

  test('ページが表示される', async ({ page }) => {
    // タイトルを確認
    await expect(page).toHaveTitle(/魔王軍 AGI ダッシュボード/);

    // ダークモードが適用されている
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('チームカードが表示される', async ({ page }) => {
    // チームカードが表示されるまで待機
    await page.waitForSelector('[data-testid="team-card"]', { timeout: 10000 });

    // チームカードが少なくとも1つ表示されている
    const teamCards = page.locator('[data-testid="team-card"]');
    const count = await teamCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('チームカードをクリックすると詳細が表示される', async ({ page }) => {
    // チームカードが表示されるまで待機
    await page.waitForSelector('[data-testid="team-card"]', { timeout: 10000 });

    // 最初のチームカードをクリック
    const firstCard = page.locator('[data-testid="team-card"]').first();
    await firstCard.click();

    // モーダルが表示される
    const modal = page.locator('[data-testid="team-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('モーダルを閉じることができる', async ({ page }) => {
    // チームカードをクリックしてモーダルを開く
    await page.waitForSelector('[data-testid="team-card"]', { timeout: 10000 });
    const firstCard = page.locator('[data-testid="team-card"]').first();
    await firstCard.click();

    // モーダルが表示される
    const modal = page.locator('[data-testid="team-modal"]');
    await expect(modal).toBeVisible();

    // 閉じるボタンをクリック
    const closeButton = page.locator('[data-testid="modal-close"]');
    await closeButton.click();

    // モーダルが閉じる
    await expect(modal).not.toBeVisible();
  });

  test('リフレッシュボタンが動作する', async ({ page }) => {
    // リフレッシュボタンを探す
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    await expect(refreshButton).toBeVisible();

    // クリック
    await refreshButton.click();

    // ページが更新される（チームカードが再表示される）
    await page.waitForSelector('[data-testid="team-card"]', { timeout: 10000 });
    const teamCards = page.locator('[data-testid="team-card"]');
    const count = await teamCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
