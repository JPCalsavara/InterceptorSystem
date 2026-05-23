import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Posto, Alocacao } from '../../../../models';

@Component({
  selector: 'app-cliente-postos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="section-postos">
      <div class="section-header">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1.2em; height: 1.2em">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          Postos de Trabalho ({{ postos().length }})
        </h2>
        @if (clienteId()) {
          <a [routerLink]="['/postos', 'novo']" [queryParams]="{ clienteId: clienteId() }" class="btn-add">
            + Adicionar Posto
          </a>
        }
      </div>

      @if (postos().length === 0) {
        <div class="empty-state">
          <p>Nenhum posto cadastrado</p>
        </div>
      } @else {
        <div class="postos-grid">
          @for (posto of postos(); track posto.id) {
            <div class="posto-card">
              <div class="posto-header">
                <h3>{{ posto.nome }}</h3>
                <div class="posto-actions">
                  <a [routerLink]="['/postos', posto.id, 'editar']" class="btn-icon" title="Editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1em; height: 1em">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                  </a>
                </div>
              </div>
              <div class="posto-info">
                <div class="info-row">
                  <span class="label">Local:</span>
                  <span class="value">{{ posto.cidade }} - {{ posto.estado }}</span>
                </div>
                <!-- Link Novo Turno -->
                <div style="margin-top: 0.5rem">
                  <a
                    [routerLink]="['/alocacoes/novo']"
                    [queryParams]="{ clienteId: clienteId(), postoId: posto.id }"
                    style="font-size: 0.8rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.25rem; font-weight: 500;"
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Adicionar Turno
                  </a>
                </div>
              </div>

              <div class="alocacoes-list">
                <h4 style="margin-top: 1rem; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                  Turnos/Alocações
                </h4>
                @for (alocacao of getAlocacoesPorPosto(posto.id); track alocacao.id) {
                  <div style="background: var(--surface-color); padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--border-color); margin-bottom: 0.5rem; position: relative;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem">
                      <strong>{{ getEscalaLabel(alocacao.tipoEscala) }}</strong>
                      <span class="badge badge-info">{{ formatHorario(alocacao.horarioInicio, alocacao.horarioFim) }}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem">
                      <a [routerLink]="['/alocacoes', alocacao.id]" style="color: var(--primary-color); font-size: 0.75rem">Detalhes</a>
                      <a [routerLink]="['/alocacoes', alocacao.id, 'editar']" style="color: var(--text-secondary); font-size: 0.75rem">Editar</a>
                    </div>
                  </div>
                }
                @if (getAlocacoesPorPosto(posto.id).length === 0) {
                  <p style="font-size: 0.85rem; color: var(--text-muted)">Nenhuma alocação cadastrada neste posto.</p>
                }
              </div>
            </div>
          }
        </div>
      }
    </section>

    <!-- Top Postos com Mais Faltas -->
    @if (postosMaisFaltas().length > 0) {
      <section class="section-alertas">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1.2em; height: 1.2em">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          Postos com Mais Faltas ({{ periodoLabel() }})
        </h2>
        <div class="alertas-list">
          @for (item of postosMaisFaltas(); track item.posto.id) {
            <div class="alerta-item">
              <div class="alerta-info">
                <span class="alerta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1.5rem; height: 1.5rem; color: var(--primary-color)">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </span>
                <div>
                  <strong>{{ item.posto.nome }} - {{ item.posto.cidade }}</strong>
                  <p>{{ item.faltas }} falta(s) registrada(s)</p>
                </div>
              </div>
              <span class="badge badge-error">{{ item.faltas }}</span>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      .section-postos, .section-alertas {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        margin-bottom: var(--space-8);
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: var(--space-3);
      }
      .section-header h2 {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin: 0;
      }
      .btn-add {
        background: var(--primary-color);
        color: white;
        text-decoration: none;
        padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        transition: all 0.2s ease;
      }
      .btn-add:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
      }
      .empty-state {
        background: var(--surface-card);
        border: 1px dashed var(--border-strong);
        border-radius: var(--radius-lg);
        padding: var(--space-8);
        text-align: center;
        color: var(--text-secondary);
      }
      .postos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-4);
      }
      .posto-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-5);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .posto-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .posto-header h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
      }
      .btn-icon {
        color: var(--text-secondary);
        transition: color 0.2s;
        text-decoration: none;
        display: inline-flex;
      }
      .btn-icon:hover {
        color: var(--primary-color);
      }
      .posto-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-sm);
      }
      .info-row .label {
        color: var(--text-secondary);
      }
      .info-row .value {
        font-weight: var(--fw-medium);
        color: var(--text-primary);
      }
      .alocacoes-list {
        border-top: 1px solid var(--border-subtle);
        padding-top: var(--space-3);
        margin-top: var(--space-2);
      }
      .badge {
        display: inline-block;
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
      }
      .badge-info {
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary-color);
      }
      .badge-error {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
      }
      .alertas-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-4);
      }
      .alerta-item {
        background: rgba(220, 38, 38, 0.05);
        border: 1px solid rgba(220, 38, 38, 0.2);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .alerta-info {
        display: flex;
        gap: var(--space-3);
        align-items: center;
      }
      .alerta-info strong {
        color: var(--text-primary);
        display: block;
        font-size: var(--text-sm);
      }
      .alerta-info p {
        color: #dc2626;
        margin: 0;
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
      }
      @media (max-width: 768px) {
        .postos-grid, .alertas-list {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class ClientePostosComponent {
  clienteId = input<string | undefined>();
  postos = input<Posto[]>([]);
  alocacoes = input<Alocacao[]>([]);
  postosMaisFaltas = input<any[]>([]);
  periodoLabel = input<string>('');

  getAlocacoesPorPosto(postoId: string): Alocacao[] {
    return this.alocacoes().filter((a) => a.postoId === postoId);
  }

  getEscalaLabel(tipo: string): string {
    const labels: Record<string, string> = {
      DOZE_POR_TRINTA_SEIS: '12x36',
      SEMANAL_COMERCIAL: 'Comercial',
      OITO_HORAS_SEIS_POR_DOIS: '8h (6x2)',
      FOLGUISTA: 'Folguista',
    };
    return labels[tipo] || tipo;
  }

  formatHorario(inicio: string, fim: string): string {
    const inicioFormatado = inicio.substring(0, 5);
    const fimFormatado = fim.substring(0, 5);
    return `${inicioFormatado} às ${fimFormatado}`;
  }
}
