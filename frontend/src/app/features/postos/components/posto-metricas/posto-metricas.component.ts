import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-posto-metricas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="metrics-section">
      <h2 class="section-title">Métricas do Posto</h2>
      <div class="metrics-grid">
        <div class="metric-card highlight">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Alocações (Turnos)</span>
            <span class="metric-value primary">{{ alocacoesLength() }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Total de Diárias</span>
            <span class="metric-value">{{ totalDiarias() }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Confirmadas</span>
            <span class="metric-value success">{{ diariasConfirmadas() }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Total de Faltas</span>
            <span class="metric-value alert">{{ totalFaltas() }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Canceladas</span>
            <span class="metric-value">{{ diariasCanceladas() }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Taxa de Presença</span>
            <span class="metric-value">{{ taxaPresenca() | number: '1.1-1' }}%</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .metrics-section {
        margin-bottom: var(--space-8);
      }
      .section-title {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin-bottom: var(--space-4);
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--space-4);
      }
      .metric-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
      .metric-card.highlight {
        border-color: var(--primary-color);
        background: var(--surface-hover);
      }
      .metric-icon {
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--surface-hover);
        border-radius: var(--radius-md);
      }
      .metric-card.highlight .metric-icon {
        color: var(--primary-color);
        background: var(--surface-card);
      }
      .metric-content {
        display: flex;
        flex-direction: column;
      }
      .metric-label {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .metric-value {
        font-size: var(--text-xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
      }
      .metric-value.primary { color: var(--primary-color); }
      .metric-value.success { color: #16a34a; }
      .metric-value.alert { color: #d97706; }
    `
  ]
})
export class PostoMetricasComponent {
  alocacoesLength = input<number>(0);
  totalDiarias = input<number>(0);
  diariasConfirmadas = input<number>(0);
  totalFaltas = input<number>(0);
  diariasCanceladas = input<number>(0);
  taxaPresenca = input<number>(0);
}
