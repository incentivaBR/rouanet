/**
 * Convites de acesso a uma organização.
 *
 * Criar um cliente e criar quem opera esse cliente eram coisas separadas por um
 * abismo: o cadastro público insere sempre `member`, e nada no sistema criava
 * `org_admin`. Uma organização nova nascia com PRONAC, conta de captação e
 * ninguém capaz de abrir a fila de conferência.
 *
 * Este arquivo é só a mecânica do token, separada das rotas para poder ser
 * testada sem HTTP e sem banco.
 */
import crypto from 'crypto';

// Duas noites. O token de confirmação de interessado vale sete dias, mas ali o
// que está em jogo é um e-mail numa lista; aqui é o papel que confirma dinheiro
// de terceiros. Convite esquecido numa caixa de entrada é porta aberta.
export const VALIDADE_HORAS = 48;

/**
 * Gera o par: o que vai no e-mail e o que vai no banco.
 *
 * O banco recebe apenas o hash. Quem ler a tabela — backup vazado, acesso
 * indevido, dump de suporte — não consegue aceitar convite nenhum, porque o
 * valor em claro só existiu no e-mail enviado.
 */
export function geraToken() {
  const claro = crypto.randomBytes(32).toString('base64url');
  return { claro, hash: hashDoToken(claro) };
}

export function hashDoToken(claro) {
  return crypto.createHash('sha256').update(String(claro)).digest('hex');
}

export function expiraEm(agora = new Date()) {
  return new Date(agora.getTime() + VALIDADE_HORAS * 3600 * 1000);
}

/**
 * Por que um convite não serve.
 *
 * Devolve sempre o mesmo motivo genérico para o convidado (`recado`) e o motivo
 * real para o log (`causa`). A distinção importa: dizer "este convite já foi
 * aceito" a quem tem o link revela que o link é válido e que alguém entrou —
 * informação útil para quem interceptou o e-mail.
 */
export function validaConvite(convite, agora = new Date()) {
  const recusa = causa => ({
    valido: false, causa,
    recado: 'Este convite não é mais válido. Peça um novo a quem te convidou.'
  });

  if (!convite) return recusa('inexistente');
  if (convite.revoked_at) return recusa('revogado');
  if (convite.accepted_at) return recusa('ja_aceito');
  if (new Date(convite.expires_at) <= agora) return recusa('expirado');
  return { valido: true, causa: 'ok', recado: null };
}

export default { VALIDADE_HORAS, geraToken, hashDoToken, expiraEm, validaConvite };
