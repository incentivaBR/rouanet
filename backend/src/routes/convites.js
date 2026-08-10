/**
 * Rotas de convite — como uma organização ganha quem a opera.
 *
 * O cadastro público insere sempre `member`, e nada mais no sistema criava
 * `org_admin`. Uma organização nova nascia com PRONAC, conta de captação e
 * ninguém capaz de abrir a fila de conferência: o dinheiro entrava e travava.
 *
 * Quem convida: o superadmin da IncentivaBR ou o `org_admin` da própria
 * organização. O segundo é o que impede que toda troca de pessoa na instituição
 * vire chamado para nós.
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import pool from '../../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { podeGerirOrganizacao } from '../lib/permissoes.js';
import { geraToken, hashDoToken, expiraEm, validaConvite, VALIDADE_HORAS } from '../lib/convites.js';
import { sendConviteGestorEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * Costura para teste: por onde o convite sai.
 *
 * O token em claro existe em exatamente dois lugares — a memória desta função
 * e o e-mail do convidado. No banco só fica o hash, de propósito, então um
 * teste não tem como recuperá-lo depois. Sem esta costura, testar o fluxo de
 * aceite exigiria ou guardar o token em claro (o defeito que o desenho evita)
 * ou devolvê-lo na resposta HTTP (pior ainda).
 *
 * ESM não permite substituir a função importada, daí ser uma variável.
 */
let enviaConvite = sendConviteGestorEmail;
export function _trocaEnvioDeConvite(fn) {
  if (process.env.NODE_ENV !== 'test') throw new Error('só em teste');
  enviaConvite = fn;
}

// O endereço do convite carrega um segredo de 32 bytes. Não dá para adivinhar
// por força bruta, mas o limite fecha a porta para varredura e mantém o log
// legível quando alguém tenta.
const limiteDoToken = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { status: 'error', message: 'Muitas tentativas. Aguarde alguns minutos.' }
});

const email = (v) => String(v || '').trim().toLowerCase();
const pareceEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

// ── Criar convite ──────────────────────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { organization_id, role = 'org_admin' } = req.body;
    const destinatario = email(req.body.email);
    const nome = String(req.body.nome || '').trim() || null;

    if (!organization_id) {
      return res.status(400).json({ status: 'error', message: 'Informe a organização.' });
    }
    if (!pareceEmail(destinatario)) {
      return res.status(400).json({ status: 'error', message: 'E-mail inválido.' });
    }
    if (!['org_admin', 'org_viewer', 'member'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Papel inválido.' });
    }
    if (!(await podeGerirOrganizacao(req.user.userId, organization_id, req.user))) {
      return res.status(403).json({
        status: 'error', message: 'Você não gerencia esta organização.'
      });
    }

    const { rows: orgs } = await pool.query(
      'SELECT id, name, slug, primary_color, secondary_color, logo_url FROM organizations WHERE id = $1',
      [organization_id]);
    if (!orgs.length) {
      return res.status(404).json({ status: 'error', message: 'Organização não encontrada.' });
    }

    // Reenviar substitui o convite pendente em vez de criar um segundo.
    // Duas portas válidas para o mesmo e-mail significa que revogar uma não
    // fecha a outra — e o índice único do banco recusaria a segunda de todo
    // jeito, com um erro que não diz nada a quem clicou "reenviar".
    await pool.query(`
      UPDATE org_invites SET revoked_at = NOW(), revoked_by = $3
       WHERE organization_id = $1 AND LOWER(email) = $2
         AND accepted_at IS NULL AND revoked_at IS NULL`,
      [organization_id, destinatario, req.user.userId]);

    const { claro, hash } = geraToken();
    const { rows } = await pool.query(`
      INSERT INTO org_invites (organization_id, email, nome, role, token_hash, expires_at, invited_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, email, nome, role, expires_at, created_at`,
      [organization_id, destinatario, nome, role, hash, expiraEm(), req.user.userId]);

    const { rows: quem } = await pool.query('SELECT nome FROM users WHERE id = $1',
      [req.user.userId]);

    const enviado = await enviaConvite(orgs[0], rows[0], claro, quem[0]?.nome);
    if (!enviado) {
      // O convite existe no banco mas ninguém recebeu o link — e o link não
      // pode ser recuperado depois, porque só o hash ficou guardado. Dizer
      // "convite enviado" aqui seria mentira que só aparece dias depois.
      console.error('[convites] convite criado mas e-mail não saiu:', destinatario);
      return res.status(502).json({
        status: 'error',
        message: 'O convite foi registrado, mas o e-mail não pôde ser enviado. ' +
                 'Verifique o endereço e tente reenviar.'
      });
    }

    res.status(201).json({
      status: 'success',
      message: `Convite enviado para ${destinatario}. Vale ${VALIDADE_HORAS} horas.`,
      convite: rows[0]
    });
  } catch (erro) {
    console.error('[convites] criar:', erro.message);
    res.status(500).json({ status: 'error', message: 'Erro ao criar o convite.' });
  }
});

