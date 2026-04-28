import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { req } from './helpers.js';

describe('Calculator — POST /api/calculator/ir', () => {
  const BASE_BODY = { rendimentos_tributaveis: 120000, inss: 9000 };

  test('cálculo básico → 200 com todos os campos', async () => {
    const { status, body } = await req('POST', '/api/calculator/ir', { body: BASE_BODY });
    assert.equal(status, 200);
    assert.equal(body.status, 'success');
    assert.ok(typeof body.ir_devido === 'number', 'ir_devido deve ser número');
    assert.ok(typeof body.limites_doacao?.rouanet === 'number', 'limite_rouanet deve existir');
    assert.ok(body.pode_destinar === true, 'deve poder destinar');
  });

  test('limite Rouanet = 6% do IR devido', async () => {
    const { body } = await req('POST', '/api/calculator/ir', { body: BASE_BODY });
    const esperado = body.ir_devido * 0.06;
    assert.ok(
      Math.abs(body.limites_doacao.rouanet - esperado) < 0.02,
      `limite ${body.limites_doacao.rouanet} deve ser ~6% de ${body.ir_devido}`
    );
  });

  test('com dependentes → dedução aplicada', async () => {
    const { body: sem } = await req('POST', '/api/calculator/ir', { body: BASE_BODY });
    const { body: com } = await req('POST', '/api/calculator/ir', {
      body: { ...BASE_BODY, dependentes: 2 },
    });
    assert.ok(com.ir_devido < sem.ir_devido, 'IR com dependentes deve ser menor');
  });

  test('com saúde e educação → deduções aplicadas', async () => {
    const { status, body } = await req('POST', '/api/calculator/ir', {
      body: { ...BASE_BODY, deducao_saude: 5000, deducao_educacao: 3000 },
    });
    assert.equal(status, 200);
    assert.ok(body.deducoes.saude >= 0);
  });

  test('rendimentos zero → 400', async () => {
    const { status, body } = await req('POST', '/api/calculator/ir', {
      body: { rendimentos_tributaveis: 0 },
    });
    assert.equal(status, 400);
    assert.match(body.message, /maior que zero/i);
  });

  test('rendimentos negativos → 400', async () => {
    const { status } = await req('POST', '/api/calculator/ir', {
      body: { rendimentos_tributaveis: -1000 },
    });
    assert.equal(status, 400);
  });

  test('resposta tem campo fiscal_year = 2026', async () => {
    const { body } = await req('POST', '/api/calculator/ir', { body: BASE_BODY });
    assert.equal(body.fiscal_year, 2026);
    assert.equal(body.tipo_declaracao, 'completa');
  });
});

describe('Calculator — POST /api/calculator/limites-rapido', () => {
  test('ir_devido informado → limite 6%', async () => {
    const { status, body } = await req('POST', '/api/calculator/limites-rapido', {
      body: { ir_devido: 10000 },
    });
    assert.equal(status, 200);
    assert.ok(Math.abs(body.limites_doacao.rouanet - 600) < 0.02, 'limite deve ser R$600');
  });

  test('ir_devido zero → 400', async () => {
    const { status } = await req('POST', '/api/calculator/limites-rapido', {
      body: { ir_devido: 0 },
    });
    assert.equal(status, 400);
  });

  test('ir_devido acima de R$1M → 400', async () => {
    const { status } = await req('POST', '/api/calculator/limites-rapido', {
      body: { ir_devido: 1100000 },
    });
    assert.equal(status, 400);
  });
});

describe('Calculator — POST /api/calculator/distribuir', () => {
  test('distribuição válida dentro do limite → valid=true', async () => {
    const { status, body } = await req('POST', '/api/calculator/distribuir', {
      body: {
        ir_devido: 10000,
        distribuicao: [
          { pronac: '250347', valor: 300 },
          { pronac: '220001', valor: 200 },
        ],
      },
    });
    assert.equal(status, 200);
    assert.equal(body.valid, true);
    assert.equal(body.errors.length, 0);
  });

  test('distribuição acima de 6% → valid=false + errors', async () => {
    const { body } = await req('POST', '/api/calculator/distribuir', {
      body: {
        ir_devido: 10000,
        distribuicao: [{ pronac: '250347', valor: 800 }],
      },
    });
    assert.equal(body.valid, false);
    assert.ok(body.errors.length > 0, 'deve ter mensagem de erro');
  });

  test('PRONAC inválido → valid=false com erros (ou 400)', async () => {
    const { status, body } = await req('POST', '/api/calculator/distribuir', {
      body: {
        ir_devido: 10000,
        distribuicao: [{ pronac: 'abc', valor: 100 }],
      },
    });
    // API pode retornar 400 (rejeição imediata) ou 200 com valid=false
    if (status === 200) {
      assert.equal(body.valid, false);
      assert.ok(body.errors?.length > 0, 'deve ter mensagem de erro');
    } else {
      assert.equal(status, 400);
    }
  });

  test('distribuição vazia → 400', async () => {
    const { status } = await req('POST', '/api/calculator/distribuir', {
      body: { ir_devido: 10000, distribuicao: [] },
    });
    assert.equal(status, 400);
  });
});
