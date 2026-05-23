import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Posto, Alocacao } from '../../../../models';

@Component({
  selector: 'app-contrato-postos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card card-postos">
      <h2 class="card-title">Postos de Trabalho ({{ postos().length }})</h2>
      @if (postos().length === 0) {
        <p class="empty-state">Nenhum posto de trabalho vinculado ainda.</p>
      } @else {
        <div class="table-wrapper">
          <table class="postos-table">
            <thead>
              <tr>
                <th>Posto</th>
                <th>Alocações</th>
                <th>Capacidade Ideal Cliente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (posto of postos(); track posto.id) {
                <tr>
                  <td class="horario">{{ posto.nome }} - {{ posto.cidade }}</td>
                  <td>{{ getAlocacoesPorPosto(posto.id) }}</td>
                  <td>{{ quantidadeFuncionarios() }}</td>
                  <td>
                    <a [routerLink]="['/postos', posto.id]" class="link-detail">Ver detalhes</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .card-postos {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-5);
      }
      .card-title {
        font-size: var(--text-xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin-top: 0;
        margin-bottom: var(--space-4);
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: var(--space-2);
      }
      .empty-state {
        color: var(--text-secondary);
        font-style: italic;
      }
      .table-wrapper {
        overflow-x: auto;
      }
      .postos-table {
        width: 100%;
        border-collapse: collapse;
      }
      .postos-table th, .postos-table td {
        padding: var(--space-3);
        text-align: left;
        border-bottom: 1px solid var(--border-subtle);
        font-size: var(--text-sm);
      }
      .postos-table th {
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
      }
      .link-detail {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: var(--fw-medium);
      }
      .link-detail:hover {
        text-decoration: underline;
      }
      .horario {
        font-weight: var(--fw-medium);
      }
    `
  ]
})
export class ContratoPostosComponent {
  postos = input<Posto[]>([]);
  alocacoes = input<Alocacao[]>([]);
  quantidadeFuncionarios = input<number>(0);

  getAlocacoesPorPosto(postoId: string): number {
    return this.alocacoes().filter((a) => a.postoId === postoId).length;
  }
}
