/**
 * Entrega um documento do armazenamento pela resposta HTTP, como download.
 *
 * Um só lugar para comprovante e recibo: resolve a chave (inclusive a legada
 * `/uploads/...`), abre o stream, põe os cabeçalhos e trata "não existe".
 */

import { armazenamento, resolveChave } from '../services/armazenamento.js';

/**
 * @returns {Promise<boolean>} true se respondeu; false se o arquivo não existe
 *   (quem chama decide a mensagem do 404)
 */
export async function entregaArquivo(res, valorNoBanco, nomeParaDownload) {
  const chave = resolveChave(valorNoBanco);
  if (!chave) return false;

  const arq = await (await armazenamento()).abre(chave);
  if (!arq) return false;

  const nome = String(nomeParaDownload || 'documento').replace(/[^\w.\-() áéíóúãõâêôçÁÉÍÓÚÃÕÂÊÔÇ]/g, '_');
  res.setHeader('Content-Type', arq.contentType || 'application/octet-stream');
  if (arq.bytes != null) res.setHeader('Content-Length', String(arq.bytes));
  res.setHeader('Content-Disposition', `attachment; filename="${nome}"; filename*=UTF-8''${encodeURIComponent(nome)}`);
  res.setHeader('Cache-Control', 'private, no-store');

  await new Promise((resolve, reject) => {
    arq.stream.on('error', reject);
    res.on('finish', resolve);
    res.on('close', resolve);
    arq.stream.pipe(res);
  });
  return true;
}
