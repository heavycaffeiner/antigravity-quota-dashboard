import type { TokenResponse } from './auth-service';
import type { AccountInfo } from '../types';

interface AccountData {
  id: string; // email
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp
  addedAt: number;
  lastUsedAt: number;
  isInvalid: boolean;
  rateLimitedUntil: Record<string, number>; // modelFamily -> timestamp
}

const STORAGE_KEY = 'antigravity_account_pool_v1';

export class AccountManager {
  private accounts: Map<string, AccountData> = new Map();
  private activeAccountId: string | null = null;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.accounts = new Map(data.accounts);
        this.activeAccountId = data.activeAccountId;
      }
    } catch (e) {
      console.warn('Failed to load account pool', e);
    }
  }

  private save() {
    try {
      const data = {
        accounts: Array.from(this.accounts.entries()),
        activeAccountId: this.activeAccountId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notifyChange();
    } catch (e) {
      console.error('Failed to save account pool', e);
    }
  }

  private notifyChange() {
    window.dispatchEvent(new CustomEvent('accounts-updated'));
    if (this.activeAccountId) {
      window.dispatchEvent(new CustomEvent('account-changed', { 
        detail: { email: this.activeAccountId } 
      }));
    }
  }

  addAccount(token: TokenResponse, email: string) {
    const expiresAt = Date.now() + (token.expires_in * 1000);
    const existing = this.accounts.get(email);
    
    const account: AccountData = {
      id: email,
      email: email,
      accessToken: token.access_token,
      refreshToken: token.refresh_token || existing?.refreshToken, // Keep old refresh token if new one not provided
      expiresAt: expiresAt,
      addedAt: existing?.addedAt || Date.now(),
      lastUsedAt: Date.now(),
      isInvalid: false,
      rateLimitedUntil: existing?.rateLimitedUntil || {}
    };

    this.accounts.set(email, account);
    
    // Auto-select if first account
    if (!this.activeAccountId) {
      this.activeAccountId = email;
    }

    this.save();
  }

  removeAccount(email: string) {
    this.accounts.delete(email);
    if (this.activeAccountId === email) {
      this.activeAccountId = this.accounts.keys().next().value || null;
    }
    this.save();
  }

  setActiveAccount(email: string) {
    if (this.accounts.has(email)) {
      this.activeAccountId = email;
      this.save();
    }
  }

  getActiveAccount(): AccountData | undefined {
    if (!this.activeAccountId) return undefined;
    return this.accounts.get(this.activeAccountId);
  }

  getAllAccounts(): AccountInfo[] {
    return Array.from(this.accounts.values()).map(acc => ({
      email: acc.email,
      isActive: acc.email === this.activeAccountId,
      expiresAt: new Date(acc.expiresAt).toISOString(),
      isInvalid: acc.isInvalid
    }));
  }

  getValidToken(email?: string): string | null {
    const targetId = email || this.activeAccountId;
    if (!targetId) return null;

    const account = this.accounts.get(targetId);
    if (!account) return null;

    // Check expiry (with 60s buffer)
    if (Date.now() > account.expiresAt - 60000) {
      // In a real app, we would refresh here.
      // For this demo, we mark as invalid or hope for the best if we can't refresh.
      console.warn(`Token for ${targetId} is expired or expiring soon.`);
      if (!account.refreshToken) {
        return null; // Can't refresh
      }
      // TODO: Implement refresh logic integration
    }

    return account.accessToken;
  }
}

export const accountManager = new AccountManager();
