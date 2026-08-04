#!/usr/bin/env node
/**
 * Fonte única do aviso legal do IncentivaBR.
 *
 * O aviso vive no HTML de cada página (e não num <script> injetado em runtime)
 * de propósito: aviso de propriedade intelectual precisa estar no markup —
 * visível sem JavaScript, indexável, e presente quando alguém salva a página.
 *
 * O custo disso é duplicação em 30 arquivos. Este script é a contrapartida:
 * edite APENAS a constante AVISO abaixo e rode
 *
 *     node scripts/sync-aviso-legal.mjs
 *
 * para propagar. O bloco é delimitado pelo comentário `incentivabr-legal`;
 * páginas que ainda não o tenham recebem o bloco no fim do <footer> ou, na
 * falta dele, antes do </body>.
 *
 * ATENÇÃO — o rodapé do comprovante em PDF NÃO é atualizado por aqui.
 * Ao mudar o aviso, ajuste também:
 *     backend/src/services/pdfGenerator.js  (texto do rodapé)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.join(__dirname, '..', 'frontend');
const MARCA = 'incentivabr-legal';

// ─────────────────────────────────────────────────────────────────────────────
// EDITE SOMENTE AQUI
//
// Estado dos registros (conferido nos documentos originais em 04/08/2026):
//   - Programa de computador  CONCEDIDO   INPI BR512025000647-0, 25/02/2025
//   - Marca NCL 35            DEPOSITADA  processo 939403005, 02/06/2025
//   - Marca NCL 42            DEPOSITADA  processo 939403110, 02/06/2025
//   - Documentação técnica    REGISTRADA  2º Ofício RTD Brasília/DF
//                                         (protocolo e data pendentes)
//
// Enquanto as marcas estiverem em exame o símbolo é ™, nunca ®: indicar como
// registrada uma marca não concedida é infração do art. 195, XIII da Lei
// 9.279/96. Ao sair a concessão, troque &trade; por &reg; e "depositada" por
// "registrada", com os números de registro no lugar dos de processo.
// ─────────────────────────────────────────────────────────────────────────────
const AVISO = [
  '<strong>IncentivaBR</strong>&trade; &mdash; programa de computador registrado no INPI sob o n&ordm; BR512025000647-0.<br>',
  'Marca mista depositada no INPI sob os processos n&ordm; 939403005 (NCL 35) e n&ordm; 939403110 (NCL 42).<br>',
  'Documenta&ccedil;&atilde;o t&eacute;cnica registrada no 2&ordm; Of&iacute;cio de Registro Civil, T&iacute;tulos e Documentos e Pessoas Jur&iacute;dicas de Bras&iacute;lia/DF.<br>',
  '&copy; 2026 Adacto Artur Dornas de Oliveira. Todos os direitos reservados. &Eacute; vedada a reprodu&ccedil;&atilde;o, distribui&ccedil;&atilde;o ou engenharia reversa, total ou parcial, sem autoriza&ccedil;&atilde;o expressa.'
];

const ESTILO_RODAPE =
  'margin-top:24px;padding-top:20px;text-align:center;' +
  'border-top:1px solid rgba(255,255,255,0.06);' +
  'font-size:11px;line-height:1.7;color:rgba(255,255,255,0.28)';

const ESTILO_SOLTO =
  'max-width:1100px;margin:0 auto;padding:22px 18px 30px;text-align:center;' +
  'border-top:1px solid rgba(128,128,128,0.14);' +
  'font-size:11px;line-height:1.7;color:rgba(128,128,128,0.75);font-family:inherit';

const bloco = (estilo, ind, nl) =>
  `${ind}<!-- ${MARCA} -->${nl}` +
  `${ind}<div style="${estilo}">${nl}` +
  AVISO.map(l => `${ind}  ${l}`).join(nl) + nl +
  `${ind}</div>${nl}`;

// [\s\S] em vez de . com flag s, e nada de \n literal: os arquivos estão em
// CRLF e um \n cru não casa com \r\n — foi assim que a primeira versão deste
// script deixou de reconhecer os blocos existentes e duplicou o aviso.
const RE_BLOCO = new RegExp(
  `([ \\t]*)<!--\\s*${MARCA}\\s*-->\\s*<div([^>]*)>[\\s\\S]*?<\\/div>`
);

let atualizadas = 0, inseridas = 0;
const semAncora = [];

for (const arquivo of fs.readdirSync(FRONTEND).filter(f => f.endsWith('.html')).sort()) {
  const alvo = path.join(FRONTEND, arquivo);
  let html = fs.readFileSync(alvo, 'utf-8');
  const nl = html.includes('\r\n') ? '\r\n' : '\n';

  if (RE_BLOCO.test(html)) {
    html = html.replace(RE_BLOCO, (_m, ind, attrs) =>
      `${ind}<!-- ${MARCA} -->${nl}${ind}<div${attrs}>${nl}` +
      AVISO.map(l => `${ind}  ${l}`).join(nl) + `${nl}${ind}</div>`
    );
    atualizadas++;
  } else {
    const iFooter = html.lastIndexOf('</footer>');
    const iBody = html.lastIndexOf('</body>');
    if (iFooter >= 0) {
      html = html.slice(0, iFooter) + nl + bloco(ESTILO_RODAPE, '      ', nl) + '    ' + html.slice(iFooter);
    } else if (iBody >= 0) {
      html = html.slice(0, iBody) + nl + bloco(ESTILO_SOLTO, '', nl) + html.slice(iBody);
    } else {
      semAncora.push(arquivo);
      continue;
    }
    inseridas++;
  }
  fs.writeFileSync(alvo, html, 'utf-8');
}

const todas = fs.readdirSync(FRONTEND).filter(f => f.endsWith('.html'));
const cobertas = todas.filter(f =>
  fs.readFileSync(path.join(FRONTEND, f), 'utf-8').includes(MARCA)
);

console.log(`aviso legal — ${atualizadas} atualizada(s), ${inseridas} inserida(s)`);
console.log(`cobertura: ${cobertas.length}/${todas.length} páginas`);
if (semAncora.length) {
  console.error(`SEM ÂNCORA (nem </footer> nem </body>): ${semAncora.join(', ')}`);
  process.exit(1);
}
console.log('lembrete: o rodapé do PDF vive em backend/src/services/pdfGenerator.js');
