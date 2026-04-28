import { test, expect } from '@playwright/test';

const CPF   = '11122233344';
const SENHA = 'teste123';
const LS_KEY = 'incentivabr_token';

test.describe('Auth — fluxo de login no browser', () => {
  test('login com CPF e senha corretos → token no localStorage + redireciona', async ({ page }) => {
    await page.goto('/login.html');

    await expect(page.locator('#loginCpfEmail')).toBeVisible();
    await page.fill('#loginCpfEmail', CPF);
    await page.fill('#loginSenha', SENHA);
    await page.click('#loginBtn');

    // após login, auth.js salva o token e redireciona após 1s de timeout
    await page.waitForFunction(
      key => !!localStorage.getItem(key),
      LS_KEY,
      { timeout: 8_000 }
    );
    const token = await page.evaluate(k => localStorage.getItem(k), LS_KEY);
    expect(token).toBeTruthy();
    expect(token?.split('.')).toHaveLength(3); // formato JWT

    // aguarda o redirect para dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
  });

  test('senha errada → toast de erro visível', async ({ page }) => {
    await page.goto('/login.html');

    await page.fill('#loginCpfEmail', CPF);
    await page.fill('#loginSenha', 'senha_errada');
    await page.click('#loginBtn');

    // toast aparece com classe de erro
    await expect(page.locator('.toast-container .toast')).toBeVisible({ timeout: 8_000 });
    // deve continuar na página de login (não redireciona)
    await expect(page).toHaveURL(/login/);
  });

  test('campos vazios → não redireciona', async ({ page }) => {
    await page.goto('/login.html');
    await page.click('#loginBtn');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Auth — logout', () => {
  test('depois do login, token JWT está no localStorage', async ({ page }) => {
    await page.goto('/login.html');
    await page.fill('#loginCpfEmail', CPF);
    await page.fill('#loginSenha', SENHA);
    await page.click('#loginBtn');

    await page.waitForFunction(
      key => !!localStorage.getItem(key),
      LS_KEY,
      { timeout: 8_000 }
    );

    const token = await page.evaluate(k => localStorage.getItem(k), LS_KEY);
    expect(token).toBeTruthy();
    expect(token?.split('.')).toHaveLength(3);
  });
});
