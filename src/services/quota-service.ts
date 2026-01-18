import type { UserInfo, ModelQuotaInfo } from '../types';
import { accountManager } from './account-manager';

const ENDPOINTS = [
  '/api/prod',
  '/api/daily',
  '/api/autopush'
];

const HEADERS = {
  'Content-Type': 'application/json'
};

const PRIORITY_KEYWORDS = [
  'gemini-3-pro-high',
  'gemini-3-pro-low',
  'gemini-3-pro',
  'gemini-3-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'claude-opus-4-5',
  'claude-sonnet-4-5'
];

export class QuotaService {

  async fetchQuota(email?: string): Promise<UserInfo | null> {
    const targetEmail = email || accountManager.getActiveAccount()?.email;
    const token = accountManager.getValidToken(targetEmail);

    if (!token || !targetEmail) {
      return null;
    }

    try {
      let projectId = '';
      let subData: any = {};

      try {
        // Step A: Get Subscription & Project ID
        subData = await this.fetchWithFallback('/v1internal:loadCodeAssist', token, {
          metadata: {
            ideType: "IDE_UNSPECIFIED",
            platform: "PLATFORM_UNSPECIFIED",
            pluginType: "GEMINI",
            duetProject: "rising-fact-p41fc"
          }
        });
        projectId = subData.cloudaicompanionProject?.id || subData.cloudaicompanionProject || '';
      } catch (e) {
        console.warn('Subscription fetch failed, trying default project ID', e);
        projectId = 'rising-fact-p41fc';
      }

      console.log('Using Project ID:', projectId);

      // Step B: Get Models & Quota
      const requestBody = projectId ? { project: projectId } : {};
      const modelsData = await this.fetchWithFallback('/v1internal:fetchAvailableModels', token, requestBody);

      return this.mapResponseToUserInfo(subData, modelsData, targetEmail);
    } catch (e) {
      console.error('Real API failed.', e);
      if (!(window as any)['hasShownApiError']) {
        console.error('API Error Details:', e);
        (window as any)['hasShownApiError'] = true;
      }
      return null;
    }
  }

  private async fetchWithFallback(path: string, token: string, body: any): Promise<any> {
    let lastError;
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(`${endpoint}${path}`, {
          method: 'POST',
          headers: { ...HEADERS, Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          return await res.json();
        }

        const errorText = await res.text();
        console.error(`Failed at ${endpoint}: ${res.status}`, errorText);
      } catch (e) {
        lastError = e;
        console.debug(`Error at ${endpoint}`, e);
      }
    }
    throw lastError || new Error(`All endpoints failed for ${path}`);
  }

  private mapResponseToUserInfo(subData: any, modelsData: any, email: string): UserInfo {
    const models: ModelQuotaInfo[] = [];

    if (modelsData.models) {
      for (const [key, val] of Object.entries(modelsData.models) as [string, any][]) {
        let remainingFraction = 1.0;
        let status: ModelQuotaInfo['status'] = 'NORMAL';
        let resetTime = undefined;

        if (val.quotaInfo) {
          if (val.quotaInfo.remainingFraction !== undefined) {
            remainingFraction = val.quotaInfo.remainingFraction;
          } else if (val.quotaInfo.resetTime) {
            remainingFraction = 0;
          }
          resetTime = val.quotaInfo.resetTime;
        }

        const displayName = val.displayName || key;
        if (displayName.toLowerCase().includes('image')) continue;

        if (remainingFraction === 0) status = 'DEPLETED';
        else if (remainingFraction < 0.2) status = 'CRITICAL';
        else if (remainingFraction < 0.5) status = 'WARNING';

        models.push({
          id: key,
          name: displayName,
          remainingFraction,
          status,
          resetTime,
          capabilities: this.inferCapabilities(key)
        });
      }
    }

    return {
      id: email,
      email: email,
      tier: this.getDisplayPlanName(subData) === 'Pro Plan' ? 'PRO_TIER' : 'FREE_TIER',
      planName: this.getDisplayPlanName(subData),
      groups: [
        {
          id: 'default',
          name: 'Available Models',
          models: this.sortModels(models)
        }
      ]
    };
  }

  private sortModels(models: ModelQuotaInfo[]) {
    console.log(models);
    return models.sort((a, b) => {
      const idxA = this.getPriorityIndex(a.id);
      const idxB = this.getPriorityIndex(b.id);

      // If both are in priority list
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;

      // If only A is in list
      if (idxA !== -1) return -1;

      // If only B is in list
      if (idxB !== -1) return 1;

      // Fallback to remaining quota
      return (b.remainingFraction || 0) - (a.remainingFraction || 0);
    });
  }

  private getDisplayPlanName(subData: any): string {
    const tierName = subData['paidTier']['name'].toLowerCase();
    if (tierName.includes('pro')) {
      return 'Pro Plan';
    }
    if (tierName.includes('ultra')) {
      return 'Ultra Plan';
    }
    return 'Free Plan';
  }

  private getPriorityIndex(modelId: string): number {
    const lower = modelId.toLowerCase();
    return PRIORITY_KEYWORDS.findIndex(k => lower.includes(k));
  }

  private inferCapabilities(modelId: string): string[] {
    const caps = ['image'];
    const lower = modelId.toLowerCase();
    if (lower.includes('thinking') || lower.includes('reasoning') || lower.includes('gemini-3')) {
      caps.push('thinking');
    }
    if (lower.includes('code') || lower.includes('coder')) caps.push('code');
    return caps;
  }
}

export const quotaService = new QuotaService();
