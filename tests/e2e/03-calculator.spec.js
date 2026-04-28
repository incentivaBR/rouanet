import { test, expect } from '@playwright/test';

test.describe('Calculadora — fluxo completo no browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora.html');
    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });
  });

  test('formulário completo → exibe IR e limite Rouanet', async ({ page }) => {
    // a aba "Cálculo Completo" é exibida por padrão
    await expect(page.locator('#formCompleta')).toBeVisible();

    // preenche rendimentos (campo com máscara — digit-by-digit)
    await page.click('#rendimentos');
    await page.type('#rendimentos', '10000000'); // R$ 100.000,00

    await page.click('#inss');
    await page.type('#inss', '900000'); // R$ 9.000,00

    await page.click('#calcBtn');

    // aguarda a seção de resultado aparecer
    await expect(page.locator('#resultSection')).toBeVisible({ timeout: 8_000 });

    // IR deve ser um valor positivo
    const irText = await page.locator('#resIR').textContent();
    expect(irText).toMatch(/R\$\s*[\d.,]+/);

    // limite Rouanet deve aparecer
    const limText = await page.locator('#limRouanet').textContent();
    expect(limText).toMatch(/R\$\s*[\d.,]+/);
  });

  test('aba rápida — IR direto → limite 6%', async ({ page }) => {
    await page.click('#tabRapida');
    await expect(page.locator('#formRapida')).toBeVisible();

    await page.click('#irDireto');
    await page.type('#irDireto', '1000000'); // R$ 10.000,00

    await page.click('#calcRapidoBtn');

    // resultado deve conter algum valor
    await expect(page.locator('#resultSection')).toBeVisible({ timeout: 8_000 });
  });

  test('rendimentos zerados → não exibe resultado (validação de campo)', async ({ page }) => {
    // não preenche nada, tenta submeter
    await page.click('#calcBtn');
    // resultSection deve continuar oculto
    await expect(page.locator('#resultSection')).not.toBeVisible();
  });
});
