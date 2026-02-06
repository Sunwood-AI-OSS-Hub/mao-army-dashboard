import { test, expect } from '@playwright/test';

test.describe('Inbox 機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('チームカードをクリックしてモーダルを開き、メッセージタブを確認', async ({ page }) => {
    // チームカードが表示されるのを待つ
    await page.waitForSelector('[data-testid="team-card"]');

    // 最初のチームカードをクリック
    await page.locator('[data-testid="team-card"]').first().click();

    // モーダルが表示されるのを待つ
    await page.waitForSelector('[data-testid="team-modal"]');

    // メッセージタブをクリック
    await page.click('text=メッセージ');

    // メッセージタブがアクティブになるのを待つ
    await expect(page.locator('text=メッセージボックス')).toBeVisible();

    // スクリーンショットを撮る
    await page.screenshot({ path: 'test-results/inbox-view.png', fullPage: true });
  });

  test('inbox APIからデータが取得できる', async ({ request }) => {
    const response = await request.get('/api/inboxes/momotaro');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('teamName', 'momotaro');
    expect(data).toHaveProperty('agents');
    expect(data.agents).toBeInstanceOf(Array);
    expect(data.agents.length).toBeGreaterThan(0);

    // エージェントの構造を確認
    const firstAgent = data.agents[0];
    expect(firstAgent).toHaveProperty('agentId');
    expect(firstAgent).toHaveProperty('agentName');
    expect(firstAgent).toHaveProperty('messages');
    expect(firstAgent.messages).toBeInstanceOf(Array);
  });
});
