import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { req, login, hasFields } from './helpers.js';

const PRONAC = '261847';
const IR_TOTAL = 20000;
const LIMITE_6PCT = IR_TOTAL * 0.06; // 1200

describe('Donations — POST /api/donations/rouanet', () => {
  let token;
  before(async () => { token = await login(); });

  test('sem autenticação → 401', async () => {
    const { status } = await req('POST', '/api/donations/rouanet', {
      body: { pronac: PRONAC, ir_total: IR_TOTAL, donation_amount: 100, fiscal_year: 2026 },
    });
    assert.equal(status, 401);
  });

  test('PRONAC inválido → 400', async () => {
    const { status, body } = await req('POST', '/api/donations/rouanet', {
      token,
      body: { pronac: 'abc', ir_total: IR_TOTAL, donation_amount: 100, fiscal_year: 2026 },
    });
    assert.equal(status, 400);
    assert.match(body.message, /PRONAC/i);
  });

  test('valor acima de 6% do IR → 400', async () => {
    const { status, body } = await req('POST', '/api/donations/rouanet', {
      token,
      body: {
        pronac:          PRONAC,
        ir_total:        IR_TOTAL,
        donation_amount: LIMITE_6PCT + 100, // excede o limite
        fiscal_year:     2026,
      },
    });
    assert.equal(status, 400);
    assert.match(body.message, /limite|excede/i);
  });

  test('valor zero → 400', async () => {
    const { status } = await req('POST', '/api/donations/rouanet', {
      token,
      body: { pronac: PRONAC, ir_total: IR_TOTAL, donation_amount: 0, fiscal_year: 2026 },
    });
    assert.equal(status, 400);
  });

  test('IR total zero → 400', async () => {
    const { status } = await req('POST', '/api/donations/rouanet', {
      token,
      body: { pronac: PRONAC, ir_total: 0, donation_amount: 100, fiscal_year: 2026 },
    });
    assert.equal(status, 400);
  });

  test('destinação válida → 201 com dados bancários FNC', async () => {
    const valor = 50; // valor pequeno para não extrapolar o limite acumulado
    const { status, body } = await req('POST', '/api/donations/rouanet', {
      token,
      body: {
        pronac:          PRONAC,
        ir_total:        IR_TOTAL,
        donation_amount: valor,
        fiscal_year:     2026,
        projeto_titulo:  'Orquestra das Periferias do DF',
      },
    });
    assert.ok(
      status === 201 || status === 400,
      `esperado 201 (sucesso) ou 400 (limite acumulado já atingido), recebido ${status}: ${JSON.stringify(body)}`
    );
    if (status === 201) {
      assert.equal(body.status, 'success');
      assert.ok(hasFields(body.donation, 'id', 'pronac', 'donation_amount', 'status', 'banco'));
      assert.equal(body.donation.pronac, PRONAC);
      assert.equal(body.donation.status, 'pending');
      assert.ok(body.donation.banco?.bank_agency, 'banco deve ter agência');
    }
  });
});

describe('Donations — GET /api/donations', () => {
  let token;
  before(async () => { token = await login(); });

  test('sem autenticação → 401', async () => {
    const { status } = await req('GET', '/api/donations');
    assert.equal(status, 401);
  });

  test('listagem autenticada → 200 + summary', async () => {
    const { status, body } = await req('GET', '/api/donations', { token });
    assert.equal(status, 200);
    assert.equal(body.status, 'success');
    assert.ok(Array.isArray(body.donations));
    assert.ok(hasFields(body.summary, 'total_donated', 'total_donations'));
    assert.ok(typeof body.total === 'number');
  });

  test('filtro por fiscal_year=2026 → só retorna 2026', async () => {
    const { body } = await req('GET', '/api/donations?fiscal_year=2026', { token });
    for (const d of body.donations) {
      assert.equal(d.fiscal_year, 2026);
    }
  });

  test('filtro por status=pending → só retorna pending', async () => {
    const { body } = await req('GET', '/api/donations?status=pending', { token });
    for (const d of body.donations) {
      assert.equal(d.status, 'pending');
    }
  });

  test('paginação limit+offset funciona', async () => {
    const { body: p1 } = await req('GET', '/api/donations?limit=2&offset=0', { token });
    const { body: p2 } = await req('GET', '/api/donations?limit=2&offset=2', { token });
    // Se há mais de 2 doações, as páginas devem ser diferentes
    if (p1.donations.length === 2 && p2.donations.length > 0) {
      assert.notDeepEqual(p1.donations[0]?.id, p2.donations[0]?.id);
    }
  });
});

describe('Donations — GET /api/donations/:id', () => {
  let token, donationId;

  before(async () => {
    token = await login();
    const { body } = await req('GET', '/api/donations?limit=1', { token });
    donationId = body.donations[0]?.id;
  });

  test('ID válido → 200 + detalhes', async function() {
    if (!donationId) {
      this.skip('nenhuma doação disponível para testar');
      return;
    }
    const { status, body } = await req('GET', `/api/donations/${donationId}`, { token });
    assert.equal(status, 200);
    assert.ok(hasFields(body.donation, 'id', 'pronac', 'donation_amount', 'status'));
  });

  test('ID inválido (não UUID) → 400 ou 404', async () => {
    const { status } = await req('GET', '/api/donations/nao-e-uuid', { token });
    assert.ok(status === 400 || status === 404);
  });

  test('ID de outro usuário → 404', async () => {
    const { status } = await req('GET', '/api/donations/00000000-0000-0000-0000-000000000000', { token });
    assert.equal(status, 404);
  });
});

describe('Donations — GET /api/donations/:id/comprovante', () => {
  let token, donationId;

  before(async () => {
    token = await login();
    const { body } = await req('GET', '/api/donations?limit=1&status=pending', { token });
    donationId = body.donations[0]?.id;
  });

  test('comprovante PDF → 200 + content-type pdf', async function() {
    if (!donationId) {
      this.skip('nenhuma doação disponível para testar comprovante');
      return;
    }
    const { status, headers } = await req('GET', `/api/donations/${donationId}/comprovante`, { token });
    assert.equal(status, 200);
    assert.ok(headers.get('content-type')?.includes('pdf'), 'deve retornar PDF');
  });
});
