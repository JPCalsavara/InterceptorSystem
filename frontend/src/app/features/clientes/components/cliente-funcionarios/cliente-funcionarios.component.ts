import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Funcionario, Diaria, StatusDiaria } from '../../../../models';

@Component({
  selector: 'app-cliente-funcionarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="section-funcionarios">
      <div class="section-header">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1.2em; height: 1.2em">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          Funcionários ({{ funcionarios().length }})
        </h2>
        @if (clienteId()) {
          <a [routerLink]="['/funcionarios', 'novo']" [queryParams]="{ clienteId: clienteId() }" class="btn-add">
            + Adicionar Funcionário
          </a>
        }
      </div>

      @if (funcionarios().length === 0) {
        <div class="empty-state">
          <p>Nenhum funcionário cadastrado</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Real Mês Atual</th>
                <th>Faltas</th>
                <th class="actions-column">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (func of funcionarios(); track func.id) {
                <tr>
                  <td><strong>{{ func.nome }}</strong></td>
                  <td>{{ func.cpf }}</td>
                  <td>{{ getTipoFuncionarioLabel(func.tipoFuncionario) }}</td>
                  <td>
                    <span [class]="'badge ' + getStatusFuncionarioBadgeClass(func.statusFuncionario)">
                      {{ getStatusFuncionarioLabel(func.statusFuncionario) }}
                    </span>
                  </td>
                  <td>{{ formatCurrency(salariosPorFuncionario().get(func.id) ?? 0) }}</td>
                  <td>
                    @if (getFaltasByFuncionario(func.id) > 0) {
                      <span class="badge badge-warning">{{ getFaltasByFuncionario(func.id) }}</span>
                    } @else {
                      <span class="badge badge-success">0</span>
                    }
                  </td>
                  <td class="actions-column">
                    <a [routerLink]="['/funcionarios', func.id, 'editar']" class="btn-icon" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1em; height: 1em">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                      </svg>
                    </a>
                    <button (click)="onDeleteFuncionario(func.id)" class="btn-icon btn-danger" title="Excluir">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1em; height: 1em">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .section-funcionarios {
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
      .table-container {
        width: 100%;
        overflow-x: auto;
        background: var(--surface-card);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-sm);
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 700px;
      }
      .data-table th, .data-table td {
        padding: var(--space-4);
        text-align: left;
        border-bottom: 1px solid var(--border-subtle);
        font-size: var(--text-sm);
      }
      .data-table th {
        background: var(--surface-hover);
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        white-space: nowrap;
      }
      .data-table tbody tr:hover {
        background: var(--surface-hover);
      }
      .badge {
        display: inline-block;
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
      }
      .badge-success {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
      }
      .badge-warning {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
      }
      .badge-error {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
      }
      .badge-info {
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary-color);
      }
      .actions-column {
        display: flex;
        gap: var(--space-2);
      }
      .btn-icon {
        color: var(--text-secondary);
        transition: color 0.2s;
        text-decoration: none;
        display: inline-flex;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
      }
      .btn-icon:hover {
        color: var(--primary-color);
      }
      .btn-danger:hover {
        color: #dc2626;
      }
    `
  ]
})
export class ClienteFuncionariosComponent {
  clienteId = input<string | undefined>();
  funcionarios = input<Funcionario[]>([]);
  diarias = input<Diaria[]>([]);
  salariosPorFuncionario = input<Map<string, number>>(new Map());

  deleteFuncionario = output<string>();

  getTipoFuncionarioLabel(tipo: string): string {
    const labels: Record<string, string> = {
      CLT: 'CLT',
      FREELANCER: 'Freelancer',
      TERCEIRIZADO: 'Terceirizado',
    };
    return labels[tipo] || tipo;
  }

  getStatusFuncionarioLabel(status: string): string {
    const labels: Record<string, string> = {
      ATIVO: 'Ativo',
      FERIAS: 'Férias',
      AFASTADO: 'Afastado',
      DEMITIDO: 'Demitido',
    };
    return labels[status] || status;
  }

  getStatusFuncionarioBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      ATIVO: 'badge-success',
      FERIAS: 'badge-warning',
      AFASTADO: 'badge-warning',
      DEMITIDO: 'badge-error',
    };
    return classes[status] || 'badge-info';
  }

  getFaltasByFuncionario(funcionarioId: string): number {
    return this.diarias().filter(
      (a) =>
        a.funcionarioId === funcionarioId &&
        (a.statusDiaria === StatusDiaria.FALTA_INJUSTIFICADA ||
          a.statusDiaria === StatusDiaria.CANCELADA)
    ).length;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  onDeleteFuncionario(id: string): void {
    if (confirm('Tem certeza que deseja apagar este funcionário?')) {
      this.deleteFuncionario.emit(id);
    }
  }
}
