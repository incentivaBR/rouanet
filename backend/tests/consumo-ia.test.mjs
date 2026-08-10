// A chave da Anthropic e uma so, da IncentivaBR: toda pergunta a TINA em
// qualquer white label sai da mesma conta. O cliente nao paga, nao ve, e nao
// tem como saber que gastou.
//
// Isso e defensavel enquanto duas coisas forem verdade: que da para saber
// quanto cada cliente consome, e que existe um teto. Nenhuma das duas era.
// `/api/chat/tina` e publico, e a unica barreira era o limitador global de 300
// requisicoes por 15 minutos por IP — 1.200 perguntas/hora, cerca de US$ 86 por
// dia, de um unico IP. Com recarga automatica ligada, isso deixa de ser um
// servico que cai e passa a ser uma fatura que cresce.
import { custoDaChamada, registraConsumo, estourouOTeto, consumoDeHoje, limpaConsumo }
  from '../src/lib/consumoIA.js';

const ok = [], falhas = [];
const teste = (nome, fn) => {
  limpaConsumo();
  delete process.env.TETO_DIARIO_IA_USD;
  try { fn(); ok.push(nome); } catch (e) { falhas.push([nome, e.message]); }
};

const perto = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;

teste('cobra cada tipo de token pelo seu preco', () => {
  // 1M de cada, para a conta ficar legivel: 1.00 + 5.00 + 1.25 + 0.10
  const c = custoDaChamada({
    input_tokens: 1e6, output_tokens: 1e6,
    cache_creation_input_tokens: 1e6, cache_read_input_tokens: 1e6
  });
  if (!perto(c, 7.35, 1e-6)) throw new Error('custo: ' + c);
});

teste('leitura de cache custa um decimo da entrada', () => {
  // E o que faz a conta fechar barata: a base de 9,3k tokens vai em toda
  // pergunta, mas relida do cache. Se este fator inverter, o custo decuplica.
  const entrada = custoDaChamada({ input_tokens: 1e6 });
  const cache = custoDaChamada({ cache_read_input_tokens: 1e6 });
  if (!perto(entrada / cache, 10, 1e-6)) throw new Error('razao: ' + entrada / cache);
});

teste('uma pergunta tipica custa fracao de centavo', () => {
  const c = custoDaChamada({
    cache_read_input_tokens: 8500, input_tokens: 800, output_tokens: 250
  });
  if (c > 0.005) throw new Error('caro demais para o modelo esperado: ' + c);
  if (c < 0.0005) throw new Error('barato demais — precos provavelmente zerados: ' + c);
});

teste('separa o consumo por organizacao', () => {
  registraConsumo('casa-azul', { input_tokens: 1000, output_tokens: 500 });
  registraConsumo('casa-azul', { input_tokens: 1000, output_tokens: 500 });
  registraConsumo('outro-cliente', { input_tokens: 1000, output_tokens: 500 });

  const r = consumoDeHoje();
  if (r.por_organizacao.length !== 2) throw new Error('orgs: ' + r.por_organizacao.length);
  const casa = r.por_organizacao.find(o => o.org === 'casa-azul');
  if (casa.perguntas !== 2) throw new Error('perguntas: ' + casa.perguntas);
  // Sem separar, "quanto me custa este cliente?" nao tem resposta.
  if (!(casa.custo_usd > r.por_organizacao.find(o => o.org === 'outro-cliente').custo_usd)) {
    throw new Error('nao ordenou pelo maior gasto');
  }
});

teste('sem tenant, o consumo vai para www', () => {
  registraConsumo(undefined, { input_tokens: 100, output_tokens: 50 });
  const r = consumoDeHoje();
  if (r.por_organizacao[0].org !== 'www') throw new Error('org: ' + r.por_organizacao[0].org);
});

teste('o teto fecha a torneira da organizacao que estourou', () => {
  process.env.TETO_DIARIO_IA_USD = '0.01';
  if (estourouOTeto('casa-azul')) throw new Error('barrou antes de qualquer gasto');
  // 1M de tokens de saida = US$ 5, muito acima do teto de 1 centavo.
  registraConsumo('casa-azul', { output_tokens: 1e6 });
  if (!estourouOTeto('casa-azul')) throw new Error('nao barrou depois de estourar');
});

teste('o teto de uma organizacao nao derruba as outras', () => {
  process.env.TETO_DIARIO_IA_USD = '0.01';
  registraConsumo('cliente-abusivo', { output_tokens: 1e6 });
  if (!estourouOTeto('cliente-abusivo')) throw new Error('nao barrou quem abusou');
  if (estourouOTeto('casa-azul')) throw new Error('derrubou a TINA de quem nao gastou nada');
});

teste('o teto e por dia — ontem nao conta contra hoje', () => {
  process.env.TETO_DIARIO_IA_USD = '0.01';
  const ontem = new Date('2026-08-09T12:00:00Z');
  const hoje = new Date('2026-08-10T12:00:00Z');
  registraConsumo('casa-azul', { output_tokens: 1e6 }, ontem);
  if (estourouOTeto('casa-azul', hoje)) throw new Error('o gasto de ontem barrou hoje');
  if (consumoDeHoje(hoje).por_organizacao.length !== 0) {
    throw new Error('o resumo de hoje mostrou o gasto de ontem');
  }
});

teste('campos ausentes ou lixo nao viram NaN', () => {
  // usage vindo torto do SDK nao pode contaminar o total e desligar o teto.
  registraConsumo('casa-azul', {});
  registraConsumo('casa-azul', { input_tokens: null, output_tokens: 'abc' });
  registraConsumo('casa-azul', undefined);
  const r = consumoDeHoje();
  if (!Number.isFinite(r.total_usd)) throw new Error('total virou ' + r.total_usd);
  if (r.perguntas !== 3) throw new Error('perguntas: ' + r.perguntas);
});

console.log('\n================================================================');
ok.forEach(n => console.log('  ok   ', n));
falhas.forEach(([n, e]) => console.log('  FALHA', n, '\n          ' + e));
console.log('================================================================');
console.log(`${ok.length} passaram, ${falhas.length} falharam\n`);
process.exit(falhas.length ? 1 : 0);
