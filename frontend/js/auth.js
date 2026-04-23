// Auth Module — IncentivaBR
// Gerencia autenticação, token JWT e dados do usuário no frontend

const auth = {

  // ─── Token ────────────────────────────────────────────────
  getToken() {
    return localStorage.getItem('incentivabr_token');
  },

  setToken(token) {
    localStorage.setItem('incentivabr_token', token);
  },

  clearToken() {
    localStorage.removeItem('incentivabr_token');
  },

  // ─── Usuário ───────────────────────────────────────────────
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('incentivabr_user') || '{}');
    } catch {
      return {};
    }
  },

  setUser(user) {
    localStorage.setItem('incentivabr_user', JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem('incentivabr_user');
  },

  // ─── Dados do cálculo IR ──────────────────────────────────
  getIRData() {
    try {
      return JSON.parse(localStorage.getItem('incentivabr_ir') || '{}');
    } catch {
      return {};
    }
  },

  setIRData(data) {
    localStorage.setItem('incentivabr_ir', JSON.stringify(data));
  },

  clearIRData() {
    localStorage.removeItem('incentivabr_ir');
  },

  // ─── Estado de autenticação ───────────────────────────────

  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;
    // Verificar se o token JWT não expirou
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        this.clearAll(); // Token expirado — limpar tudo
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // ─── Verificação de roles ─────────────────────────────────

  isSuperadmin() {
    const user = this.getUser();
    return user.is_superadmin === true;
  },

  isOrgAdmin() {
    const user = this.getUser();
    return user.is_org_admin === true || user.is_superadmin === true;
  },

  getOrganization() {
    const user = this.getUser();
    return user.organization || null;
  },

  // ─── Sessão ───────────────────────────────────────────────

  clearAll() {
    this.clearToken();
    this.clearUser();
    this.clearIRData();
  },

  async logout() {
    // Notificar backend (audit_log)
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch { /* ignora falha de rede */ }
    }
    this.clearAll();
    window.location.href = 'login.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?redirect=${redirect}`;
      return false;
    }
    return true;
  },

  requireSuperadmin() {
    if (!this.requireAuth()) return false;
    if (!this.isSuperadmin()) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  },

  // ─── Redirect pós-login ───────────────────────────────────

  getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || 'dashboard.html';
  },

  redirectAfterLogin(user) {
    if (user.is_superadmin) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = this.getRedirectUrl();
    }
  }
};

// Verificar expiração do token em todas as páginas (exceto login)
if (!window.location.pathname.includes('login.html')) {
  if (!auth.isLoggedIn() && localStorage.getItem('incentivabr_token')) {
    // Token expirado — redirecionar para login com aviso
    sessionStorage.setItem('auth_message', 'Sua sessão expirou. Faça login novamente.');
    auth.clearAll();
    window.location.href = 'login.html';
  }
}
