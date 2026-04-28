import { test } from 'node:test';
import assert from 'node:assert/strict';
import { req, BASE } from './helpers.js';

test('GET /health — servidor respondendo', async () => {
  const { status, body } = await req('GET', '/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
  assert.ok(typeof body.uptime === 'number');
});

test('GET /db-test — banco conectado', async () => {
  const { status, body } = await req('GET', '/db-test');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('GET / — frontend servido pelo backend', async () => {
  const res = await fetch(BASE + '/');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes('DestineAI'), 'index.html deve conter "DestineAI"');
});

test('GET /login.html — página de login disponível', async () => {
  const res = await fetch(BASE + '/login.html');
  assert.equal(res.status, 200);
});

test('GET /rota-que-nao-existe/api — 404 JSON para rotas /api/*', async () => {
  const { status, body } = await req('GET', '/api/nao-existe');
  assert.equal(status, 404);
  assert.equal(body.status, 'error');
});
