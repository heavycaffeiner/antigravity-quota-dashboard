import { LitElement, html, css, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ModelQuotaInfo } from '../types';

@customElement('quota-list-item')
export class QuotaListItem extends LitElement {
  @property({ type: Object }) model!: ModelQuotaInfo;

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 280px 180px 1fr 140px 140px;
      gap: 1.5rem;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-subtle);
      font-family: var(--vscode-font-family);
      font-size: 0.9rem;
      transition: background 0.2s ease;
      color: var(--text-primary);
    }

    :host(:hover) {
      background: var(--bg-card-hover);
    }

    :host(:last-child) {
      border-bottom: none;
    }

    /* Column 1: Icon & Name */
    .col-name {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .model-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      flex-shrink: 0;
      color: var(--text-secondary);
    }

    .model-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .model-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-primary);
    }

    .model-sub {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    /* Column 2: Capabilities */
    .col-caps {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .cap-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .cap-icon {
      width: 10px;
      height: 10px;
      fill: currentColor;
    }

    /* Column 3: Usage */
    .col-usage {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .usage-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .progress-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
      overflow: hidden;
      width: 100%;
    }

    .progress-fill {
      height: 100%;
      background: var(--status-color, var(--success));
      border-radius: 3px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Column 4: Status */
    .col-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--status-color);
      box-shadow: 0 0 8px var(--status-color);
    }

    .status-text {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    /* Column 5: Reset */
    .col-reset {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* Mobile / Responsive adjustments */
    @media (max-width: 900px) {
      :host {
        grid-template-columns: 1fr 1fr;
        grid-template-areas:
          "name status"
          "usage usage"
          "caps reset";
        gap: 1rem;
        padding: 1rem;
      }

      .col-name { grid-area: name; }
      .col-status { grid-area: status; justify-content: flex-end; }
      .col-usage { grid-area: usage; }
      .col-caps { grid-area: caps; }
      .col-reset { grid-area: reset; }
    }
  `;

  private getStatusColor() {
    switch (this.model.status) {
      case 'NORMAL': return 'var(--success)';
      case 'WARNING': return 'var(--warning)';
      case 'CRITICAL': return 'var(--error)';
      case 'DEPLETED': return 'var(--error)';
      default: return 'var(--success)';
    }
  }

  private getPercentage() {
    if (this.model.remainingFraction !== undefined) {
      return Math.round(this.model.remainingFraction * 100);
    }
    return 0;
  }

  private getCapIcon(cap: string) {
    const lowerCap = cap.toLowerCase();
    if (lowerCap.includes('image') || lowerCap.includes('vision')) {
      return svg`<svg class="cap-icon" viewBox="0 0 16 16"><path d="M14 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM2 4h12v8H2V4zm3 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-1 5l2.5-3 2 2.5 2-1.5L13 11H4z"/></svg>`;
    }
    if (lowerCap.includes('think') || lowerCap.includes('reason')) {
      return svg`<svg class="cap-icon" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13V8a5 5 0 0 1 0-10v2a3 3 0 1 0 0 6v6z"/></svg>`;
    }
    if (lowerCap.includes('code')) {
      return svg`<svg class="cap-icon" viewBox="0 0 16 16"><path d="M4.7 10.3L1.4 7l3.3-3.3L3.3 2.3 0 5.6v2.8l3.3 3.3 1.4-1.4zm6.6 0l3.3-3.3L11.3 3.7 12.7 2.3 16 5.6v2.8l-3.3 3.3-1.4-1.4zM8.8 2.5h-1.6l-2 11h1.6l2-11z"/></svg>`;
    }
    return null;
  }

  private getModelIcon() {
    const name = this.model.name.toLowerCase();
    if (name.includes('claude')) {
      return svg`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;
    }
    if (name.includes('gemini')) {
      return svg`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2zm0 18l-8-8 8-8 8 8-8 8z"/></svg>`;
    }
    return svg`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>`;
  }

  private _formatResetTime() {
    if (!this.model.resetTime) return 'Ready';
    const reset = new Date(this.model.resetTime);
    const now = new Date();
    const diffMs = reset.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ready';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 24) return `in ${Math.floor(diffHrs / 24)} days`;
    if (diffHrs > 0) return `in ${diffHrs}h ${diffMins}m`;
    return `in ${diffMins}m`;
  }

  private _getProvider() {
    if (this.model.name.toLowerCase().includes('claude')) return 'Anthropic';
    if (this.model.name.toLowerCase().includes('gemini')) return 'Google';
    return 'AI Model';
  }

  render() {
    if (!this.model) return html``;

    const percentage = this.getPercentage();
    const statusColor = this.getStatusColor();
    const resetText = this._formatResetTime();

    return html`
      <div style="display: contents; --status-color: ${statusColor}">
        <!-- Col 1: Icon/Name -->
        <div class="col-name">
          <div class="model-icon">
            ${this.getModelIcon()}
          </div>
          <div class="model-info">
            <span class="model-name" title="${this.model.name}">${this.model.name}</span>
            <span class="model-sub">${this._getProvider()}</span>
          </div>
        </div>

        <!-- Col 2: Capabilities -->
        <div class="col-caps">
          ${this.model.capabilities?.map(cap => html`
            <div class="cap-badge">
              ${this.getCapIcon(cap)}
              <span>${cap}</span>
            </div>
          `)}
        </div>

        <!-- Col 3: Usage -->
        <div class="col-usage">
          <div class="usage-header">
            <span>Usage</span>
            <span>${percentage}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>

        <!-- Col 4: Status -->
        <div class="col-status">
          <div class="status-dot"></div>
          <span class="status-text">${this.model.status.toLowerCase()}</span>
        </div>

        <!-- Col 5: Reset -->
        <div class="col-reset">
          ${resetText}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quota-list-item': QuotaListItem;
  }
}
