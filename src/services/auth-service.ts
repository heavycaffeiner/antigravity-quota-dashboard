export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

const CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cclog',
  'https://www.googleapis.com/auth/experimentsandconfigs',
  'openid'
].join(' ');

export class AuthService {
  private verifier: string = '';

  async getLoginUrl(): Promise<string> {
    this.verifier = this.generateCodeVerifier();
    sessionStorage.setItem('pkce_verifier', this.verifier);

    let challenge = this.verifier;
    let method = 'plain';

    if (window.crypto && window.crypto.subtle) {
      try {
        challenge = await this.generateCodeChallenge(this.verifier);
        method = 'S256';
      } catch (e) {
        console.warn('Crypto API failed, falling back to plain PKCE', e);
      }
    }

    const redirectUri = 'http://localhost:51121';

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      code_challenge: challenge,
      code_challenge_method: method,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    });

    return `${AUTH_ENDPOINT}?${params.toString()}`;
  }

  async initiateLogin() {
    const url = await this.getLoginUrl();
    window.location.href = url;
  }

  async handleCallback(code: string): Promise<TokenResponse> {
    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) throw new Error('No PKCE verifier found');

    const redirectUri = 'http://localhost:51121';

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code: code,
      code_verifier: verifier
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error_description || 'Token exchange failed');
    }

    const data = await response.json();
    return data;
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error_description || 'Token refresh failed');
    }

    return await response.json();
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(hash));
  }

  private base64UrlEncode(array: Uint8Array): string {
    let str = '';
    for (let i = 0; i < array.length; i++) {
      str += String.fromCharCode(array[i]);
    }
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

export const authService = new AuthService();
