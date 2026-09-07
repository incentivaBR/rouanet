/**
 * Tetos de dedução do IRPF — lidos do banco, não escritos no código.
 *
 * O limite de 6% é uma TESE JURÍDICA, não um fato do sistema. Ele estava em
 * três lugares como constante, e enquanto estivesse ali cada resposta do
 * tributarista seria um deploy. Agora é um UPDATE em `tetos_deducao`.
 *
 * REGRA DE OURO DESTE ARQUIVO: na dúvida, libere MENOS.
 *
 * Se o servidor destinar menos do que podia, ele perde uma oportunidade e nós
 * perdemos receita — recuperável no ano seguinte. Se destinar mais do que a lei
 * permite, ele cai na malha fina, e isso não se desfaz. Toda decisão aqui pende
 * para o lado conservador, inclusive quando o banco falha.
 */

import pool from '../../config/database.js';

/**
 * Teto que vale quando não dá para consultar o banco.
 *
 * Não é "o valor certo" — é o menor teto plausível, para que uma falha de
 * infraestrutura nunca libere mais do que deveria. Se o banco cair, o servidor
 * vê um limite menor e a destinação continua possível; ninguém fica exposto.
 */
const TETO_DE_SEGURANCA = {
  codigo: 'irpf_global_6',
  percentual: 6.00,
  base_legal: 'Lei 9.532/1997, art. 22',
  origem: 'padrão de segurança — banco indisponível'
};

// Tetos mudam por lei, não por requisição. Reler a cada cálculo seria uma
// consulta por clique sem ganho nenhum.
const CACHE_MS = 5 * 60 * 1000;
let cache = null;
let cacheEm = 0;

/**
 * Todos os tetos vigentes hoje, indexados por código.
 *
 * `executor` é a conexão a usar. Dentro de uma transação que segura o lock
 * do contribuinte, TEM de ser o client dela: se esta função pedisse outra
 * conexão ao pool enquanto dez requisições seguram as dez do pool esperando
 * o lock, ninguém avança — foi exatamente o que aconteceu no teste de
 * concorrência num Postgres real.
 *
 * @param {{query: Function}} [executor]
 * @returns {Promise<Map<string, object>>}
 */
export async function tetosVigentes(executor = pool) {
  if (cache && Date.now() - cacheEm < CACHE_MS) return cache;

  try {
    const { rows } = await executor.query(
      `SELECT codigo, descricao, percentual, base_legal,
              vigencia_inicio, vigencia_fim, confirmado_por_parecer
         FROM tetos_deducao
        WHERE vigencia_inicio <= CURRENT_DATE
          AND (vigencia_fim IS NULL OR vigencia_fim >= CURRENT_DATE)`
    );
    cache = new Map(rows.map(r => [r.codigo, { ...r, percentual: parseFloat(r.percentual) }]));
    cacheEm = Date.now();
    return cache;
  } catch (erro) {
    console.error('[tetos] falha ao ler tetos_deducao, usando o de segurança:', erro.message);
    return new Map([[TETO_DE_SEGURANCA.codigo, TETO_DE_SEGURANCA]]);
  }
}

/** Esquece o cache. Use depois de alterar um teto para o efeito ser imediato. */
export function limpaCache() {
  cache = null;
  cacheEm = 0;
}

/**
 * O teto que vale para um mecanismo de incentivo.
 *
 * @param {string} [codigoGrupo] - code de incentive_groups (ex.: 'ROUANET')
 * @param {{query: Function}} [executor] - ver tetosVigentes()
 * @returns {Promise<{codigo: string, percentual: number, base_legal: string}>}
 */
