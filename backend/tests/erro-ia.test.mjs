// A TINA dizia "Erro ao processar sua mensagem. Tente novamente." para tudo.
//
// Para dois dos motivos possiveis esse conselho e falso: com a chave revogada
// ou o credito no fim, tentar de novo nao funciona nunca. O destinador insiste
// numa tela que nao vai mudar, e do lado de ca ninguem fica sabendo — o log
// tambem dizia so "Erro".
//
// A armadilha que estes testes guardam: **credito esgotado e falta de permissao
// voltam os dois 403**. So o campo `type` do corpo separa um do outro. Decidir
// por status sozinho junta as duas coisas e apaga a unica que tem conserto
// (colocar dinheiro).
import { classificaErroIA, leErroDoSdk } from '../src/lib/erroIA.js';

const ok = [], falhas = [];
const teste = (nome, fn) => {
  try { fn(); ok.push(nome); } catch (e) { falhas.push([nome, e.message]); }
};

teste('chave revogada nao manda tentar de novo', () => {
  const r = classificaErroIA(401, 'authentication_error');
  if (r.causa !== 'chave_invalida') throw new Error('causa: ' + r.causa);
  if (r.passageiro) throw new Error('marcou como passageiro — o usuario vai insistir a toa');
  if (/tente de novo|tente novamente/i.test(r.usuario)) {
    throw new Error('a mensagem ainda manda tentar de novo');
  }
});

teste('credito esgotado e distinguido de falta de permissao', () => {
  // Os dois sao 403. Se a decisao olhasse so o status, isto colapsaria.
  const semCredito = classificaErroIA(403, 'billing_error');
  const semPermissao = classificaErroIA(403, 'permission_error');
  if (semCredito.causa !== 'sem_credito') throw new Error('credito: ' + semCredito.causa);
  if (semPermissao.causa !== 'sem_permissao') throw new Error('permissao: ' + semPermissao.causa);
  if (!/fundos|recarga/i.test(semCredito.operador)) {
    throw new Error('a mensagem ao operador nao diz o que fazer');
  }
});

teste('limite de uso e o unico caso que manda tentar de novo', () => {
  const r = classificaErroIA(429, 'rate_limit_error');
  if (!r.passageiro) throw new Error('429 e transitorio');
  if (!/tente de novo/i.test(r.usuario)) throw new Error('deveria convidar a tentar');
});

teste('servico instavel e rede sao transitorios', () => {
  for (const [s, t] of [[500, 'api_error'], [529, 'overloaded_error'], [undefined, undefined]]) {
    if (!classificaErroIA(s, t).passageiro) throw new Error(`status ${s} nao marcado transitorio`);
  }
});

teste('nenhuma mensagem ao usuario expoe detalhe interno', () => {
  const casos = [[401, 'authentication_error'], [403, 'billing_error'], [403, 'permission_error'],
                 [429, 'rate_limit_error'], [500, 'api_error'], [undefined, undefined],
                 [400, 'invalid_request_error']];
  for (const [s, t] of casos) {
    const { usuario } = classificaErroIA(s, t);
    if (/anthropic|api[_ ]key|chave|token|http/i.test(usuario)) {
      throw new Error(`vazou detalhe interno em ${s}/${t}: ${usuario}`);
    }
  }
});

teste('le o erro do SDK em qualquer dos formatos', () => {
  // O formato varia por versao do SDK. O que nao pode e perder a distincao
  // entre "tente de novo" e "nao adianta".
  const formatos = [
    { status: 401, error: { type: 'authentication_error' } },
    { status: 403, error: { error: { type: 'billing_error' } } },
    { statusCode: 429, type: 'rate_limit_error' },
    { response: { status: 500 } },
    new Error('getaddrinfo ENOTFOUND api.anthropic.com')
  ];
  const esperado = ['chave_invalida', 'sem_credito', 'limite_de_uso', 'servico_instavel', 'rede'];
  formatos.forEach((e, i) => {
    const r = leErroDoSdk(e);
    if (r.causa !== esperado[i]) throw new Error(`formato ${i}: ${r.causa} != ${esperado[i]}`);
  });
});

teste('erro sem nenhum campo conhecido nao vira "tente de novo"', () => {
  // Cair no caso passageiro por omissao seria repetir o bug original.
  const r = classificaErroIA(418, undefined);
  if (r.passageiro) throw new Error('status desconhecido tratado como transitorio');
});

console.log('\n================================================================');
ok.forEach(n => console.log('  ok   ', n));
falhas.forEach(([n, e]) => console.log('  FALHA', n, '\n          ' + e));
console.log('================================================================');
console.log(`${ok.length} passaram, ${falhas.length} falharam\n`);
process.exit(falhas.length ? 1 : 0);
