import { LitElement, html, css, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { AccountInfo } from '../types';

@customElement('account-switcher')
export class AccountSwitcher extends LitElement {
  @property({ type: Array }) accounts: AccountInfo[] = [];
  @property({ type: String }) activeEmail: string = '';

  @state() private _isOpen = false;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      font-family: var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);
      
      --bg-color: var(--vscode-dropdown-background, #252526);
      --bg-hover: var(--vscode-list-hoverBackground, #2a2d2e);
      --bg-active: var(--vscode-list-activeSelectionBackground, #094771);
      
      --text-color: var(--vscode-dropdown-foreground, #cccccc);
      --text-muted: var(--vscode-descriptionForeground, #969696);
      
      --border-color: var(--vscode-dropdown-border, #454545);
      --focus-outline: var(--vscode-focusBorder, #007fd4);
      
      --shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
      font-size: 13px;
      user-select: none;
    }

    /* Trigger Button */
    .trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--text-color);
      transition: background-color 0.1s ease;
      border: 1px solid transparent;
    }

    .trigger:hover, .trigger.active {
      background-color: var(--bg-hover);
    }

    .trigger:focus-visible {
      outline: 1px solid var(--focus-outline);
      outline-offset: -1px;
    }

    /* Avatar */
    .avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007fd4, #5ca0f2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      font-size: 10px;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .email {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }

    .chevron {
      width: 16px;
      height: 16px;
      fill: currentColor;
      opacity: 0.7;
      transition: transform 0.2s ease;
    }

    .trigger.active .chevron {
      transform: rotate(180deg);
    }

    /* Dropdown */
    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 280px;
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      box-shadow: var(--shadow);
      z-index: 1000;
      opacity: 0;
      transform: translateY(-8px);
      visibility: hidden;
      transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
      display: flex;
      flex-direction: column;
      padding: 4px 0;
    }

    .dropdown.open {
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
    }

    /* List Items */
    .account-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      color: var(--text-color);
      transition: background-color 0.1s;
    }

    .account-item:hover {
      background-color: var(--bg-hover);
    }

    .account-item.active {
      background-color: rgba(9, 71, 113, 0.3);
    }

    .account-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .account-email {
      font-weight: 500;
    }

    .account-status {
      font-size: 11px;
      color: var(--text-muted);
    }

    .check-icon {
      width: 16px;
      height: 16px;
      fill: var(--focus-outline);
      opacity: 0;
    }

    .account-item.active .check-icon {
      opacity: 1;
    }

    /* Actions */
    .separator {
      height: 1px;
      background-color: var(--border-color);
      margin: 4px 0;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      color: var(--text-color);
      font-size: 13px;
    }

    .action-button:hover {
      background-color: var(--bg-hover);
    }

    .action-icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
      opacity: 0.8;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

  constructor() {
    super();
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleOutsideClick);
    document.addEventListener('keydown', this._handleEscape);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleEscape);
  }

  private _handleOutsideClick(e: MouseEvent) {
    if (this._isOpen && !this.contains(e.target as Node)) {
      this._isOpen = false;
    }
  }

  private _handleEscape = (e: KeyboardEvent) => {
    if (this._isOpen && e.key === 'Escape') {
      this._isOpen = false;
    }
  }

  private _toggleDropdown(e: Event) {
    e.stopPropagation();
    this._isOpen = !this._isOpen;
  }

  private _selectAccount(account: AccountInfo) {
    if (account.email === this.activeEmail) return;
    this._isOpen = false;
    this.dispatchEvent(new CustomEvent('account-selected', {
      detail: { email: account.email },
      bubbles: true,
      composed: true
    }));
  }

  private _handleAdd() {
    this._isOpen = false;
    this.dispatchEvent(new CustomEvent('add-account', {
      bubbles: true,
      composed: true
    }));
  }

  private _handleLogout() {
    this._isOpen = false;
    this.dispatchEvent(new CustomEvent('logout-account', {
      detail: { email: this.activeEmail },
      bubbles: true,
      composed: true
    }));
  }

  private _getInitials(email: string) {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  }

  render() {
    const sortedAccounts = [
      // Put active account first or keep list order?
      // Usually nice to keep order but highlight active.
      ...this.accounts
    ];

    return html`
      <div 
        class="trigger ${this._isOpen ? 'active' : ''}" 
        @click="${this._toggleDropdown}"
        tabindex="0"
        role="button"
        aria-haspopup="true"
        aria-expanded="${this._isOpen}"
      >
        <div class="avatar">${this._getInitials(this.activeEmail)}</div>
        <span class="email">${this.activeEmail || 'Select Account'}</span>
        ${this._renderChevron()}
      </div>

      <div class="dropdown ${classMap({ open: this._isOpen })}">
        ${sortedAccounts.map(account => this._renderAccountItem(account))}
        
        <div class="separator"></div>
        
        <div class="action-button" @click="${this._handleAdd}">
          <div class="action-icon">${this._renderPlusIcon()}</div>
          <span>Add another account</span>
        </div>
        
        <div class="separator"></div>

        <div class="action-button" @click="${this._handleLogout}">
          <div class="action-icon">${this._renderLogoutIcon()}</div>
          <span>Sign out</span>
        </div>
      </div>
    `;
  }

  private _renderAccountItem(account: AccountInfo) {
    const isActive = account.email === this.activeEmail;
    return html`
      <div 
        class="account-item ${isActive ? 'active' : ''}" 
        @click="${() => this._selectAccount(account)}"
      >
        <div class="avatar" style="width: 24px; height: 24px; font-size: 11px;">
          ${this._getInitials(account.email)}
        </div>
        <div class="account-info">
          <span class="account-email">${account.email}</span>
          <span class="account-status">
            ${isActive ? 'Active' : 'Switch to this account'}
          </span>
        </div>
        <div class="check-icon">
          ${this._renderCheckIcon()}
        </div>
      </div>
    `;
  }

  private _renderChevron() {
    return svg`<svg class="chevron" viewBox="0 0 16 16"><path d="M4.5 6L8 9.5L11.5 6" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
  }

  private _renderCheckIcon() {
    return svg`<svg viewBox="0 0 16 16"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
  }

  private _renderPlusIcon() {
    return svg`<svg viewBox="0 0 16 16"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
  }

  private _renderLogoutIcon() {
    return svg`<svg viewBox="0 0 16 16"><path d="M9 12h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9m-4 8l-4-4 4-4m-4 4h9" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-switcher': AccountSwitcher;
  }
}
