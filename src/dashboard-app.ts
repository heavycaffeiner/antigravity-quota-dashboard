import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { quotaService } from './services/quota-service';
import { accountManager } from './services/account-manager';
import { authService } from './services/auth-service';
import type { UserInfo, AccountInfo, ModelQuotaInfo } from './types';
import './components/quota-list-item';
import './components/account-switcher';
import './components/login-view';

@customElement('dashboard-app')
export class DashboardApp extends LitElement {
  @state()
  private userInfo: UserInfo | null = null;

  @state()
  private accounts: AccountInfo[] = [];

  @state()
  private activeAccountEmail: string = '';

  @state()
  private loading = false;

  @state()
  private isAuthenticating = false;

  async connectedCallback() {
    super.connectedCallback();
    
    // Check for OAuth Callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      await this._handleOAuthCallback(code);
    }

    // Initialize Accounts
    this._refreshAccounts();

    // Listen for global account updates
    window.addEventListener('account-changed', this._handleGlobalAccountChange.bind(this));
    window.addEventListener('accounts-updated', this._handleAccountsUpdated.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('account-changed', this._handleGlobalAccountChange.bind(this));
    window.removeEventListener('accounts-updated', this._handleAccountsUpdated.bind(this));
  }

  private async _handleOAuthCallback(code: string) {
    this.isAuthenticating = true;
    try {
      const token = await authService.handleCallback(code);
      let email = '';

      // Try to parse ID Token first
      if (token.id_token) {
        try {
          const payload = JSON.parse(atob(token.id_token.split('.')[1]));
          email = payload.email;
        } catch (e) {
          console.warn('Failed to parse ID Token', e);
        }
      }

      // Fallback to UserInfo endpoint if needed
      if (!email) {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${token.access_token}` }
        });
        if (!userInfoRes.ok) throw new Error('Failed to fetch user info');
        const userData = await userInfoRes.json();
        email = userData.email;
      }
      
      accountManager.addAccount(token, email);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error('OAuth failed', e);
      alert('Login failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      this.isAuthenticating = false;
    }
  }

  private _refreshAccounts() {
    this.accounts = accountManager.getAllAccounts();
    const active = accountManager.getActiveAccount();
    
    if (active) {
      this.activeAccountEmail = active.email;
      this._loadQuota(active.email);
    } else {
      this.activeAccountEmail = '';
      this.userInfo = null;
    }
  }

  private async _loadQuota(email: string) {
    this.loading = true;
    try {
      this.userInfo = await quotaService.fetchQuota(email);
    } catch (e) {
      console.error('Failed to load quota', e);
    } finally {
      this.loading = false;
    }
  }

  private _handleGlobalAccountChange(e: Event) {
    const detail = (e as CustomEvent).detail;
    if (detail && detail.email) {
      this._refreshAccounts();
    }
  }

  private _handleAccountsUpdated() {
    this._refreshAccounts();
  }

  private _onAccountSelected(e: CustomEvent) {
    const email = e.detail.email;
    accountManager.setActiveAccount(email);
  }

  private async _handleManualLogin(e: CustomEvent) {
    const code = e.detail.code;
    if (code) {
      await this._handleOAuthCallback(code);
    }
  }

  private async _onLoginStart() {
    const url = await authService.getLoginUrl();
    window.open(url, '_blank');
  }

  private _onAddAccount() {
    this._onLoginStart();
  }

  private _onLogoutAccount(e: CustomEvent) {
    accountManager.removeAccount(e.detail.email);
  }

  render() {
    if (this.isAuthenticating) {
      return html`
        <div class="auth-loading">
          <div class="spinner"></div>
          <p>Completing login...</p>
        </div>
      `;
    }

    if (this.accounts.length === 0) {
      return html`<login-view 
        @login-start=${this._onLoginStart}
        @manual-login=${this._handleManualLogin}
      ></login-view>`;
    }

    return html`
      <div class="container">
        <header class="header">
          <div class="header-left">
             <div class="logo">QC</div>
             <h1>Antigravity Quota Checker</h1>
          </div>
          <div class="header-right">
            <account-switcher
              .accounts=${this.accounts}
              .activeEmail=${this.activeAccountEmail}
              @account-selected=${this._onAccountSelected}
              @add-account=${this._onAddAccount}
              @logout-account=${this._onLogoutAccount}
            ></account-switcher>
          </div>
        </header>

        ${this.loading 
          ? html`
              <div class="loading-container">
                <div class="spinner"></div>
                <p>Fetching latest quota...</p>
              </div>`
          : this._renderContent()
        }
      </div>
    `;
  }

  private _renderContent() {
    if (!this.userInfo) {
      return html`<div class="empty-state">Select an account to view quota.</div>`;
    }

    // Removed credits destructuring
    const { groups } = this.userInfo;
    const allModels = groups.flatMap(g => g.models);
    
    // Grouping Logic
    const geminiModels = allModels.filter(m => m.id.toLowerCase().includes('gemini'));
    const claudeModels = allModels.filter(m => m.id.toLowerCase().includes('claude'));
    const otherModels = allModels.filter(m => !m.id.toLowerCase().includes('gemini') && !m.id.toLowerCase().includes('claude'));

    return html`
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">Plan</span>
          <span class="stat-value highlight">${this.userInfo.planName}</span>
        </div>
        <!-- Removed Credit Display -->
      </div>

      <div class="list-layout">
        ${this._renderModelGroup('Gemini Models', geminiModels, true)}
        ${this._renderModelGroup('Claude Models', claudeModels, true)}
        ${otherModels.length > 0 ? this._renderModelGroup('Other Models', otherModels, false) : ''}
      </div>
    `;
  }

  private _renderModelGroup(title: string, models: ModelQuotaInfo[], open: boolean) {
    if (models.length === 0) return html``;
    return html`
      <details class="group-details" ?open=${open}>
        <summary class="group-summary">
          <div class="summary-content">
            <span class="group-title">${title}</span>
            <span class="group-badge">${models.length}</span>
          </div>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </summary>
        <div class="group-list">
          ${models.map(model => html`<quota-list-item .model=${model}></quota-list-item>`)}
        </div>
      </details>
    `;
  }

  static styles = css`
    :host {
      display: block;
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px 40px 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0;
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 14px;
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    /* Stats Bar */
    .stats-bar {
      display: flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      width: fit-content;
      backdrop-filter: blur(10px);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .highlight {
      background: linear-gradient(90deg, #fff, #bbb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* List Layout */
    .list-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .group-details {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .group-summary {
      padding: 1rem 1.5rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      user-select: none;
      background: rgba(255, 255, 255, 0.02);
    }

    .group-summary:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .group-summary::-webkit-details-marker {
      display: none;
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .group-title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--text-primary);
    }

    .group-badge {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .chevron {
      color: var(--text-secondary);
      transition: transform 0.2s;
    }

    .group-details[open] .chevron {
      transform: rotate(180deg);
    }

    /* Loading States */
    .loading-container, .auth-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      color: var(--text-secondary);
      gap: 1rem;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--border-subtle);
      border-top-color: var(--accent-blue);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-app': DashboardApp;
  }
}
