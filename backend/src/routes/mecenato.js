/**
 * Recibo de Mecenato — a perna de volta do ciclo de destinação.
 *
 * Na Lei Rouanet, o documento que o contribuinte usa para deduzir é o Recibo
 * de Mecenato, emitido pelo PROPONENTE no modelo oficial do MinC, em três vias
 * (Ministério, proponente e incentivador). A plataforma NÃO emite e não deve
 * tentar emitir — o comprovante que ela gera é registro de operação.
 *
 * O que estas rotas fazem é transportar: o proponente anexa o recibo que
 * emitiu, o destinador baixa da própria conta. Isso resolve o momento de maior
 * insegurança do fluxo — logo depois de transferir, quando o destinador passa
 * a depender de um terceiro para obter o documento da declaração dele.
 */

import express from 'express';
import pool from '../../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { podeGerirOrganizacao } from '../lib/permissoes.js';
import { recebeArquivo } from '../lib/recebeArquivo.js';
import { entregaArquivo } from '../lib/entregaArquivo.js';
import { armazenamento, novaChave } from '../services/armazenamento.js';

const router = express.Router();

// O recibo vai para o armazenamento (services/armazenamento.js), com prefixo
// separado do dos comprovantes bancários: são documentos de direções opostas —
// um o destinador envia, o outro ele recebe. O banco guarda chave, nome
// original e SHA-256.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * O usuário pode agir como proponente desta destinação?
 *
 * A regra mora em lib/permissoes.js. Estava duplicada aqui e em outra
 * formulação no admin.js — duas cópias da mesma autorização derivam com o
 * tempo, e a que deriva para o lado permissivo ninguém percebe.
 */
const podeEmitir = (userId, organizationId, jwtUser) =>
  podeGerirOrganizacao(userId, organizationId, jwtUser);

