/**
 * helpers.js — Utilitários compartilhados para os testes de API
 */

export const BASE = process.env.TEST_URL || 'http://localhost:3000';

export const TEST_USER = {
  cpf:   '11122233344',
  email: 'joao@teste.com',
  senha: 'teste123',
};

// CPF válido para testes de cadastro (diferente do test user)
export const NEW_USER = {
  cpf:   '52998224725',
  email: `novo_${Date.now()}@testdestineai.local`,
  nome:  'Usuário Teste Automático',
  senha: 'Senha@Teste123',
  phone: '61999990000',
};

/** Faz uma requisição HTTP e retorna { status, body } */
export async function req(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  } else if (ct.includes('application/pdf')) {
    data = await res.arrayBuffer();
  } else {
    data = await res.text();
  }

  return { status: res.status, body: data, headers: res.headers };
}

// Cache de tokens por CPF/email para evitar rate-limit entre suítes
const _tokenCache = new Map();

/** Faz login e devolve o JWT (cache por sessão de teste) */
export async function login(credentials = TEST_USER) {
  const key = credentials.cpf || credentials.email;
  if (_tokenCache.has(key)) return _tokenCache.get(key);

  const { body } = await req('POST', '/api/auth/login', {
    body: credentials.cpf
      ? { cpf: credentials.cpf, senha: credentials.senha }
      : { email: credentials.email, senha: credentials.senha },
  });
  if (!body.token) throw new Error(`Login falhou: ${JSON.stringify(body)}`);
  _tokenCache.set(key, body.token);
  return body.token;
}

/** Valida que o body tem os campos esperados */
export function hasFields(obj, ...fields) {
  return fields.every(f => f in obj);
}