// ── Listar convites de uma organização ─────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orgId = req.query.organization_id;
    if (!orgId) {
      return res.status(400).json({ status: 'error', message: 'Informe a organização.' });
    }
    if (!(await podeGerirOrganizacao(req.user.userId, orgId, req.user))) {
      return res.status(403).json({ status: 'error', message: 'Você não gerencia esta organização.' });
    }

    // token_hash nunca sai daqui.
    const { rows } = await pool.query(`
      SELECT c.id, c.email, c.nome, c.role, c.expires_at, c.created_at,
             c.accepted_at, c.revoked_at, q.nome AS convidado_por
        FROM org_invites c
        LEFT JOIN users q ON q.id = c.invited_by
       WHERE c.organization_id = $1
       ORDER BY c.created_at DESC`, [orgId]);

    // A situação é derivada aqui, não num CASE no SQL.
    //
    // As mesmas regras já vivem em validaConvite(), que é quem decide se um
    // link funciona. Escrevê-las de novo em SQL criaria duas implementações da
    // mesma coisa, livres para divergir — a tela diria "pendente" para um
    // convite que o servidor recusa, e ninguém entenderia por quê.
    const convites = rows.map(c => ({
      ...c,
      situacao: c.revoked_at ? 'revogado'
              : c.accepted_at ? 'aceito'
              : validaConvite(c).valido ? 'pendente' : 'expirado'
    }));

    res.json({ status: 'success', convites });
  } catch (erro) {
    console.error('[convites] listar:', erro.message);
    res.status(500).json({ status: 'error', message: 'Erro ao listar convites.' });
  }
});

// ── Revogar ────────────────────────────────────────────────────────────────
router.post('/:id/revogar', authenticateToken, async (req, res) => {
  try {
    const { rows: achou } = await pool.query(
      'SELECT organization_id, accepted_at FROM org_invites WHERE id = $1', [req.params.id]);
    if (!achou.length) {
      return res.status(404).json({ status: 'error', message: 'Convite não encontrado.' });
    }
    if (!(await podeGerirOrganizacao(req.user.userId, achou[0].organization_id, req.user))) {
      return res.status(403).json({ status: 'error', message: 'Você não gerencia esta organização.' });
    }
    if (achou[0].accepted_at) {
      // Revogar o convite não tira o acesso de quem já entrou — isso se faz
      // desativando o vínculo, que é outra operação. Dizer que revogou aqui
      // deixaria alguém achando que fechou uma porta que continua aberta.
      return res.status(409).json({
        status: 'error',
        message: 'Este convite já foi aceito. Para retirar o acesso, desative o usuário na organização.'
      });
    }

    await pool.query(
      'UPDATE org_invites SET revoked_at = NOW(), revoked_by = $2 WHERE id = $1 AND revoked_at IS NULL',
      [req.params.id, req.user.userId]);
    res.json({ status: 'success', message: 'Convite revogado.' });
  } catch (erro) {
    console.error('[convites] revogar:', erro.message);
    res.status(500).json({ status: 'error', message: 'Erro ao revogar.' });
  }
});

