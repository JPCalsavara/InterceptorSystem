import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alocacao } from '../../../../models';

@Component({
  selector: 'app-posto-alocacoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="alocacoes-section" aria-labelledby="alocacoes-title">
      <div class="section-header">
        <h2 id="alocacoes-title" class="section-title">Turnos (Alocações)</h2>
      </div>
      <ul class="alocacoes-grid" role="list">
        <li *ngFor="let aloc of alocacoes(); trackBy: trackAloc" class="alocacao-card" role="listitem">
          <header class="alocacao-header">
            <span class="horario" aria-label="Horário">{{ aloc.horarioInicio.substring(0,5) }} - {{ aloc.horarioFim.substring(0,5) }}</span>
            <span class="escala-badge" aria-label="Tipo de escala">{{ aloc.tipoEscala }}</span>
          </header>
          <div class="alocacao-body">
            <div class="info-item">
              <span class="label">Noturno:</span>
              <span class="value" aria-label="Horário noturno">{{ aloc.temHorarioNoturno ? 'Sim' : 'Não' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Permite Dobra:</span>
              <span class="value" aria-label="Permite dobrar escala">{{ aloc.permiteDobrarEscala ? 'Sim' : 'Não' }}</span>
            </div>
          </div>
        </li>
        <li *ngIf="alocacoes().length === 0" class="empty-state" role="listitem">
          <p>Nenhuma alocação (turno) cadastrada para este posto.</p>
        </li>
      </ul>
    </section>
  `,
  styles: [
    `
      .alocacoes-section {
        margin-bottom: var(--space-8);
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-4);
      }
      .section-title {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin: 0;
      }
      .alocacoes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--space-4);
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .alocacao-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .alocacao-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
        border-color: var(--primary-color);
      }
      .alocacao-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: var(--space-2);
      }
      .horario {
        font-size: var(--text-lg);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
      }
      .escala-badge {
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        background: var(--surface-hover);
        color: var(--text-secondary);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
      }
      .alocacao-body {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .info-item {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-sm);
      }
      .label {
        color: var(--text-secondary);
      }
      .value {
        font-weight: var(--fw-medium);
        color: var(--text-primary);
      }
      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--space-8);
        background: var(--surface-card);
        border: 1px dashed var(--border-subtle);
        border-radius: var(--radius-lg);
        color: var(--text-secondary);
      }
    `
  ]
})
export class PostoAlocacoesComponent {
  alocacoes = input<Alocacao[]>([]);

  trackAloc(index: number, aloc: Alocacao): string {
    return aloc.id;
  }
}
