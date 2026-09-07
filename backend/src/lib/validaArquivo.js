/**
 * Validação de arquivo enviado: comprovante bancário e Recibo de Mecenato.
 *
 * O filtro antigo aceitava `.xpdf` (regex sem âncora) e confiava no MIME que o
 * navegador declara. Aqui a decisão é pelos primeiros bytes do conteúdo, que é
 * o que um leitor de PDF ou de imagem vai de fato interpretar. Extensão e MIME
 * continuam conferidos, mas não decidem sozinhos.
 */

import path from 'path';

const TIPOS = {
  pdf:  { mime: 'application/pdf', extensoes: ['.pdf'],          assinatura: [0x25, 0x50, 0x44, 0x46] },        // %PDF
  jpeg: { mime: 'image/jpeg',      extensoes: ['.jpg', '.jpeg'], assinatura: [0xFF, 0xD8, 0xFF] },
  png:  { mime: 'image/png',       extensoes: ['.png'],          assinatura: [0x89, 0x50, 0x4E, 0x47] }          // \x89PNG
};

export const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

/** Só a extensão, para o filtro do multer decidir antes de ler o corpo. */
export function extensaoPermitida(nomeOriginal) {
  const ext = path.extname(String(nomeOriginal || '')).toLowerCase();
  return Object.values(TIPOS).some(t => t.extensoes.includes(ext));
}

/**
 * Decide o tipo pelo conteúdo. Devolve { tipo, mime, extensao } ou null.
 * @param {Buffer} buffer
 * @param {string} nomeOriginal
 */
export function identificaArquivo(buffer, nomeOriginal) {
  if (!buffer || buffer.length < 8) return null;
  const ext = path.extname(String(nomeOriginal || '')).toLowerCase();

  for (const [tipo, def] of Object.entries(TIPOS)) {
    const bate = def.assinatura.every((b, i) => buffer[i] === b);
    if (!bate) continue;
    // Conteúdo de um tipo com extensão de outro é o caso clássico de arquivo
    // renomeado. Recusa: o nome que o destinador vai baixar depois tem que
    // corresponder ao que está dentro.
    if (!def.extensoes.includes(ext)) return null;
    return { tipo, mime: def.mime, extensao: def.extensoes[0] };
  }
  return null;
}

export const MENSAGEM_TIPO_INVALIDO =
  'Envie o comprovante em PDF, JPG ou PNG. O arquivo precisa ser mesmo desse tipo, não só ter a extensão.';
