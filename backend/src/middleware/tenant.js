import pool from '../../config/database.js';

/**
 * Middleware de Multi-Tenant
 * Detecta o tenant (organização) pelo:
 * - Subdomínio: ajufer.incentivabr.com.br → slug = 'ajufer'
 * - Query param (dev): ?org=ajufer → slug = 'ajufer'
 * - Padrão: slug = 'www'
 */
async function tenantMiddleware(req, res, next) {
  try {
    let org = null;

    // 1. Query param (desenvolvimento): ?org=ajufer
    if (req.query.org) {
      const result = await pool.query(
        'SELECT * FROM organizations WHERE slug = $1 AND is_active = true',
        [req.query.org]
      );
      org = result.rows[0] || null;
    }

    // 2. Domínio customizado ou admin_domain
    //    custom_domain: destineai.com.br (usuário final)
    //    admin_domain:  incentivabr.com.br (institucional + admin)
    if (!org && req.hostname) {
      const hostname = req.hostname.toLowerCase();
      const result = await pool.query(
        'SELECT * FROM organizations WHERE (custom_domain = $1 OR admin_domain = $1) AND is_active = true',
        [hostname]
      );
      org = result.rows[0] || null;
    }

    // 3. Subdomínio: ajufer.incentivabr.com.br → slug = 'ajufer'
    if (!org && req.hostname) {
      const parts = req.hostname.split('.');
      let slug = null;
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        slug = parts[0];
      } else if (parts.length === 2 && parts[1] === 'localhost' && parts[0] !== 'www') {
        slug = parts[0];
      }
      if (slug) {
        const result = await pool.query(
          'SELECT * FROM organizations WHERE slug = $1 AND is_active = true',
          [slug]
        );
        org = result.rows[0] || null;
      }
    }

    // 4. Fallback: organização padrão (www)
    if (!org) {
      const result = await pool.query(
        'SELECT * FROM organizations WHERE slug = $1',
        ['www']
      );
      org = result.rows[0] || null;
    }

    req.organization = org;

    // Adicionar slug ao request para fácil acesso
    req.tenantSlug = req.organization?.slug || 'www';

    next();
  } catch (error) {
    console.error('Erro no tenant middleware:', error.message);
    // Continuar sem organização em caso de erro
    req.organization = null;
    req.tenantSlug = 'www';
    next();
  }
}

export default tenantMiddleware;
