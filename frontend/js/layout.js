/* ═══════════════════════════════════════════════════════════
   layout.js — Nav + Footer compartilhados (DestineAI)
   Uso: Layout.init('calculadora') | Layout.init('home', { transparentNav: true })
   ═══════════════════════════════════════════════════════════ */

const Layout = {

  /* Links de navegação — ordem e IDs fixos */
  _links: [
    { id: 'calculadora', href: 'calculadora.html',      label: 'MeuLimite' },
    { id: 'projeto',     href: 'projeto-detalhes.html?pronac=261847', label: 'A Orquestra' },
    { id: 'como',        href: 'como-funciona.html',    label: 'Como funciona' },
  ],

  /* ─── Ponto de entrada ──────────────────────────────────── */
  init(activePage = '', opts = {}) {
    try {
      if (!opts.skipNav) this._injectNav(activePage, opts);
      if (!opts.skipFooter) this._injectFooter();
      this._setupScroll(!!opts.transparentNav);
      this._updateAuth();
      this._setupFadeUp();
    } catch (err) {
      console.error('[Layout] Erro ao inicializar:', err);
    } finally {
      /* Garante que o body SEMPRE se torna visível, mesmo com erro */
      document.body.classList.add('dai-ready');
    }
  },

  /* ─── Nav ────────────────────────────────────────────────── */
  _injectNav(activePage, opts) {
    const linksHtml = this._links.map(l => {
      const active = l.id === activePage ? ' dai-nav__link--active' : '';
      return `<a href="${l.href}" class="dai-nav__link${active}">${l.label}</a>`;
    }).join('');

    const nav = document.createElement('nav');
    nav.id = 'daiNav';
    nav.className = 'dai-nav' + (opts.transparentNav ? ' dai-nav--transparent' : '');
    nav.innerHTML = `
      <div class="dai-nav__inner">
        <a href="index.html" class="dai-nav__logo">Destine<span>AI</span></a>
        <div class="dai-nav__links">
          ${linksHtml}
          <a href="login.html" id="daiNavAuth" class="dai-nav__enter">Entrar</a>
          <a href="login.html?tab=register" class="dai-nav__register">Criar conta</a>
        </div>
      </div>`;

    document.body.insertBefore(nav, document.body.firstChild);
  },

  /* ─── Footer ─────────────────────────────────────────────── */
  _injectFooter() {
    const footer = document.createElement('footer');
    footer.className = 'dai-footer';
    footer.innerHTML = `
      <div class="dai-footer__inner">
        <span class="dai-footer__logo">Destine<span>AI</span></span>
        <div class="dai-footer__links">
          <a href="politica-privacidade.html" class="dai-footer__link">Política de Privacidade</a>
          <span class="dai-footer__sep">|</span>
          <a href="termos-uso.html" class="dai-footer__link">Termos de Uso</a>
        </div>
        <p class="dai-footer__legal">Plataforma de destinação de IR · Lei 8.313/1991</p>
        <p class="dai-footer__legal" style="margin-top:4px;opacity:0.65">DestineAI é um produto <strong>IncentivaBR®</strong> · INPI nº BR512025000647-0 · © 2025–2026 IncentivaBR · Todos os direitos reservados · Reprodução proibida</p>
      </div>`;

    document.body.appendChild(footer);
  },

  /* ─── Efeito de scroll: transparente → sólido ───────────── */
  _setupScroll(startTransparent) {
    const nav = document.getElementById('daiNav');
    if (!nav) return;

    if (!startTransparent) return; /* nav sólido desde o início: nada a fazer */

    const update = () => {
      if (window.scrollY > 40) {
        nav.classList.add('dai-nav--scrolled');
      } else {
        nav.classList.remove('dai-nav--scrolled');
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update(); /* executa imediatamente para o estado inicial */
  },

  /* ─── Auth: atualiza link "Entrar" se já logado ─────────── */
  _updateAuth() {
    const el = document.getElementById('daiNavAuth');
    if (!el) return;

    /* auth.js deve ser carregado antes de layout.js */
    if (typeof auth === 'undefined' || !auth.isLoggedIn()) return;

    const user = auth.getUser();
    el.textContent = user?.nome ? user.nome.split(' ')[0] : 'Minha Conta';
    el.href = 'dashboard.html';
  },

  /* ─── Fade-up on scroll ──────────────────────────────────── */
  _setupFadeUp() {
    if (!('IntersectionObserver' in window)) {
      /* Fallback: torna tudo visível imediatamente */
      document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  },
};
