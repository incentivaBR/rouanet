/**
 * Rota: /api/organizations
 * Gerenciamento de organizações parceiras (proponentes de projetos SALIC).
 * Nota: gestão de white-labels (tenants) é feita em /api/admin/orgs
 */

import express from 'express';

const router = express.Router();

// Placeholder — funcionalidades serão adicionadas conforme necessidade
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Para gerenciar clientes white-label, use /api/admin/orgs (requer superadmin).'
  });
});

export default router;
