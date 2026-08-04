import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Núcleo de conhecimento da TINA.
 *
 * Conteúdo comum a TODOS os tenants: base legal dos 7 mecanismos, guia de IR,
 * como funciona a destinação, passo a passo e FAQ. Extraído das páginas do
 * frontend (ver o comentário de fonte em cada seção do nucleo.md).
 *
 * Lido UMA VEZ na subida do processo. Não leia por requisição: além do custo
 * de I/O, qualquer variação de bytes entre chamadas invalida o prompt cache.
 *
 * ATENÇÃO — este texto é o prefixo cacheado. Ele precisa ser byte a byte
 * idêntico em toda requisição e em todo tenant. Nunca interpole aqui data,
 * nome de organização, id de sessão ou qualquer valor dinâmico: isso quebra o
 * compartilhamento do cache entre tenants e faz cada organização pagar o
 * prompt inteiro a preço cheio.
 */
export const NUCLEO = fs.readFileSync(
  path.join(__dirname, 'nucleo.md'),
  'utf-8'
);

/**
 * Monta o bloco específico do tenant a partir da linha de `organizations` que o
 * tenantMiddleware já injetou em req.organization.
 *
 * Vai DEPOIS do núcleo no array `system`, justamente para não invalidar o
 * prefixo cacheado — só estes ~300 tokens são reprocessados por organização.
 *
 * Deliberadamente FORA daqui: chave PIX, agência e conta. Esses dados aparecem
 * na tela de destinação, onde o usuário está autenticado no fluxo; num chat
 * eles viram superfície de engenharia social sem ganho nenhum de utilidade.
 */
export function blocoDoTenant(org) {
  if (!org) {
    return [
      '# ORGANIZAÇÃO ATUAL',
      '',
      'Nenhuma organização identificada nesta sessão. Responda apenas com o',
      'conhecimento geral acima e não afirme dados de nenhum projeto específico.'
    ].join('\n');
  }

  const linhas = [
    '# ORGANIZAÇÃO ATUAL',
    '',
    'Os dados abaixo são da organização desta sessão. Use SOMENTE estes dados ao',
    'falar do projeto, do proponente ou dos limites. Nunca cite dados de outra',
    'organização, nem de projetos que não estejam listados aqui.',
    '',
    `- Nome: ${org.name}`
  ];

  if (org.fund_name) linhas.push(`- Fundo / programa: ${org.fund_name}`);
  if (org.legal_basis) linhas.push(`- Base legal: ${org.legal_basis}`);
  if (org.max_percentage) {
    linhas.push(`- Limite de destinação: ${org.max_percentage}% do IR devido`);
  }
  if (org.pronac) {
    linhas.push(`- PRONAC: ${org.pronac}${org.pronac_titulo ? ` — ${org.pronac_titulo}` : ''}`);
  }
  if (org.pronac_area) linhas.push(`- Área cultural: ${org.pronac_area}`);
  if (org.pronac_proponente) linhas.push(`- Proponente: ${org.pronac_proponente}`);
  if (org.beneficiary_name) linhas.push(`- Beneficiário: ${org.beneficiary_name}`);
  if (org.beneficiary_cnpj) linhas.push(`- CNPJ do beneficiário: ${org.beneficiary_cnpj}`);
  if (org.contact_email) linhas.push(`- Contato: ${org.contact_email}`);

  // Conhecimento livre específico da organização (ex.: as regras do piloto FGV).
  // A coluna ainda não existe em `organizations`; enquanto não existir, este
  // bloco simplesmente não aparece. É o destino das 26 respostas fixas do
  // tina.js — mover para cá é o que permite apagá-las sem quebrar o piloto.
  if (org.knowledge_extra) {
    linhas.push('', '## Contexto específico desta organização', '', org.knowledge_extra);
  }

  linhas.push(
    '',
    'Se o usuário perguntar dados bancários ou chave PIX, não responda por aqui:',
    'oriente a seguir para a tela de destinação, onde os dados aparecem com o',
    'valor já calculado e o comprovante é gerado.'
  );

  return linhas.join('\n');
}