export async function tetoDoMecanismo(codigoGrupo, executor = pool) {
  const tetos = await tetosVigentes(executor);

  if (codigoGrupo) {
    try {
      const { rows } = await executor.query(
        'SELECT teto_codigo FROM incentive_groups WHERE code = $1 LIMIT 1',
        [codigoGrupo]
      );
      const codigo = rows[0]?.teto_codigo;
      if (codigo && tetos.has(codigo)) return tetos.get(codigo);
    } catch (erro) {
      console.error('[tetos] falha ao resolver o mecanismo:', erro.message);
    }
  }

  // Mecanismo desconhecido ou sem teto declarado cai no global. É o mais
  // restritivo dos que existem hoje — de novo, errar para menos.
  return tetos.get(TETO_DE_SEGURANCA.codigo) || TETO_DE_SEGURANCA;
}

/**
 * Quanto o contribuinte ainda pode destinar dentro de um teto, no ano.
 *
 * Soma o que ele JÁ destinou contra o MESMO teto — inclusive por outros
 * mecanismos. É esse cruzamento que impede alguém de destinar 6% pela Rouanet e
 * mais 6% ao Fundo do Idoso achando que são limites separados: não são, os dois
 * dividem os mesmos 6% do imposto devido.
 *
 * @param {string} userId
 * @param {number} irDevido
 * @param {number} anoFiscal
 * @param {string} [codigoGrupo]
 * @param {{query: Function}} [executor] - conexão a usar; passe o client da
 *   transação para que a soma enxergue o que já está bloqueado por ela
 */
export async function saldoDisponivel(userId, irDevido, anoFiscal, codigoGrupo, executor = pool) {
  const teto = await tetoDoMecanismo(codigoGrupo, executor);
  const limite = Math.round(irDevido * (teto.percentual / 100) * 100) / 100;

  let jaDestinado = 0;
  try {
    const { rows } = await executor.query(
      `SELECT COALESCE(SUM(d.donation_amount), 0) AS total
         FROM donations d
         LEFT JOIN official_funds f  ON f.id = d.official_fund_id
         LEFT JOIN incentive_groups g ON g.id = f.incentive_group_id
        WHERE d.user_id = $1
          AND d.fiscal_year = $2
          AND d.status <> 'cancelled'
          -- Destinação sem fundo identificado conta contra o teto global. Não
          -- saber a que mecanismo pertence não é motivo para ignorá-la.
          AND COALESCE(g.teto_codigo, $3) = $3`,
      [userId, anoFiscal, teto.codigo]
    );
    jaDestinado = parseFloat(rows[0].total);
  } catch (erro) {
    // Sem saber o que já foi destinado, o saldo seguro é zero — não o limite
    // cheio. Melhor recusar uma destinação legítima do que aprovar uma que
    // estoure o teto.
    console.error('[tetos] falha ao somar destinações do ano:', erro.message);
    return { teto, limite, ja_destinado: null, disponivel: 0, indisponivel: true };
  }

  return {
    teto,
    limite,
    ja_destinado: jaDestinado,
    disponivel: Math.max(0, Math.round((limite - jaDestinado) * 100) / 100)
  };
}

/**
 * Serializa os registros de um mesmo contribuinte.
 *
 * Dois POSTs simultâneos do mesmo CPF, cada um dentro do teto sozinho, somavam
 * acima do teto: os dois liam "nada destinado" antes de qualquer um gravar.
 * O advisory lock transacional faz o segundo esperar o primeiro terminar, e
 * aí a soma dele já inclui o que o primeiro gravou. Solta no COMMIT/ROLLBACK.
 *
 * A chave é derivada do UUID do usuário (60 bits, cabe em bigint com sinal).
 * Colisão entre dois usuários só faria um esperar o outro — nunca liberaria
 * a mais.
 *
 * @param {{query: Function}} client - o client da transação aberta
 * @param {string} userId
 */
export async function bloqueiaContribuinte(client, userId) {
  const chave = BigInt('0x' + String(userId).replace(/-/g, '').slice(0, 15)).toString();
  await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [chave]);
}

export default { tetosVigentes, tetoDoMecanismo, saldoDisponivel, bloqueiaContribuinte, limpaCache };
