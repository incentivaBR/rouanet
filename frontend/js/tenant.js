/**
 * Tenant Manager - Gerencia configurações multi-tenant
 * IncentivaBR
 */

const tenant = {
  // Cache da organização
  _organization: null,

  /**
   * Carrega configuração da organização do servidor
   */
  async loadOrganizationConfig() {
    try {
      // Pega org da URL (para desenvolvimento)
      const urlParams = new URLSearchParams(window.location.search);
      const orgParam = urlParams.get('org') || '';

      const baseUrl = typeof api !== 'undefined' && api.baseUrl ? api.baseUrl : '';
      const url = orgParam
        ? `${baseUrl}/api/config/organization?org=${orgParam}`
        : `${baseUrl}/api/config/organization`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'success' && data.organization) {
        this.applyOrganizationTheme(data.organization);
        this._organization = data.organization;
        return data.organization;
      }
    } catch (error) {
      console.error('Erro ao carregar organizacao:', error);
      // Tentar carregar do localStorage como fallback
      const cached = this.getOrganization();
      if (cached) {
        this.applyOrganizationTheme(cached);
        return cached;
      }
    }
    return null;
  },

  /**
   * Aplica tema da organização na página
   */
  applyOrganizationTheme(org) {
    if (!org) return;

    // Salvar no localStorage para uso em outras páginas
    localStorage.setItem('incentivabr_org', JSON.stringify(org));
    this._organization = org;

    // Aplicar cores CSS
    if (org.primary_color) {
      document.documentElement.style.setProperty('--primary-color', org.primary_color);
    }
    if (org.secondary_color) {
      document.documentElement.style.setProperty('--secondary-color', org.secondary_color);
    }

    // Atualizar nome da organização onde existir
    const orgNameElements = document.querySelectorAll('.org-name');
    orgNameElements.forEach(el => el.textContent = org.name);

    // Atualizar nome do fundo
    const fundNameElements = document.querySelectorAll('.fund-name');
    fundNameElements.forEach(el => el.textContent = org.fund_name || 'Fundo de Incentivo');

    // Atualizar limite máximo
    const maxPercentElements = document.querySelectorAll('.max-percentage');
    maxPercentElements.forEach(el => el.textContent = (org.max_percentage || 6) + '%');

    // Atualizar base legal
    const legalBasisElements = document.querySelectorAll('.legal-basis');
    legalBasisElements.forEach(el => el.textContent = org.legal_basis || '');

    // Atualizar logo se houver
    if (org.logo_url) {
      const logoElements = document.querySelectorAll('.org-logo');
      logoElements.forEach(el => {
        if (el.tagName === 'IMG') {
          el.src = org.logo_url;
        }
      });
    }

    // Atualizar título da página
    if (org.slug !== 'www') {
      const currentTitle = document.title;
      if (!currentTitle.includes(org.name)) {
        document.title = `${org.name} | IncentivaBR`;
      }
    }

    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('tenantLoaded', { detail: org }));
  },

  /**
   * Obter organização do cache/localStorage
   */
  getOrganization() {
    if (this._organization) {
      return this._organization;
    }
    const org = localStorage.getItem('incentivabr_org');
    if (org) {
      this._organization = JSON.parse(org);
      return this._organization;
    }
    return null;
  },

  /**
   * Obter limite máximo de dedução (%)
   */
  getMaxPercentage() {
    const org = this.getOrganization();
    return org ? parseFloat(org.max_percentage) || 6 : 6;
  },

  /**
   * Obter dados bancários da organização
   */
  getBankData() {
    const org = this.getOrganization();
    if (!org) return null;

    return {
      bank_name: org.bank_name,
      bank_code: org.bank_code,
      bank_agency: org.bank_agency,
      bank_account: org.bank_account,
      pix_key: org.pix_key,
      pix_key_type: org.pix_key_type,
      beneficiary_name: org.beneficiary_name,
      beneficiary_cnpj: org.beneficiary_cnpj
    };
  },

  /**
   * Verifica se é a organização padrão (www)
   */
  isDefaultOrg() {
    const org = this.getOrganization();
    return !org || org.slug === 'www';
  },

  /**
   * Obter slug da organização atual
   */
  getSlug() {
    const org = this.getOrganization();
    return org ? org.slug : 'www';
  },

  /**
   * Carrega configuração de marca via /api/config/brand
   * Mais leve que loadOrganizationConfig — ideal para inicialização rápida.
   */
  async loadBrand() {
    try {
      const baseUrl = typeof api !== 'undefined' && api.baseUrl ? api.baseUrl : '';
      const response = await fetch(`${baseUrl}/api/config/brand`);
      if (!response.ok) return;
      const brand = await response.json();
      this._applyBrand(brand);
      return brand;
    } catch (error) {
      console.error('Erro ao carregar brand:', error);
    }
    return null;
  },

  _applyBrand(brand) {
    if (!brand) return;
    window.__brand = brand;

    if (brand.color_primary) {
      document.documentElement.style.setProperty('--primary-color', brand.color_primary);
    }
    if (brand.color_accent) {
      document.documentElement.style.setProperty('--secondary-color', brand.color_accent);
      document.documentElement.style.setProperty('--accent-color', brand.color_accent);
    }

    // Atualizar elementos com classe .brand-name
    document.querySelectorAll('.brand-name').forEach(el => {
      el.textContent = brand.name;
    });

    // Atualizar logotipos com classe .brand-logo
    if (brand.logo_url) {
      document.querySelectorAll('.brand-logo').forEach(el => {
        if (el.tagName === 'IMG') el.src = brand.logo_url;
      });
    }

    // Expor simulation_mode globalmente
    window.SIMULATION_MODE = brand.simulation_mode === true;

    window.dispatchEvent(new CustomEvent('brandLoaded', { detail: brand }));
  }
};

// Carregar automaticamente ao iniciar a página
// loadBrand primeiro (rápido, usa .env) → loadOrganizationConfig depois (org sobrescreve se tiver cores próprias)
document.addEventListener('DOMContentLoaded', async () => {
  await tenant.loadBrand();
  tenant.loadOrganizationConfig();
});
