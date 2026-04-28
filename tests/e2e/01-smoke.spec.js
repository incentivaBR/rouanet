import { test, expect } from '@playwright/test';

// Páginas acessíveis sem autenticação com nav+footer completos
const FULL_LAYOUT_PAGES = [
  { path: '/',                          title: /DestineAI/i },
  { path: '/calculadora.html',          title: /MeuLimite|DestineAI/i },
  { path: '/projetos-rouanet.html',     title: /Themis|DestineAI/i },
  { path: '/projeto-detalhes.html',     title: /Projeto|DestineAI/i },
  { path: '/como-funciona.html',        title: /funciona/i },
  { path: '/faq.html',                  title: /perguntas|faq/i },
  { path: '/guia-ir-servidor.html',     title: /guia|servidor/i },
  { path: '/impacto.html',              title: /impacto/i },
  { path: '/passo-a-passo.html',        title: /passo/i },
  { path: '/politica-privacidade.html', title: /privacidade/i },
  { path: '/termos-uso.html',           title: /termos/i },
];

// Páginas sem nav/footer (layout.js com skipNav:true, skipFooter:true)
const NO_NAV_PAGES = [
  { path: '/login.html', title: /entrar|login|DestineAI/i },
];

for (const { path, title } of FULL_LAYOUT_PAGES) {
  test(`smoke: ${path} — layout completo`, async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(path);

    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });
    await expect(page.locator('#daiNav')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('.dai-footer')).toBeVisible();
    await expect(page).toHaveTitle(title);

    const critical = consoleErrors.filter(e =>
      !e.includes('net::ERR') &&
      !e.includes('CORS') &&
      !e.includes('Failed to fetch') &&
      !e.includes('NetworkError')
    );
    expect(critical, `Erros JS em ${path}: ${critical.join('; ')}`).toHaveLength(0);
  });
}

for (const { path, title } of NO_NAV_PAGES) {
  test(`smoke: ${path} — sem nav (skipNav)`, async ({ page }) => {
    await page.goto(path);
    // login usa skipNav + skipFooter — apenas verifica dai-ready e título
    await expect(page.locator('body')).toHaveClass(/dai-ready/, { timeout: 8_000 });
    await expect(page).toHaveTitle(title);
    await expect(page.locator('#loginForm')).toBeVisible();
  });
}

test('GET /api/nao-existe devolve 404 JSON', async ({ request }) => {
  const res = await request.get('/api/nao-existe');
  expect(res.status()).toBe(404);
  const body = await res.json();
  expect(body.status).toBe('error');
});
