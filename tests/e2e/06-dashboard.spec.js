import { test, expect } from '@playwright/test';

const API_BASE = process.env.TEST_URL || 'http://localhost:3000';
const CPF      = '11122233344';
const SENHA    = 'teste123';
const LS_KEY   = 'incentivabr_token';

async function loginAndSetToken(page) {
  const res  = await page.request.post(`${API_BASE}/api/auth/login`, {
    data: { cpf: CPF, senha: SENHA },
  });
  const body = await res.json();
  if (!body.token) throw new Error(`Login falhou: ${JSON.stringify(body)}`);

  await page.addInitScript(({ key, token, user }) => {
    localStorage.setItem(key, token);
    localStorage.setItem('incentivabr_user', JSON.stringify(user));
  }, { key: LS_KEY, token: body.token, user: body.user });
}

test.describe('Dashboard — usuário autenticado', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSetToken(page);
    await page.goto('/dashboard.html');
    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });
  });

  test('não redireciona — permanece no dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/, { timeout: 5_000 });
  });

  test('boas-vindas — elemento #welcomeTitle visível', async ({ page }) => {
    // elemento existe e é visível; texto é "Olá!" inicial ou "Ola, Nome!" após update
    await expect(page.locator('#welcomeTitle')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#welcomeTitle')).toContainText(/l/i); // "Olá" ou "Ola"
  });

  test('stats de destinações são exibidos', async ({ page }) => {
    await expect(page.locator('#statTotalDonated')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#statTotalDonations')).toBeVisible();
  });
});

test.describe('Dashboard — sem autenticação', () => {
  test('sem token → redireciona para login', async ({ page }) => {
    // nova página sem nenhum token no localStorage
    await page.goto('/dashboard.html');
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });
});

test.describe('Dashboard — nav autenticado', () => {
  test('nav mostra nome do usuário (não "Entrar")', async ({ page }) => {
    await loginAndSetToken(page);
    await page.goto('/dashboard.html');
    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });

    // layout.js troca "Entrar" pelo nome do usuário quando logado
    const navAuth = page.locator('#daiNavAuth');
    await expect(navAuth).not.toHaveText(/^Entrar$/i, { timeout: 8_000 });
  });
});
