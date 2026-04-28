import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { req, login, TEST_USER, NEW_USER, hasFields } from './helpers.js';

describe('Auth — POST /api/auth/login', () => {
  test('login com CPF válido → 200 + token + user', async () => {
    const { status, body } = await req('POST', '/api/auth/login', {
      body: { cpf: TEST_USER.cpf, senha: TEST_USER.senha },
    });
    assert.equal(status, 200);
    assert.equal(body.status, 'success');
    assert.ok(body.token, 'deve retornar token JWT');
    assert.ok(hasFields(body.user, 'id', 'nome', 'email', 'cpf', 'organization'));
    assert.ok(body.user.organization?.slug, 'deve ter organização vinculada');
  });

  test('login com email válido → 200 + token', async () => {
    const { status, body } = await req('POST', '/api/auth/login', {
      body: { email: TEST_USER.email, senha: TEST_USER.senha },
    });
    assert.equal(status, 200);
    assert.ok(body.token);
  });

  test('senha errada → 401', async () => {
    const { status, body } = await req('POST', '/api/auth/login', {
      body: { cpf: TEST_USER.cpf, senha: 'senha_errada' },
    });
    assert.equal(status, 401);
    assert.equal(body.status, 'error');
  });

  test('campos ausentes → 400', async () => {
    const { status, body } = await req('POST', '/api/auth/login', {
      body: { email: TEST_USER.email },
    });
    assert.equal(status, 400);
    assert.equal(body.status, 'error');
  });

  test('CPF inexistente → 401', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      body: { cpf: '99999999999', senha: 'qualquer123' },
    });
    assert.equal(status, 401);
  });
});

describe('Auth — GET /api/auth/me', () => {
  let token;
  before(async () => { token = await login(); });

  test('token válido → 200 + perfil completo', async () => {
    const { status, body } = await req('GET', '/api/auth/me', { token });
    assert.equal(status, 200);
    assert.ok(hasFields(body.user, 'id', 'nome', 'email', 'cpf', 'total_donated', 'organization'));
    assert.equal(body.user.cpf, TEST_USER.cpf);
  });

  test('sem token → 401', async () => {
    const { status } = await req('GET', '/api/auth/me');
    assert.equal(status, 401);
  });

  test('token inválido → 401', async () => {
    const { status } = await req('GET', '/api/auth/me', { token: 'token.invalido.aqui' });
    assert.equal(status, 401);
  });
});

describe('Auth — POST /api/auth/register', () => {
  test('campos obrigatórios ausentes → 400', async () => {
    const { status, body } = await req('POST', '/api/auth/register', {
      body: { nome: 'Teste', email: 'x@x.com' },
    });
    assert.equal(status, 400);
    assert.equal(body.status, 'error');
  });

  test('CPF inválido → 400', async () => {
    const { status, body } = await req('POST', '/api/auth/register', {
      body: { cpf: '11111111111', nome: 'Teste', email: 'cpfinv@test.com', senha: 'Senha123!', accepted_terms: true },
    });
    assert.equal(status, 400);
    assert.match(body.message, /CPF/i);
  });

  test('senha curta → 400', async () => {
    const { status, body } = await req('POST', '/api/auth/register', {
      body: { cpf: NEW_USER.cpf, nome: 'Teste', email: 'curta@test.com', senha: '123', accepted_terms: true },
    });
    assert.equal(status, 400);
    assert.match(body.message, /senha/i);
  });

  test('sem aceitar termos → 400 (ou 429 se rate-limit)', async () => {
    const { status, body } = await req('POST', '/api/auth/register', {
      body: { cpf: NEW_USER.cpf, nome: 'Teste', email: 'termos@test.com', senha: 'Senha123!', accepted_terms: false },
    });
    if (status === 429) return; // rate-limit: não dá para testar agora
    assert.equal(status, 400);
    assert.match(body.message, /termos/i);
  });

  test('cadastro completo → 201 ou 409 (se CPF já existe)', async () => {
    const { status, body } = await req('POST', '/api/auth/register', {
      body: {
        cpf:            NEW_USER.cpf,
        nome:           NEW_USER.nome,
        email:          NEW_USER.email,
        senha:          NEW_USER.senha,
        phone:          NEW_USER.phone,
        accepted_terms: true,
      },
    });
    if (status === 429) return; // rate-limit ativo: skip
    assert.ok(
      status === 201 || status === 409,
      `esperado 201 ou 409, recebido ${status}: ${JSON.stringify(body)}`
    );
    if (status === 201) {
      assert.equal(body.status, 'success');
      assert.ok(hasFields(body.user, 'id', 'nome', 'email', 'cpf'));
    }
  });

  test('email duplicado → 409 (ou 429 se rate-limit)', async () => {
    const { status, body } = await req('POST', '/api/auth/register', {
      body: {
        cpf:            '12345678909',
        nome:           'Duplicado',
        email:          TEST_USER.email,
        senha:          'Senha123!',
        accepted_terms: true,
      },
    });
    if (status === 429) return; // rate-limit ativo: skip
    assert.equal(status, 409);
    assert.match(body.message, /email/i);
  });
});

describe('Auth — POST /api/auth/forgot-password', () => {
  test('email existente → 200 (sem revelar existência)', async () => {
    const { status, body } = await req('POST', '/api/auth/forgot-password', {
      body: { email: TEST_USER.email },
    });
    assert.equal(status, 200);
    assert.equal(body.status, 'success');
  });

  test('email inexistente → 200 (comportamento idêntico)', async () => {
    const { status, body } = await req('POST', '/api/auth/forgot-password', {
      body: { email: 'naoexiste@testdestineai.local' },
    });
    assert.equal(status, 200);
    assert.equal(body.status, 'success');
  });
});

describe('Auth — POST /api/auth/logout', () => {
  let token;
  before(async () => { token = await login(); });

  test('logout com token válido → 200 (ou 429 se rate-limit)', async () => {
    const { status, body } = await req('POST', '/api/auth/logout', { token });
    if (status === 429) return; // rate-limit ativo: skip
    assert.equal(status, 200);
    assert.equal(body.status, 'success');
  });
});
