import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { req } from './helpers.js';

const PRONAC_THEMIS = '250347';

describe('SALIC — GET /api/salic/projetos', () => {
  test('lista projetos → 200 + array', async () => {
    const { status, body } = await req('GET', '/api/salic/projetos?limit=5');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.projetos), 'projetos deve ser array');
    assert.ok(['SALIC API — Ministério da Cultura', 'cache_salic', 'demo'].includes(body.source),
      `source inesperado: ${body.source}`);
  });

  test('filtro por área de Música → retorna resultados', async () => {
    const { body } = await req('GET', '/api/salic/projetos?area=01&limit=10');
    assert.ok(Array.isArray(body.projetos));
  });

  test('busca por UF=DF → retorna resultados', async () => {
    const { body } = await req('GET', '/api/salic/projetos?UF=DF&limit=10');
    assert.ok(Array.isArray(body.projetos));
  });

  test('cada projeto tem campos obrigatórios', async () => {
    const { body } = await req('GET', '/api/salic/projetos?limit=3');
    for (const p of body.projetos) {
      assert.ok(p.pronac || p.PRONAC, `projeto sem PRONAC: ${JSON.stringify(p)}`);
    }
  });
});

describe('SALIC — GET /api/salic/projetos/:pronac', () => {
  test('PRONAC Themis (250347) → 200 ou fallback', async () => {
    const { status, body } = await req(`GET`, `/api/salic/projetos/${PRONAC_THEMIS}`);
    assert.ok(
      status === 200 || status === 404 || status === 502,
      `esperado 200/404/502 (SALIC pode estar instável), recebido ${status}`
    );
    if (status === 200) {
      assert.ok(body.projeto || body.projetos, 'deve ter dados do projeto');
    }
  });

  test('PRONAC inválido (letras) → 400', async () => {
    const { status, body } = await req('GET', '/api/salic/projetos/abc123xyz');
    assert.equal(status, 400);
    assert.match(body.message, /PRONAC/i);
  });

  test('PRONAC inexistente → 404 ou 200 com demo (ou 5xx se SALIC instável)', async () => {
    const { status } = await req('GET', '/api/salic/projetos/999999');
    assert.ok(
      status === 404 || status === 200 || status === 502 || status === 503,
      `status inesperado: ${status}`
    );
  });
});

describe('SALIC — GET /api/salic/org-project', () => {
  test('retorna projeto da org DestineAI (slug www)', async () => {
    const { status, body } = await req('GET', '/api/salic/org-project');
    assert.ok(
      status === 200 || status === 404 || status === 502,
      `status inesperado: ${status}`
    );
    if (status === 200) {
      assert.ok(body.organizacao, 'deve ter dados da organização');
      assert.ok(body.organizacao.slug, 'organização deve ter slug');
    }
  });
});

describe('SALIC — GET /api/salic/areas', () => {
  test('retorna lista de áreas culturais', async () => {
    const { status, body } = await req('GET', '/api/salic/areas');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.areas), 'areas deve ser array');
  });
});
