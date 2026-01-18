export interface PromptCreditsInfo {
  available: number;
  monthly: number;
  percentage: number;
  resetDate?: string;
}

export interface ModelQuotaInfo {
  id: string;
  name: string; // Display name
  description?: string;
  remaining?: number; // Raw count if applicable
  limit?: number;
  remainingFraction?: number; // 0.0 to 1.0
  resetTime?: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'DEPLETED';
  isNew?: boolean;
  capabilities?: string[]; // e.g., ['image', 'thinking']
}

export interface QuotaGroup {
  id: string;
  name: string;
  models: ModelQuotaInfo[];
  description?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  tier: string;
  planName?: string;
  groups: QuotaGroup[];
}

export interface DashboardConfig {
  pinnedModels: string[];
  hiddenModels: string[];
  modelOrder: string[];
  showGroups: boolean;
  refreshInterval: number; // in seconds
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: UserInfo;
  token?: string;
  lastUpdated?: string;
  accounts: AccountInfo[]; // List of all authenticated accounts
  activeAccountEmail?: string; // Currently active account
}

export interface AccountInfo {
  email: string;
  isActive: boolean;
  expiresAt?: string;
  isInvalid?: boolean;
}
