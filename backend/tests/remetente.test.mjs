// O remetente preferido e o da marca do core. Se o provedor recusar o dominio
// por nao estar verificado, a mensagem NAO pode se perder: reenvia pelo
// remetente que ja funciona. Este teste troca o cliente do Resend por um dublê
// para exercitar os dois desfechos sem enviar nada.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ARQ = path.join(AQUI, '../src/services/emailService.js');

const ok = [], falhas = [];
const teste = async (nome, fn) => {
  try { await fn(); ok.push(nome); }
  catch (e) { falhas.push([nome, e.message]); }
};

// Carrega o modulo com um cliente Resend controlado por nos. Como resendClient
// e interno, montamos um modulo derivado que expoe doSend — mais honesto que
// mexer no original so para testar.
const fonte = fs.readFileSync(ARQ, 'utf8');
const derivado = fonte
  .replace("import { Resend } from 'resend';", '')
  .replace("import nodemailer from 'nodemailer';",
           'const nodemailer = { createTestAccount: async () => ({}), createTransport: () => ({}), getTestMessageUrl: () => "" };')
  + '\nexport { doSend as __doSend };'
  + '\nexport function __setResend(c) { resendClient = c; }';

// Fora do repositorio de proposito: no Windows o arquivo fica travado enquanto
// o modulo esta carregado, entao apagar depois nem sempre funciona. Na pasta
// temporaria do sistema, sobrar nao suja nada.
const tmp = path.join(os.tmpdir(), `emailService.derivado.${process.pid}.mjs`);
fs.writeFileSync(tmp, derivado, 'utf8');

let mod;
try {
  mod = await import('file://' + tmp.replace(/\\/g, '/'));
} finally {
  // remove ja: o arquivo e um detalhe do teste, nao um artefato do projeto
  setTimeout(() => { try { fs.unlinkSync(tmp); } catch (_) {} }, 100);
}

const dublê = (respostas) => {
  const enviados = [];
  let i = 0;
  return {
    enviados,
    emails: {
      send: async ({ from, to, subject }) => {
        enviados.push(from);
        return respostas[i++] ?? { data: { id: 'ok' } };
      }
    }
  };
};

delete process.env.SMTP_FROM;
delete process.env.BRAND_NAME;

await teste('remetente preferido e o da marca do core', async () => {
  const c = dublê([{ data: { id: 'x' } }]);
  mod.__setResend(c);
  await mod.__doSend({ to: 'a@b.com', subject: 's', html: '<p>x</p>' });
  if (c.enviados.length !== 1) throw new Error('enviou ' + c.enviados.length + ' vezes');
  if (!c.enviados[0].includes('contato@incentivabr.com.br'))
    throw new Error('remetente inesperado: ' + c.enviados[0]);
});

await teste('provedor recusa o dominio -> reenvia pelo anterior, sem perder', async () => {
  const c = dublê([
    { error: { message: 'The incentivabr.com.br domain is not verified' } },
    { data: { id: 'y' } }
  ]);
  mod.__setResend(c);
  await mod.__doSend({ to: 'a@b.com', subject: 's', html: '<p>x</p>' });
  if (c.enviados.length !== 2) throw new Error('nao reenviou (tentativas: ' + c.enviados.length + ')');
  if (!c.enviados[0].includes('incentivabr.com.br')) throw new Error('1a tentativa errada');
  if (!c.enviados[1].includes('destineai.com.br'))
    throw new Error('fallback errado: ' + c.enviados[1]);
});

await teste('erro que nao e de dominio propaga, sem reenvio cego', async () => {
  const c = dublê([{ error: { message: 'rate limit exceeded' } }]);
  mod.__setResend(c);
  let lancou = false;
  try { await mod.__doSend({ to: 'a@b.com', subject: 's', html: '<p>x</p>' }); }
  catch (_) { lancou = true; }
  if (!lancou) throw new Error('engoliu um erro que nao era de dominio');
  if (c.enviados.length !== 1) throw new Error('reenviou quando nao devia');
});

await teste('SMTP_FROM sobrepoe o padrao', async () => {
  process.env.SMTP_FROM = '"Casa Azul" <contato@casazul.org.br>';
  const c = dublê([{ data: { id: 'z' } }]);
  mod.__setResend(c);
  await mod.__doSend({ to: 'a@b.com', subject: 's', html: '<p>x</p>' });
  if (!c.enviados[0].includes('casazul.org.br'))
    throw new Error('ignorou SMTP_FROM: ' + c.enviados[0]);
  delete process.env.SMTP_FROM;
});

await teste('em producao, o link dos e-mails aponta para o dominio que atende', async () => {
  const antes = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const s = mod.getEmailStatus();
  if (s.appUrl !== 'https://www.incentivabr.com.br')
    throw new Error('appUrl: ' + s.appUrl);
  process.env.NODE_ENV = antes;
});

console.log('\n' + '='.repeat(64));
ok.forEach(n => console.log('  ok    ' + n));
falhas.forEach(([n, m]) => console.log('  FALHA ' + n + '\n          ' + m));
console.log('='.repeat(64));
console.log(`${ok.length} passaram, ${falhas.length} falharam`);
process.exit(falhas.length ? 1 : 0);
