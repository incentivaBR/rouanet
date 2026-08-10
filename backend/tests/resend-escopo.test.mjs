// Chave de e-mail: "funcionando" nao e a mesma pergunta que "a chave certa".
//
// Os codigos do Resend sao o contrario do que a intuicao sugere — chave
// invalida devolve 403, chave restrita devolve 401 — e e exatamente o tipo de
// detalhe que se inverte sem querer numa refatoracao. Estes testes fixam a
// leitura correta, e nenhum deles toca a rede.
import { classificaEscopoResend, escopoDaChaveResend } from '../src/lib/resendEscopo.js';

const ok = [], falhas = [];
const teste = async (nome, fn) => {
  try { await fn(); ok.push(nome); } catch (e) { falhas.push([nome, e.message]); }
};

await teste('chave que lista dominios e ampla demais', () => {
  const r = classificaEscopoResend(200, { data: [{ name: 'incentivabr.com.br' }] });
  if (r.escopo !== 'ampla') throw new Error('escopo: ' + r.escopo);
  if (r.ok) throw new Error('deu por boa uma chave full_access');
});

await teste('restricted_api_key (401) e o escopo desejado', () => {
  // O 401 aqui NAO e falha: e o Resend dizendo que a chave so envia.
  const r = classificaEscopoResend(401, {
    name: 'restricted_api_key',
    message: 'This API key is restricted to only send emails.'
  });
  if (r.escopo !== 'somente_envio') throw new Error('escopo: ' + r.escopo);
  if (!r.ok) throw new Error('reprovou a chave correta');
});

await teste('invalid_api_key (403) e chave revogada, nao restrita', () => {
  // Se alguem trocar a decisao por status em vez de `name`, este inverte.
  const r = classificaEscopoResend(403, { name: 'invalid_api_key', message: 'API key is invalid.' });
  if (r.escopo !== 'invalida') throw new Error('escopo: ' + r.escopo);
  if (r.ok) throw new Error('deu por boa uma chave revogada');
});

await teste('resposta desconhecida nao vira aprovacao', () => {
  for (const [s, c] of [[500, {}], [429, { name: 'rate_limit_exceeded' }], [200, null]]) {
    const r = classificaEscopoResend(s, c);
    if (r.ok && s !== 200) throw new Error(`aprovou HTTP ${s}`);
  }
});

await teste('sem chave configurada, diz ausente', async () => {
  const antes = [process.env.RESEND_API_KEY, process.env.SMTP_PASS];
  delete process.env.RESEND_API_KEY; delete process.env.SMTP_PASS;
  const r = await escopoDaChaveResend();
  if (antes[0]) process.env.RESEND_API_KEY = antes[0];
  if (antes[1]) process.env.SMTP_PASS = antes[1];
  if (r.escopo !== 'ausente') throw new Error('escopo: ' + r.escopo);
});

await teste('Resend fora do ar nao vira "ok"', async () => {
  // Dizer ok sem resposta seria pior do que calar: daria por verificado o que
  // nao foi, justamente no momento em que alguem confere se girou a chave.
  process.env.RESEND_API_KEY = 're_qualquer_coisa';
  const r = await escopoDaChaveResend(async () => { throw new Error('rede fora'); });
  delete process.env.RESEND_API_KEY;
  if (r.ok) throw new Error('aprovou sem resposta do Resend');
  if (r.escopo !== 'indeterminado') throw new Error('escopo: ' + r.escopo);
});

await teste('a chave nunca aparece no resultado', async () => {
  const CHAVE = 're_segredo_que_nao_pode_sair_1234';
  process.env.RESEND_API_KEY = CHAVE;
  let cabecalhoRecebido = null;
  const r = await escopoDaChaveResend(async (_url, opcoes) => {
    cabecalhoRecebido = opcoes.headers.Authorization;
    return { status: 401, json: async () => ({ name: 'restricted_api_key' }) };
  });
  delete process.env.RESEND_API_KEY;
  if (!cabecalhoRecebido?.includes(CHAVE)) throw new Error('a chave nem foi enviada');
  if (JSON.stringify(r).includes(CHAVE)) throw new Error('a chave voltou no resultado');
});

console.log('\n================================================================');
ok.forEach(n => console.log('  ok   ', n));
falhas.forEach(([n, e]) => console.log('  FALHA', n, '\n          ' + e));
console.log('================================================================');
console.log(`${ok.length} passaram, ${falhas.length} falharam\n`);
process.exit(falhas.length ? 1 : 0);
