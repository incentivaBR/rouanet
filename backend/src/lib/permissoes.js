/**
 * Quem pode agir em nome de uma organização.
 *
 * A regra vive aqui porque estava em dois lugares com formulações diferentes:
 * `admin.js` olhava a flag `isSuperadmin` do JWT, `mecenato.js` consultava a
 * tabela `organization_users`. Duas versões da mesma autorização derivam com o
 * tempo, e a que deriva para o lado permissivo ninguém percebe.
 */

import pool from '../../config/database.js';

/**
 * Pode conferir comprovante, emitir recibo e ver os dados dos destinadores
 * desta organização?
 *
 * Vale para `org_admin` da própria organização e para `superadmin`, que é papel
 * global da IncentivaBR e por isso não se prende a uma organização.
 *
 * Aceita também a flag `isSuperadmin` do JWT como caminho alternativo. Não é
 * redundância: a flag vive em `users.is_superadmin` e o vínculo em
 * `organization_users` — se o vínculo não tiver sido criado para alguém que já
 * é superadmin no sistema, ele ficaria trancado do lado de fora sem que
 * ninguém entendesse por quê.
 *
 * @param {string} userId
 * @param {string} organizationId
 * @param {object} [jwtUser] - req.user, para a flag de superadmin
 * @returns {Promise<boolean>}
 */
export async function podeGerirOrganizacao(userId, organizationId, jwtUser = null) {
  if (jwtUser?.isSuperadmin) return true;
  if (!userId || !organizationId) return false;

  const { rows } = await pool.query(
    `SELECT 1 FROM organization_users
      WHERE user_id = $1 AND is_active = true
        AND (role = 'superadmin' OR (organization_id = $2 AND role = 'org_admin'))
      LIMIT 1`,
    [userId, organizationId]
  );
  return rows.length > 0;
}

/**
 * Igual à anterior, mas inclui quem só observa (`org_viewer`).
 *
 * Serve para leitura de documento alheio — baixar o comprovante bancário de
 * uma destinação, por exemplo. Quem observa não confirma nada.
 */
export async function podeVerDadosDaOrganizacao(userId, organizationId, jwtUser = null) {
  if (jwtUser?.isSuperadmin) return true;
  if (!userId || !organizationId) return false;

  const { rows } = await pool.query(
    `SELECT 1 FROM organization_users
      WHERE user_id = $1 AND is_active = true
        AND (role = 'superadmin'
             OR (organization_id = $2 AND role IN ('org_admin', 'org_viewer')))
      LIMIT 1`,
    [userId, organizationId]
  );
  return rows.length > 0;
}

export default { podeGerirOrganizacao, podeVerDadosDaOrganizacao };
