/**
 * Quanto cada cliente gasta de IA, e onde isso para.
 *
 * A chave da Anthropic e uma so, da IncentivaBR. Toda pergunta feita a TINA em
 * qualquer white label sai da mesma conta — o cliente nao paga, nao ve, e nao
 * tem como saber que gastou. Isso e uma decisao comercial defensavel (o custo
 * cabe no setup), mas so enquanto duas coisas forem verdade: que da para saber
 * quanto cada um consome, e que existe um teto.
 *
 * Nenhuma das duas era verdade. `/api/chat/tina` e publico, sem login, e a
 * unica barreira era o limitador global de 300 requisicoes por 15 minutos por
 * IP — 1.200 perguntas/hora, cerca de US$ 86 por dia, de um unico IP. Com
 * recarga automatica ligada, isso deixa de ser um servico que cai e passa a ser
 * uma fatura que cresce.
 *
 * A contagem vive em memoria e zera a cada deploy. E de proposito: isto e uma
 * valvula de seguranca, nao contabilidade. Se um dia a cobranca por cliente
 * virar produto, o lugar disso e o banco.
 */

// Preços do claude-haiku-4-5, por milhão de tokens. Leitura de cache custa um
// décimo da entrada; é por isso que a conta fecha barata com uma base de 9,3k
// tokens repetida em toda pergunta.
const PRECO = {
  entrada:        1.00,
  saida:          5.00,
  cache_escrita:  1.25,
  cache_leitura:  0.10
};

// Teto diário por organização, em dólares. Um destinador atento faz umas dez
// perguntas; cem destinadores num dia dão cerca de US$ 3. O padrão deixa folga
// para um piloto inteiro e ainda assim fecha a torneira antes do prejuízo.
const TETO_PADRAO_USD = 5.00;

const porDia = new Map();   // 'YYYY-MM-DD::org' -> { tokens, custo, perguntas }

const chave = (org, agora) => `${agora.toISOString().slice(0, 10)}::${org || 'www'}`;

export function custoDaChamada(uso = {}) {
  const m = (n, preco) => ((Number(n) || 0) / 1e6) * preco;
  return m(uso.input_tokens, PRECO.entrada)
       + m(uso.output_tokens, PRECO.saida)
       + m(uso.cache_creation_input_tokens, PRECO.cache_escrita)
       + m(uso.cache_read_input_tokens, PRECO.cache_leitura);
}

export function registraConsumo(org, uso, agora = new Date()) {
  const k = chave(org, agora);
  const atual = porDia.get(k) || { org: org || 'www', tokens: 0, custo: 0, perguntas: 0 };
  atual.tokens += (Number(uso?.input_tokens) || 0) + (Number(uso?.output_tokens) || 0)
                + (Number(uso?.cache_read_input_tokens) || 0)
                + (Number(uso?.cache_creation_input_tokens) || 0);
  atual.custo += custoDaChamada(uso);
  atual.perguntas += 1;
  porDia.set(k, atual);
  return atual;
}

/**
 * A organização já gastou o que tinha para hoje?
 *
 * Verificado ANTES da chamada. Depois seria tarde: o gasto que estoura o teto
 * é justamente o que não deveria ter acontecido.
 */
export function estourouOTeto(org, agora = new Date()) {
  const teto = Number(process.env.TETO_DIARIO_IA_USD || TETO_PADRAO_USD);
  const atual = porDia.get(chave(org, agora));
  return (atual?.custo || 0) >= teto;
}

/** O que aparece no /diagnostico: por organização, o dia de hoje. */
export function consumoDeHoje(agora = new Date()) {
  const hoje = agora.toISOString().slice(0, 10);
  const linhas = [...porDia.entries()]
    .filter(([k]) => k.startsWith(hoje))
    .map(([, v]) => ({ ...v, custo_usd: Number(v.custo.toFixed(4)) }));

  return {
    data: hoje,
    teto_diario_usd: Number(process.env.TETO_DIARIO_IA_USD || TETO_PADRAO_USD),
    total_usd: Number(linhas.reduce((s, l) => s + l.custo, 0).toFixed(4)),
    perguntas: linhas.reduce((s, l) => s + l.perguntas, 0),
    // Sem isto não dá para responder "quanto me custa este cliente?", que é a
    // pergunta que decide se o custo cabe no setup ou vira linha na proposta.
    por_organizacao: linhas
      .map(({ org, perguntas, tokens, custo_usd }) => ({ org, perguntas, tokens, custo_usd }))
      .sort((a, b) => b.custo_usd - a.custo_usd)
  };
}

export function limpaConsumo() { porDia.clear(); }

export default { custoDaChamada, registraConsumo, estourouOTeto, consumoDeHoje, limpaConsumo };
