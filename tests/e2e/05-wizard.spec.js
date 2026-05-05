import { test, expect } from '@playwright/test';

const API_BASE = process.env.TEST_URL || 'http://localhost:3000';
const CPF      = '11122233344';
const SENHA    = 'teste123';
const LS_KEY   = 'incentivabr_token';

async function setAuthToken(page) {
  const res  = await page.request.post(`${API_BASE}/api/auth/login`, {
    data: { cpf: CPF, senha: SENHA },
  });
  const body = await res.json();
  if (!body.token) throw new Error(`Login falhou: ${JSON.stringify(body)}`);

  // injeta token e objeto user antes de qualquer navegação
  await page.addInitScript(({ key, token, user }) => {
    localStorage.setItem(key, token);
    localStorage.setItem('incentivabr_user', JSON.stringify(user));
  }, { key: LS_KEY, token: body.token, user: body.user });
}

test.describe('Wizard de Destinação — navegação entre steps', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthToken(page);
    await page.goto('/destinar-rouanet.html?pronac=261847');
    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });
    // aguarda o loading overlay desaparecer (pode demorar por chamada SALIC)
    await expect(page.locator('#loadingOverlay')).not.toBeVisible({ timeout: 20_000 });
  });

  test('step 1 — Orquestra das Periferias do DF carrega com PRONAC correto', async ({ page }) => {
    await expect(page.locator('#step1')).toBeVisible();
    await expect(page.locator('#tab1')).toHaveClass(/active/);
    // PRONAC chip deve ter 261847
    await expect(page.locator('#pronacChip')).toContainText('261847', { timeout: 10_000 });
  });

  test('step 1 → step 2 — clique em "Avançar"', async ({ page }) => {
    // primeiro btn-primary-rouanet dentro de #step1
    await page.locator('#step1 .btn-primary-rouanet').click();
    await expect(page.locator('#step2')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#tab2')).toHaveClass(/active/);
  });

  test('step 2 — cálculo rápido de IR exibe resultado', async ({ page }) => {
    await page.locator('#step1 .btn-primary-rouanet').click();
    await expect(page.locator('#step2')).toBeVisible();

    // campo IR direto (aba rápida, já ativa por padrão)
    await page.fill('#rapidaIRDevido', '10.000,00');

    await page.click('#btnCalcular');
    await expect(page.locator('#calcResultBox')).toBeVisible({ timeout: 8_000 });
  });

  test('step 3 — campo de valor e slider presentes', async ({ page }) => {
    // navega via click sequencial (sem usar window.goTo que pode não ser global)
    await page.locator('#step1 .btn-primary-rouanet').click();
    await expect(page.locator('#step2')).toBeVisible();

    // calcula para liberar o step 3
    await page.fill('#rapidaIRDevido', '10.000,00');
    await page.click('#btnCalcular');
    await expect(page.locator('#btnProStep3')).toBeVisible({ timeout: 8_000 });
    await page.click('#btnProStep3');

    await expect(page.locator('#step3')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#valorDestinar')).toBeVisible();
    await expect(page.locator('#valorSlider')).toBeVisible();
  });

  test('progress steps atualizados conforme navegação', async ({ page }) => {
    await page.locator('#step1 .btn-primary-rouanet').click();
    await expect(page.locator('#step2')).toBeVisible();

    // step 1 deve estar como "completed"
    await expect(page.locator('#tab1')).toHaveClass(/completed/);
    await expect(page.locator('#tab2')).toHaveClass(/active/);
  });
});