// ───────────────────────────────────────────────────────────────────────────
// GET /api/mecenato/fila — recibos que o proponente ainda precisa emitir
//
// Declarada ANTES da rota com :donationId, senão "fila" seria capturado como id.
// Devolve tudo que o modelo do MinC exige, já reunido: o proponente não precisa
// caçar CPF e valor com o destinador.
// ───────────────────────────────────────────────────────────────────────────
router.get('/fila', authenticateToken, async (req, res) => {
  try {
    const orgId = req.organization?.id;
    if (!orgId) {
      return res.status(400).json({ status: 'error', message: 'Organização não identificada.' });
    }
    if (!(await podeEmitir(req.user.userId, orgId, req.user))) {
      return res.status(403).json({ status: 'error', message: 'Sem permissão para emitir recibos desta organização.' });
    }

    const { rows } = await pool.query(
      `SELECT d.id, d.donation_amount, d.fiscal_year, d.pronac, d.projeto_titulo,
              d.created_at, d.confirmed_at, d.status,
              d.receipt_url  AS comprovante_bancario,
              u.nome, u.cpf, u.email
         FROM donations d
         JOIN users u ON u.id = d.user_id
        WHERE d.organization_id = $1
          AND d.status IN ('confirmed', 'awaiting_mecenato')
        ORDER BY d.confirmed_at NULLS LAST, d.created_at`,
      [orgId]
    );

    res.json({ status: 'success', total: rows.length, pendentes: rows });
  } catch (erro) {
    console.error('Erro na fila de mecenato:', erro);
    res.status(500).json({ status: 'error', message: 'Erro ao listar recibos pendentes.' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/mecenato/:donationId — proponente anexa o recibo que emitiu
// ───────────────────────────────────────────────────────────────────────────
router.post('/:donationId', authenticateToken, recebeArquivo('mecenato'), async (req, res) => {
  const { donationId } = req.params;
  try {
    if (!UUID.test(donationId)) {
      return res.status(400).json({ status: 'error', message: 'Identificador inválido.' });
    }
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Nenhum arquivo enviado.' });
    }

    const { rows } = await pool.query(
      'SELECT id, organization_id, status FROM donations WHERE id = $1',
      [donationId]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'Destinação não encontrada.' });
    }
    const destinacao = rows[0];

    if (!(await podeEmitir(req.user.userId, destinacao.organization_id, req.user))) {
      return res.status(403).json({ status: 'error', message: 'Sem permissão para emitir o recibo desta destinação.' });
    }

    // Só faz sentido anexar recibo de transferência já conferida.
    if (!['confirmed', 'awaiting_mecenato', 'mecenato_issued'].includes(destinacao.status)) {
      return res.status(409).json({
        status: 'error',
        message: 'A transferência ainda não foi confirmada. O recibo só deve ser emitido após a conferência.'
      });
    }

    const chave = novaChave('mecenato', req.file.tipo.extensao);
    const gravado = await (await armazenamento()).guarda(chave, req.file.buffer, req.file.tipo.mime);

    await pool.query(
      `UPDATE donations
          SET mecenato_url       = $1,
              mecenato_filename  = $2,
              mecenato_sha256    = $3,
              mecenato_issued_at = NOW(),
              mecenato_issued_by = $4,
              status             = 'mecenato_issued'
        WHERE id = $5`,
      [gravado.chave, req.file.originalname, gravado.sha256, req.user.userId, donationId]
    );

    console.log(`[mecenato] recibo anexado à destinação ${donationId} por ${req.user.userId}`);

    res.json({
      status: 'success',
      message: 'Recibo de Mecenato anexado. O destinador já pode baixá-lo.',
      mecenato_filename: req.file.originalname
    });
  } catch (erro) {
    console.error('Erro ao anexar recibo de mecenato:', erro);
    res.status(500).json({ status: 'error', message: 'Erro ao anexar o recibo.' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/mecenato/:donationId — destinador baixa o recibo
//
// Acessível ao dono da destinação e a quem pode emitir por ela.
// ───────────────────────────────────────────────────────────────────────────
router.get('/:donationId', authenticateToken, async (req, res) => {
  const { donationId } = req.params;
  try {
    if (!UUID.test(donationId)) {
      return res.status(400).json({ status: 'error', message: 'Identificador inválido.' });
    }

    const { rows } = await pool.query(
      `SELECT d.user_id, d.organization_id, d.status,
              d.mecenato_url, d.mecenato_filename, d.mecenato_issued_at,
              d.proponente_notified_at,
              o.name AS org_nome, o.contact_person, o.contact_email,
              o.contact_whatsapp, o.mecenato_prazo_dias
         FROM donations d
         LEFT JOIN organizations o ON o.id = d.organization_id
        WHERE d.id = $1`,
      [donationId]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'Destinação não encontrada.' });
    }
    const d = rows[0];

    const ehDono = d.user_id === req.user.userId;
    if (!ehDono && !(await podeEmitir(req.user.userId, d.organization_id, req.user))) {
      return res.status(403).json({ status: 'error', message: 'Sem permissão.' });
    }

    // Mesmo sem recibo ainda, devolve o contexto — é o que evita a sensação de
    // abandono: quem emite, se já foi avisado, em quanto tempo, e a quem
    // recorrer.
    res.json({
      status: 'success',
      emitido: Boolean(d.mecenato_url),
      // Caminho autenticado, não o estático. A pasta /uploads é servida por
      // express.static sem autenticação: quem tiver o nome do arquivo baixa
      // documento alheio, e estes trazem nome, CPF e valor.
      download_url: d.mecenato_url ? `/api/mecenato/${donationId}/arquivo` : null,
      mecenato_filename: d.mecenato_filename,
      mecenato_issued_at: d.mecenato_issued_at,
      proponente: {
        nome: d.org_nome,
        responsavel: d.contact_person,
        email: d.contact_email,
        whatsapp: d.contact_whatsapp,
        notificado_em: d.proponente_notified_at,
        prazo_dias: d.mecenato_prazo_dias
      }
    });
  } catch (erro) {
    console.error('Erro ao buscar recibo de mecenato:', erro);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar o recibo.' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/mecenato/:donationId/arquivo — entrega o PDF com autenticação
//
// A pasta /uploads é publicada por express.static sem qualquer verificação.
// Servir o recibo por aqui garante que só o destinador e o proponente baixem.
// ───────────────────────────────────────────────────────────────────────────
router.get('/:donationId/arquivo', authenticateToken, async (req, res) => {
  const { donationId } = req.params;
  try {
    if (!UUID.test(donationId)) {
      return res.status(400).json({ status: 'error', message: 'Identificador inválido.' });
    }

    const { rows } = await pool.query(
      'SELECT user_id, organization_id, mecenato_url, mecenato_filename FROM donations WHERE id = $1',
      [donationId]
    );
    if (!rows.length || !rows[0].mecenato_url) {
      return res.status(404).json({ status: 'error', message: 'Recibo ainda não disponível.' });
    }
    const d = rows[0];

    const ehDono = d.user_id === req.user.userId;
    if (!ehDono && !(await podeEmitir(req.user.userId, d.organization_id, req.user))) {
      return res.status(403).json({ status: 'error', message: 'Sem permissão.' });
    }

    const entregue = await entregaArquivo(res, d.mecenato_url, d.mecenato_filename || 'recibo-de-mecenato.pdf');
    if (!entregue) {
      console.error('[mecenato] arquivo ausente no armazenamento:', d.mecenato_url);
      return res.status(404).json({ status: 'error', message: 'Arquivo não encontrado.' });
    }
  } catch (erro) {
    console.error('Erro ao entregar recibo:', erro);
    if (!res.headersSent) res.status(500).json({ status: 'error', message: 'Erro ao entregar o recibo.' });
  }
});

export default router;
