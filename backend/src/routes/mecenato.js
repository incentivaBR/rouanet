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
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Pasta separada da de comprovantes bancários: são documentos de direções
// opostas — um o destinador envia, o outro ele recebe.
const uploadDir = path.join(__dirname, '../../uploads/mecenato');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const sufixo = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'mecenato-' + sufixo + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitido = /jpeg|jpg|png|pdf/;
    const ext = permitido.test(path.extname(file.originalname).toLowerCase());
    const mime = permitido.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Apenas JPG, PNG e PDF são permitidos'));
  }
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * O usuário pode agir como proponente desta destinação?
 * superadmin da IncentivaBR, ou org_admin da organização dona da destinação.
 */
async function podeEmitir(userId, organizationId) {
  const { rows } = await pool.query(
    `SELECT role FROM organization_users
      WHERE user_id = $1 AND is_active = true
        AND (role = 'superadmin' OR (organization_id = $2 AND role = 'org_admin'))
      LIMIT 1`,
    [userId, organizationId]
  );
  return rows.length > 0;
}

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
    if (!(await podeEmitir(req.user.userId, orgId))) {
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
router.post('/:donationId', authenticateToken, upload.single('mecenato'), async (req, res) => {
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

    if (!(await podeEmitir(req.user.userId, destinacao.organization_id))) {
      return res.status(403).json({ status: 'error', message: 'Sem permissão para emitir o recibo desta destinação.' });
    }

    // Só faz sentido anexar recibo de transferência já conferida.
    if (!['confirmed', 'awaiting_mecenato', 'mecenato_issued'].includes(destinacao.status)) {
      return res.status(409).json({
        status: 'error',
        message: 'A transferência ainda não foi confirmada. O recibo só deve ser emitido após a conferência.'
      });
    }

    await pool.query(
      `UPDATE donations
          SET mecenato_url       = $1,
              mecenato_filename  = $2,
              mecenato_issued_at = NOW(),
              mecenato_issued_by = $3,
              status             = 'mecenato_issued'
        WHERE id = $4`,
      [`/uploads/mecenato/${req.file.filename}`, req.file.originalname, req.user.userId, donationId]
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
    if (!ehDono && !(await podeEmitir(req.user.userId, d.organization_id))) {
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
    if (!ehDono && !(await podeEmitir(req.user.userId, d.organization_id))) {
      return res.status(403).json({ status: 'error', message: 'Sem permissão.' });
    }

    // basename impede que um valor manipulado no banco escape da pasta
    const arquivo = path.join(uploadDir, path.basename(d.mecenato_url));
    if (!arquivo.startsWith(uploadDir) || !fs.existsSync(arquivo)) {
      console.error('[mecenato] arquivo ausente ou fora da pasta:', d.mecenato_url);
      return res.status(404).json({ status: 'error', message: 'Arquivo não encontrado.' });
    }

    res.download(arquivo, d.mecenato_filename || 'recibo-de-mecenato.pdf');
  } catch (erro) {
    console.error('Erro ao entregar recibo:', erro);
    res.status(500).json({ status: 'error', message: 'Erro ao entregar o recibo.' });
  }
});

export default router;
