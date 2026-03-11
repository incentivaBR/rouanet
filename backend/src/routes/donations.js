import express from 'express';
import pool from '../../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { gerarComprovante } from '../services/pdfGenerator.js';
import { notifyDestinationRegistered, notifyAdminNewDonation } from '../services/notificationService.js';

const router = express.Router();

// Validar UUID
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Lei Rouanet — limite máximo de 6% do IR devido
const LIMITE_ROUANET = 0.06;

// ─────────────────────────────────────────────────────────────
// POST /api/donations/rouanet
// Registra destinação para qualquer projeto SALIC (por PRONAC).
// ─────────────────────────────────────────────────────────────
router.post('/rouanet', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { pronac, projeto_titulo, ir_total, donation_amount, fiscal_year } = req.body;
    const userId = req.user.userId;
    const org    = req.organization;

    // Validações
    if (!pronac || !/^\d{6,7}$/.test(pronac)) {
      return res.status(400).json({ status: 'error', message: 'PRONAC inválido. Deve ter 6 ou 7 dígitos.' });
    }

    if (!ir_total || ir_total <= 0) {
      return res.status(400).json({ status: 'error', message: 'IR total deve ser maior que zero.' });
    }

    if (!donation_amount || donation_amount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valor da destinação deve ser maior que zero.' });
    }

    if (!fiscal_year || fiscal_year < 2024) {
      return res.status(400).json({ status: 'error', message: 'Ano fiscal inválido.' });
    }

    // Limite Rouanet: 6% do IR devido
    const limiteMax = Math.round(ir_total * LIMITE_ROUANET * 100) / 100;

    if (donation_amount > limiteMax) {
      return res.status(400).json({
        status: 'error',
        message: `Valor excede o limite de 6% do IR (R$ ${limiteMax.toFixed(2)}).`
      });
    }

    // Verificar total já destinado no mesmo ano (todos os projetos Rouanet)
    const existingResult = await client.query(`
      SELECT COALESCE(SUM(donation_amount), 0) AS total
      FROM donations
      WHERE user_id = $1 AND fiscal_year = $2 AND pronac IS NOT NULL AND status != 'cancelled'
    `, [userId, fiscal_year]);

    const totalJa   = parseFloat(existingResult.rows[0].total);
    const novoTotal = totalJa + donation_amount;

    if (novoTotal > limiteMax) {
      return res.status(400).json({
        status: 'error',
        message: `Total no ano (R$ ${novoTotal.toFixed(2)}) excederia o limite de 6% do IR (R$ ${limiteMax.toFixed(2)}). Já destinado: R$ ${totalJa.toFixed(2)}.`
      });
    }

    // Buscar fundo FNC (Lei Rouanet)
    const fncResult = await client.query(`SELECT id FROM official_funds WHERE code = 'FNC' LIMIT 1`);
    const fncId = fncResult.rows[0]?.id || null;

    await client.query('BEGIN');

    const result = await client.query(`
      INSERT INTO donations (user_id, pronac, projeto_titulo, official_fund_id, ir_total, donation_amount, fiscal_year, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING id, created_at
    `, [userId, pronac, projeto_titulo || `Projeto PRONAC ${pronac}`, fncId, ir_total, donation_amount, fiscal_year]);

    const donation = result.rows[0];

    await client.query('UPDATE users SET total_donated = total_donated + $1 WHERE id = $2', [donation_amount, userId]);

    await client.query('COMMIT');

    // Notificações (não bloqueia resposta)
    pool.query('SELECT nome, email, phone FROM users WHERE id = $1', [userId])
      .then(({ rows }) => {
        const user = rows[0];
        if (!user) return;
        notifyDestinationRegistered(
          { name: user.nome, email: user.email, phone: user.phone },
          { amount: donation_amount },
          { title: projeto_titulo || `Projeto PRONAC ${pronac}` },
          org
        ).catch(() => {});
      }).catch(() => {});

    res.status(201).json({
      status: 'success',
      message: 'Destinação Rouanet registrada com sucesso!',
      donation: {
        id:               donation.id,
        pronac,
        projeto_titulo:   projeto_titulo || `Projeto PRONAC ${pronac}`,
        ir_total,
        donation_amount,
        limite_rouanet:   limiteMax,
        percentage_of_ir: Math.round((donation_amount / ir_total) * 10000) / 100,
        fiscal_year,
        status:           'pending',
        created_at:       donation.created_at,
        // Dados bancários FNC para pagamento
        banco: {
          beneficiary_name: 'Fundo Nacional de Cultura — FNC',
          bank_name:        'Banco do Brasil',
          bank_code:        '001',
          bank_agency:      '3902-5',
          bank_account:     '170500-8',
          instrucoes:       'Identificar no comprovante: nome completo, CPF e PRONAC do projeto.'
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar destinação Rouanet:', error.message);
    res.status(500).json({ status: 'error', message: 'Erro interno ao registrar destinação.' });
  } finally {
    client.release();
  }
});

// GET /api/donations - Listar destinações Rouanet do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fiscal_year, status, limit = 20, offset = 0 } = req.query;

    let whereConditions = ['d.user_id = $1'];
    let params = [userId];
    let paramIndex = 2;

    if (fiscal_year) {
      whereConditions.push(`d.fiscal_year = $${paramIndex++}`);
      params.push(parseInt(fiscal_year));
    }

    if (status) {
      whereConditions.push(`d.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM donations d ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT
        d.id,
        d.pronac,
        d.projeto_titulo,
        d.ir_total,
        d.donation_amount,
        d.fiscal_year,
        d.status,
        d.created_at,
        d.receipt_file_path,
        f.code AS fund_code,
        f.name AS fund_name
      FROM donations d
      LEFT JOIN official_funds f ON d.official_fund_id = f.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, parseInt(limit), parseInt(offset)]);

    const totalsResult = await pool.query(`
      SELECT
        COALESCE(SUM(donation_amount), 0) AS total_donated,
        COUNT(*) AS total_donations
      FROM donations d
      ${whereClause} AND d.status != 'cancelled'
    `, params);

    const totals = totalsResult.rows[0];

    res.json({
      status: 'success',
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      summary: {
        total_donated:    parseFloat(totals.total_donated),
        total_donations:  parseInt(totals.total_donations)
      },
      donations: result.rows.map(d => ({
        id:               d.id,
        pronac:           d.pronac,
        projeto_titulo:   d.projeto_titulo,
        ir_total:         parseFloat(d.ir_total),
        donation_amount:  parseFloat(d.donation_amount),
        percentage_of_ir: parseFloat(d.ir_total) > 0
          ? Math.round((parseFloat(d.donation_amount) / parseFloat(d.ir_total)) * 10000) / 100
          : 0,
        fiscal_year:      d.fiscal_year,
        status:           d.status,
        created_at:       d.created_at,
        receipt_file_path: d.receipt_file_path,
        fund: { code: d.fund_code, name: d.fund_name }
      }))
    });

  } catch (error) {
    console.error('Erro ao listar destinações:', error.message);
    res.status(500).json({ status: 'error', message: 'Erro interno ao listar destinações.' });
  }
});

// GET /api/donations/:id - Detalhes de uma destinação
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!isValidUUID(id)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido.' });
    }

    const result = await pool.query(`
      SELECT
        d.*,
        f.code  AS fund_code,
        f.name  AS fund_name,
        f.cnpj  AS fund_cnpj,
        f.bank_code,
        f.agency,
        f.account
      FROM donations d
      LEFT JOIN official_funds f ON d.official_fund_id = f.id
      WHERE d.id = $1 AND d.user_id = $2
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Destinação não encontrada.' });
    }

    const d = result.rows[0];

    res.json({
      status: 'success',
      donation: {
        id:               d.id,
        pronac:           d.pronac,
        projeto_titulo:   d.projeto_titulo,
        ir_total:         parseFloat(d.ir_total),
        donation_amount:  parseFloat(d.donation_amount),
        percentage_of_ir: parseFloat(d.ir_total) > 0
          ? Math.round((parseFloat(d.donation_amount) / parseFloat(d.ir_total)) * 10000) / 100
          : 0,
        fiscal_year:      d.fiscal_year,
        status:           d.status,
        created_at:       d.created_at,
        fund: {
          code:      d.fund_code,
          name:      d.fund_name,
          cnpj:      d.fund_cnpj,
          bank_code: d.bank_code,
          agency:    d.agency,
          account:   d.account
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar destinação:', error.message);
    res.status(500).json({ status: 'error', message: 'Erro interno ao buscar destinação.' });
  }
});

// GET /api/donations/:id/comprovante - Gerar PDF do comprovante
router.get('/:id/comprovante', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!isValidUUID(id)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido.' });
    }

    const result = await pool.query(`
      SELECT
        d.*,
        u.nome  AS user_nome,
        u.cpf   AS user_cpf,
        u.email AS user_email,
        f.name  AS fund_name,
        f.code  AS fund_code,
        f.cnpj  AS fund_cnpj,
        f.bank_code,
        f.agency,
        f.account
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN official_funds f ON d.official_fund_id = f.id
      WHERE d.id = $1 AND d.user_id = $2
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Destinação não encontrada.' });
    }

    const row = result.rows[0];

    if (row.status !== 'confirmed') {
      return res.status(400).json({
        status: 'error',
        message: 'Comprovante disponível apenas para destinações confirmadas.'
      });
    }

    const donation = {
      id:             row.id,
      donation_amount: parseFloat(row.donation_amount),
      ir_total:       parseFloat(row.ir_total),
      fiscal_year:    row.fiscal_year,
      created_at:     row.created_at,
      confirmed_at:   row.confirmed_at
    };

    const user    = { nome: row.user_nome, cpf: row.user_cpf, email: row.user_email };
    const project = { title: row.projeto_titulo, code: row.pronac };
    const fund    = {
      name:      row.fund_name,
      code:      row.fund_code,
      cnpj:      row.fund_cnpj,
      bank_code: row.bank_code,
      agency:    row.agency,
      account:   row.account
    };

    const doc = gerarComprovante(donation, user, project, fund);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comprovante-rouanet-${id.substring(0, 8)}.pdf"`);
    doc.pipe(res);
    doc.end();

  } catch (error) {
    console.error('Erro ao gerar comprovante:', error.message);
    res.status(500).json({ status: 'error', message: 'Erro interno ao gerar comprovante.' });
  }
});

export default router;