// ── Consultar um convite pelo token (público) ──────────────────────────────
router.get('/token/:token', limiteDoToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, o.name AS organizacao, o.slug
        FROM org_invites c JOIN organizations o ON o.id = c.organization_id
       WHERE c.token_hash = $1`, [hashDoToken(req.params.token)]);

    const veredito = validaConvite(rows[0]);
    if (!veredito.valido) {
      console.warn(`[convites] token recusado: ${veredito.causa}`);
      return res.status(410).json({ status: 'error', message: veredito.recado });
    }

    const c = rows[0];
    const { rows: existe } = await pool.query(
      'SELECT 1 FROM users WHERE LOWER(email) = $1', [email(c.email)]);

    res.json({
      status: 'success',
      convite: {
        email: c.email, nome: c.nome, role: c.role,
        organizacao: c.organizacao, slug: c.slug,
        expira_em: c.expires_at,
        // Quem já tem conta só confirma a senha atual; quem não tem, cria.
        ja_tem_conta: existe.length > 0
      }
    });
  } catch (erro) {
    console.error('[convites] consultar:', erro.message);
    res.status(500).json({ status: 'error', message: 'Erro ao consultar o convite.' });
  }
});

// ── Aceitar (público) ──────────────────────────────────────────────────────
router.post('/token/:token/aceitar', limiteDoToken, async (req, res) => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // FOR UPDATE: dois cliques no mesmo link, ou duas abas, não podem virar
    // dois aceites. O segundo espera e encontra o convite já consumido.
    const { rows } = await cliente.query(
      'SELECT * FROM org_invites WHERE token_hash = $1 FOR UPDATE',
      [hashDoToken(req.params.token)]);

    const veredito = validaConvite(rows[0]);
    if (!veredito.valido) {
      await cliente.query('ROLLBACK');
      return res.status(410).json({ status: 'error', message: veredito.recado });
    }
    const convite = rows[0];

    const { rows: existentes } = await cliente.query(
      'SELECT id, senha_hash FROM users WHERE LOWER(email) = $1', [email(convite.email)]);

    let userId;
    if (existentes.length) {
      // Já tem conta: confirma a senha dela. Sem isso, quem interceptasse o
      // e-mail trocaria a senha de uma conta existente pelo link do convite.
      const senha = String(req.body.senha || '');
      if (!senha || !(await bcrypt.compare(senha, existentes[0].senha_hash || ''))) {
        await cliente.query('ROLLBACK');
        return res.status(401).json({
          status: 'error',
          message: 'Já existe uma conta com este e-mail. Informe a senha dela para aceitar o convite.'
        });
      }
      userId = existentes[0].id;
    } else {
      const senha = String(req.body.senha || '');
      const nome = String(req.body.nome || convite.nome || '').trim();
      const cpf = String(req.body.cpf || '').replace(/\D/g, '');

      if (senha.length < 8) {
        await cliente.query('ROLLBACK');
        return res.status(400).json({ status: 'error', message: 'A senha precisa de ao menos 8 caracteres.' });
      }
      if (!nome) {
        await cliente.query('ROLLBACK');
        return res.status(400).json({ status: 'error', message: 'Informe seu nome.' });
      }
      if (cpf.length !== 11) {
        await cliente.query('ROLLBACK');
        return res.status(400).json({ status: 'error', message: 'Informe um CPF com 11 dígitos.' });
      }

      const { rows: criado } = await cliente.query(`
        INSERT INTO users (cpf, nome, email, senha_hash, email_verified, organization_id,
                           accepted_terms_at)
        VALUES ($1,$2,$3,$4,true,$5,NOW()) RETURNING id`,
        [cpf, nome, email(convite.email), await bcrypt.hash(senha, 10), convite.organization_id]);
      userId = criado[0].id;
    }

    await cliente.query(`
      INSERT INTO organization_users (organization_id, user_id, role, invited_by, accepted_at, is_active)
      VALUES ($1,$2,$3,$4,NOW(),true)
      ON CONFLICT (organization_id, user_id)
      DO UPDATE SET role = EXCLUDED.role, is_active = true, accepted_at = NOW()`,
      [convite.organization_id, userId, convite.role, convite.invited_by]);

    await cliente.query(`
      UPDATE org_invites SET accepted_at = NOW(), accepted_by = $2, accepted_ip = $3
       WHERE id = $1`,
      [convite.id, userId, req.ip || null]);

    await cliente.query('COMMIT');
    res.json({
      status: 'success',
      message: 'Acesso liberado. Faça login para começar.',
      email: convite.email
    });
  } catch (erro) {
    await cliente.query('ROLLBACK').catch(() => {});
    if (erro.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Já existe uma conta com esse CPF. Entre com ela e peça um novo convite.'
      });
    }
    console.error('[convites] aceitar:', erro.message);
    res.status(500).json({ status: 'error', message: 'Erro ao aceitar o convite.' });
  } finally {
    cliente.release();
  }
});

export default router;
