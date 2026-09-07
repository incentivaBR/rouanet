/**
 * Middleware de upload de um único arquivo, em memória, com erro legível.
 *
 * O multer gravava direto no disco e seus erros (arquivo grande, tipo
 * recusado) caíam no handler global como 500. Aqui o arquivo fica em memória
 * (o limite é 5 MB) para ser validado pelo conteúdo e entregue ao
 * armazenamento; e os erros do multer viram 400 com mensagem.
 */

import multer from 'multer';
import { TAMANHO_MAXIMO, extensaoPermitida, identificaArquivo, MENSAGEM_TIPO_INVALIDO } from './validaArquivo.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (extensaoPermitida(file.originalname)) return cb(null, true);
    cb(Object.assign(new Error(MENSAGEM_TIPO_INVALIDO), { code: 'TIPO_INVALIDO' }));
  }
});

/**
 * @param {string} campo nome do campo do formulário ('receipt', 'mecenato')
 */
export function recebeArquivo(campo) {
  const um = upload.single(campo);
  return (req, res, next) => {
    um(req, res, (erro) => {
      if (!erro) {
        if (!req.file) return next();
        // Decisão pelo conteúdo, não pelo nome nem pelo MIME declarado.
        const tipo = identificaArquivo(req.file.buffer, req.file.originalname);
        if (!tipo) return res.status(400).json({ status: 'error', message: MENSAGEM_TIPO_INVALIDO });
        req.file.tipo = tipo;
        return next();
      }
      if (erro.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ status: 'error', message: 'Arquivo acima de 5 MB. Reduza a resolução ou exporte em PDF.' });
      }
      if (erro.code === 'TIPO_INVALIDO' || erro instanceof multer.MulterError) {
        return res.status(400).json({ status: 'error', message: erro.message });
      }
      next(erro);
    });
  };
}
