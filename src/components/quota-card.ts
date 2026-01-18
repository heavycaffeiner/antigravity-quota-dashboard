import { LitElement, html, css, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ModelQuotaInfo } from '../types';

@customElement('quota-card')
export class QuotaCard extends LitElement {
  @property({ type: Object }) model!: ModelQuotaInfo;

  static styles = css`
    :host {
      display: block;
      font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
      --card-bg: var(--vscode-editor-background, #1e1e1e);
      --card-border: var(--vscode-widget-border, #333);
      --text-primary: var(--vscode-editor-foreground, #ffffff);
      --text-secondary: var(--vscode-descriptionForeground, #aaaaaa);
      
      /* Status Colors */
      --color-normal: var(--vscode-charts-green, #3fb950);
      --color-warning: var(--vscode-charts-yellow, #cca700);
      --color-critical: var(--vscode-charts-red, #f14c4c);
      --color-depleted: var(--vscode-errorForeground, #f14c4c);
      
      --status-color: var(--color-normal); /* Default */
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
      overflow: hidden;
      min-width: 200px;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      border-color: var(--status-color);
    }

    /* "New" Badge */
    .badge-new {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--vscode-activityBarBadge-background, #007acc);
      color: var(--vscode-activityBarBadge-foreground, #ffffff);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 2;
    }

    /* Circular Progress */
    .progress-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(
        var(--status-color) var(--percentage, 0%), 
        rgba(255, 255, 255, 0.1) var(--percentage, 0%) 100%
      );
      -webkit-mask: radial-gradient(transparent 62%, black 63%);
      mask: radial-gradient(transparent 62%, black 63%);
      transition: background 0.5s ease-out;
    }

    .progress-value {
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .percentage {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .percentage-symbol {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    .status-text {
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Model Info */
    .model-info {
      text-align: center;
      width: 100%;
    }

    .model-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Capabilities */
    .capabilities {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      margin-top: 0.5rem;
    }

    .cap-pill {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-secondary);
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s;
    }

    .card:hover .cap-pill {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-primary);
    }

    /* Icon styling */
    .icon {
      width: 12px;
      height: 12px;
      fill: currentColor;
    }
  `;

  private getStatusColor() {
    switch (this.model.status) {
      case 'NORMAL': return 'var(--color-normal)';
      case 'WARNING': return 'var(--color-warning)';
      case 'CRITICAL': return 'var(--color-critical)';
      case 'DEPLETED': return 'var(--color-depleted)';
      default: return 'var(--color-normal)';
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
      return svg`<svg class="icon" viewBox="0 0 16 16"><path d="M14 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM2 4h12v8H2V4zm3 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-1 5l2.5-3 2 2.5 2-1.5L13 11H4z"/></svg>`;
    }
    if (lowerCap.includes('think') || lowerCap.includes('reason')) {
      return svg`<svg class="icon" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13V8a5 5 0 0 1 0-10v2a3 3 0 1 0 0 6v6z"/></svg>`;
    }
    if (lowerCap.includes('code')) {
      return svg`<svg class="icon" viewBox="0 0 16 16"><path d="M4.7 10.3L1.4 7l3.3-3.3L3.3 2.3 0 5.6v2.8l3.3 3.3 1.4-1.4zm6.6 0l3.3-3.3L11.3 3.7 12.7 2.3 16 5.6v2.8l-3.3 3.3-1.4-1.4zM8.8 2.5h-1.6l-2 11h1.6l2-11z"/></svg>`;
    }
    return null;
  }

  render() {
    if (!this.model) return html``;

    const percentage = this.getPercentage();
    const colorVar = this.getStatusColor();

    return html`
      <div class="card" style="--status-color: ${colorVar};">
        ${this.model.isNew ? html`<div class="badge-new">New</div>` : ''}
        
        <div class="progress-container">
          <div class="progress-ring" style="--percentage: ${percentage}%"></div>
          <div class="progress-value">
            <span class="percentage">
              ${percentage}<span class="percentage-symbol">%</span>
            </span>
            <span class="status-text">${this.model.status}</span>
          </div>
        </div>

        <div class="model-info">
          <h3 class="model-name" title="${this.model.name}">${this.model.name}</h3>
          
          <div class="capabilities">
            ${this.model.capabilities?.map(cap => html`
              <div class="cap-pill" title="${cap}">
                ${this.getCapIcon(cap)}
                <span>${cap}</span>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quota-card': QuotaCard;
  }
}
