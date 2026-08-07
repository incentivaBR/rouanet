/**
 * Tenant Manager - Gerencia configurações multi-tenant
 * IncentivaBR
 */

/**
 * Cor de acento da marca IncentivaBR.
 *
 * As paginas do fluxo trazem esta cor codificada, junto com dois tons
 * derivados escolhidos a mao (#D4874E para hover, #E07A35 para gradiente) que
 * NAO sao calculos sobre ela. Enquanto a organizacao usar o acento padrao, os
 * tons ficam como estao — calcular repintaria o site de quem nao pediu nada.
 * Assim que uma organizacao traz cor propria, ai sim os tons sao derivados
 * dela, porque manter o laranja da IncentivaBR num tema alheio e pior.
 */
const ACENTO_PADRAO = '#EE985C';

/**
 * Suspende as transicoes CSS enquanto o tema e trocado.
 *
 * Sem isso, elementos com `transition: all` (varios botoes do fluxo usam)
 * ficam com a cor ANTIGA depois que a variavel muda: a transicao fixa o valor
 * ja computado e nao reavalia o var(). Da para comprovar clonando o botao —
 * o clone, sem historico de transicao, nasce com a cor nova; o original nao.
 *
 * A supressao dura dois quadros: tempo de o navegador recalcular o estilo sem
 * animar. E a mesma tecnica usada para evitar o "flash" ao trocar de tema.
 */
function semTransicoes(fn) {
  const trava = document.createElement('style');
  trava.textContent = '*, *::before, *::after { transition: none !important; }';
  document.head.appendChild(trava);
  fn();
  // leitura forcada: garante que o estilo foi recalculado com a trava ativa
  void document.body?.offsetHeight;
  requestAnimationFrame(() => requestAnimationFrame(() => trava.remove()));
}

/**
 * Escreve o acento e, se ele nao for o padrao, os tons que dependem dele.
 */
function aplicaAcento(cor) {
  if (!cor) return;
  semTransicoes(() => {
    const raiz = document.documentElement;
    raiz.style.setProperty('--secondary-color', cor);
    raiz.style.setProperty('--accent-color', cor);

    if (String(cor).trim().toUpperCase() === ACENTO_PADRAO) return;

    raiz.style.setProperty('--secondary-hover', `color-mix(in srgb, ${cor} 88%, #000)`);
    raiz.style.setProperty('--secondary-dark',  `color-mix(in srgb, ${cor} 78%, #000)`);
  });
}

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
    aplicaAcento(org.secondary_color);

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
    aplicaAcento(brand.color_accent);

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

/**
 * Preenche a página com o projeto da organização.
 *
 * O PRONAC estava escrito à mão em nove arquivos do frontend, sempre o mesmo
 * projeto fictício. Isso fazia entrar um cliente novo ser deploy: para a Casa
 * Azul aparecer, alguém editaria arquivo e publicaria. Agora cada página só
 * MARCA o que precisa ser preenchido, e o dado vem do cadastro.
 *
 * Três marcações, todas opcionais:
 *
 *   <a data-destinar>                → vira link para destinar, com pronac e título
 *   <span data-projeto="pronac">     → recebe o PRONAC
 *   <span data-projeto="titulo">     → recebe o nome do projeto
 *
 * Sem projeto cadastrado, os links de destinar são desativados em vez de
 * apontarem para lugar nenhum — melhor um botão explicando que falta cadastro
 * do que um que leva a uma tela quebrada.
 */
async function preencheProjeto() {
  const marcados = document.querySelectorAll('[data-destinar], [data-projeto]');
  if (!marcados.length) return;   // página não usa projeto

  let projeto = null;
  try {
    const baseUrl = typeof api !== 'undefined' && api.baseUrl ? api.baseUrl : '';
    const resp = await fetch(`${baseUrl}/api/salic/org-project`);
    if (resp.ok) {
      const dados = await resp.json();
      projeto = dados.projeto || null;
    }
  } catch (erro) {
    console.error('[tenant] não foi possível carregar o projeto da organização:', erro);
  }

  if (!projeto?.pronac) {
    document.querySelectorAll('a[data-destinar]').forEach(a => {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      a.style.opacity = '0.55';
      a.style.cursor = 'not-allowed';
      a.title = 'Nenhum projeto cadastrado para esta organização.';
    });
    return;
  }

  const titulo = projeto.nome || `Projeto PRONAC ${projeto.pronac}`;

  document.querySelectorAll('a[data-destinar]').forEach(a => {
    // O atributo pode trazer parâmetros extras que a página já usava,
    // como o valor vindo da calculadora: data-destinar="valor=1200"
    const extra = a.getAttribute('data-destinar');
    const params = new URLSearchParams({ pronac: projeto.pronac, titulo });
    if (extra) new URLSearchParams(extra).forEach((v, k) => params.set(k, v));
    a.href = `destinar-rouanet.html?${params}`;
  });

  document.querySelectorAll('[data-projeto]').forEach(el => {
    const campo = el.getAttribute('data-projeto');
    const valor = campo === 'titulo' ? titulo : projeto[campo];
    if (valor != null) el.textContent = valor;
  });

  window.__projeto = projeto;
  window.dispatchEvent(new CustomEvent('projetoCarregado', { detail: projeto }));
}

// Exposta porque algumas páginas só descobrem os parâmetros do link depois de
// carregar — a de projetos acrescenta o valor vindo da calculadora, e o painel
// monta os cartões por innerHTML depois da resposta da API.
tenant.preencheProjeto = preencheProjeto;

// `const` em script clássico cria uma global léxica: outras páginas enxergam
// `tenant`, mas nada fora do documento enxerga — nem código de teste, nem um
// iframe. Publicar no window é o que torna isto uma biblioteca de fato.
window.tenant = tenant;

// Carregar automaticamente ao iniciar a página
// loadBrand primeiro (rápido, usa .env) → loadOrganizationConfig depois (org sobrescreve se tiver cores próprias)
document.addEventListener('DOMContentLoaded', async () => {
  await tenant.loadBrand();
  tenant.loadOrganizationConfig();
  preencheProjeto();
});
