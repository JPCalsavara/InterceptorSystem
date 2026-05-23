import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-funcionario-metricas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="metrics-section">
      <h2 class="section-title">Métricas de Desempenho</h2>
      <div class="metrics-grid">
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
            <span class="metric-label">Diárias Confirmadas</span>
            <span class="metric-value">{{ diariasConfirmadas() }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Faltas Registradas</span>
            <span class="metric-value">{{ totalFaltas() }}</span>
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

        <div class="metric-card">
          <div class="metric-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Prejuízo por Faltas</span>
            <span class="metric-value danger">{{ formatCurrency(prejuizoPorFaltas()) }}</span>
          </div>
        </div>

        @if (temContrato()) {
          <div class="metric-card">
            <div class="metric-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="metric-content">
              <span class="metric-label">Salário Simulado</span>
              <span class="metric-value" title="Diárias confirmadas do mês × diária + adicionais FDS/noturno + benefícios">{{ formatCurrency(salarioSimulado()) }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="metric-content">
              <span class="metric-label">Projeção Mês Completo</span>
              <span class="metric-value" title="Estimativa para mês completo: dias médios da escala × diária + benefícios">{{ formatCurrency(salarioMesCompleto()) }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="metric-content">
              <span class="metric-label">Cancelamentos</span>
              <span class="metric-value" [class.alert]="totalCanceladas() > 0">{{ totalCanceladas() }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="metric-content">
              <span class="metric-label">Multa por Cancelamentos</span>
              <span class="metric-value" [class.danger]="multaPorCancelamentos() > 0">{{ formatCurrency(multaPorCancelamentos()) }}</span>
            </div>
          </div>
        }
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
      .metric-value.danger {
        color: #dc2626;
      }
      .metric-value.alert {
        color: #d97706;
      }
    `
  ]
})
export class FuncionarioMetricasComponent {
  totalDiarias = input<number>(0);
  diariasConfirmadas = input<number>(0);
  totalFaltas = input<number>(0);
  taxaPresenca = input<number>(0);
  prejuizoPorFaltas = input<number>(0);
  temContrato = input<boolean>(false);
  salarioSimulado = input<number>(0);
  salarioMesCompleto = input<number>(0);
  totalCanceladas = input<number>(0);
  multaPorCancelamentos = input<number>(0);

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
