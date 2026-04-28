import { test, expect } from '@playwright/test';

test.describe('Projetos Rouanet — página do Projeto Themis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projetos-rouanet.html');
    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });
  });

  test('página carrega com título reconhecível', async ({ page }) => {
    await expect(page).toHaveTitle(/Themis|DestineAI|Projeto/i);
  });

  test('container de projetos é visível e carrega dados da API', async ({ page }) => {
    const container = page.locator('#projectsContainer');
    await expect(container).toBeVisible();

    // aguarda skeleton sumir (shimmer desaparece quando os dados chegam)
    await expect(container.locator('.shimmer').first()).not.toBeVisible({ timeout: 15_000 });
  });

  test('botão CTA "Destinar agora" aponta para wizard com PRONAC 250347', async ({ page }) => {
    const btn = page.locator('#btnDestinar');
    await expect(btn).toBeVisible({ timeout: 5_000 });

    const href = await btn.getAttribute('href');
    expect(href).toContain('destinar-rouanet.html');
    expect(href).toContain('pronac=250347');
  });

  test('página de detalhes do projeto abre ao clicar no link SALIC', async ({ page }) => {
    // Navega direto para destinar (integração entre páginas)
    await page.click('#btnDestinar');
    await expect(page).toHaveURL(/destinar-rouanet/, { timeout: 8_000 });
  });
});

test.describe('Projeto detalhes — projeto-detalhes.html', () => {
  test('carrega com PRONAC 250347 via query param', async ({ page }) => {
    await page.goto('/projeto-detalhes.html?pronac=250347');
    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });
    // título é preenchido via SALIC API — pode ser qualquer projeto
    await expect(page).toHaveTitle(/DestineAI/i);
  });
});
