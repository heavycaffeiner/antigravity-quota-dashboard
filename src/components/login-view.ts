import { LitElement, html, css, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('login-view')
export class LoginView extends LitElement {
  @state() private isLoading = false;

  private _handleLogin() {
    this.isLoading = true;
    this.dispatchEvent(new CustomEvent('login-start', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="login-container">
        <div class="login-card">
          <div class="logo-section">
            <div class="logo-icon">
              ${this._renderLogo()}
            </div>
            <h1>Antigravity</h1>
            <p>Quota Dashboard</p>
          </div>
          
          <button 
            class="google-btn ${this.isLoading ? 'loading' : ''}" 
            @click=${this._handleLogin}
            ?disabled=${this.isLoading}
          >
            <div class="btn-content">
              ${this.isLoading ? this._renderSpinner() : this._renderGoogleIcon()}
              <span>Sign in with Google</span>
            </div>
          </button>
          
          <div class="footer">
            <p>Manage your AI quotas efficiently</p>
          </div>
        </div>
        
        <div class="background-glow"></div>
      </div>
    `;
  }

  private _renderLogo() {
    return svg`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="url(#paint0_linear)"/>
      <path d="M20 10V30" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <path d="M10 20H30" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0070F3"/>
          <stop offset="1" stop-color="#F81CE5"/>
        </linearGradient>
      </defs>
    </svg>`;
  }

  private _renderGoogleIcon() {
    return svg`<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>`;
  }

  private _renderSpinner() {
    return svg`<svg class="spinner" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>`;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      background-color: var(--bg-color, #0a0a0a);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
    }

    .login-container {
      position: relative;
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }

    .background-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(0, 112, 243, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
      z-index: -1;
      pointer-events: none;
    }

    .login-card {
      background: rgba(20, 20, 20, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .logo-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .logo-icon {
      margin-bottom: 1.5rem;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #fff 0%, #888 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }

    p {
      color: #888;
      margin: 0;
      font-size: 1rem;
    }

    .google-btn {
      width: 100%;
      height: 50px;
      background: white;
      color: #1a1a1a;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .google-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
    }

    .google-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .google-btn:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .footer {
      margin-top: 2rem;
      font-size: 0.875rem;
      color: #555;
    }

    .spinner {
      animation: rotate 2s linear infinite;
      width: 20px;
      height: 20px;
    }
    
    .spinner .path {
      stroke: #1a1a1a;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
    
    @keyframes rotate {
      100% { transform: rotate(360deg); }
    }
    
    @keyframes dash {
      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'login-view': LoginView;
  }
}
