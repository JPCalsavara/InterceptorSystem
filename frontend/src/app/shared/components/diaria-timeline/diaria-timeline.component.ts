import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Diaria, StatusDiaria } from '../../../models';

interface TimelineGroup {
  original: Diaria;
  substituicoes: Diaria[];
}

@Component({
  selector: 'app-diaria-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container">
      @if (groupedDiarias().length === 0) {
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p>Nenhum histórico de substituições encontrado.</p>
        </div>
      } @else {
        <div class="timeline">
          @for (group of groupedDiarias(); track group.original.id) {
            <div class="timeline-group">
              <!-- Item Original -->
              <div class="timeline-item original">
                <div class="timeline-marker" [ngClass]="getStatusClass(group.original.statusDiaria)"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="date">{{ formatDate(group.original.data) }}</span>
                    <span class="badge" [ngClass]="getStatusClass(group.original.statusDiaria)">
                      {{ getStatusLabel(group.original.statusDiaria) }}
                    </span>
                  </div>
                  <div class="timeline-body">
                    <strong>{{ group.original.funcionario?.nome || 'Funcionário Desconhecido' }}</strong>
                    @if (group.original.origemModificacao) {
                      <span class="origem">Modificado por: {{ group.original.origemModificacao }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Substituições -->
              @for (sub of group.substituicoes; track sub.id) {
                <div class="timeline-item substituicao">
                  <div class="timeline-connector"></div>
                  <div class="timeline-marker" [ngClass]="getStatusClass(sub.statusDiaria)"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="badge badge-info">Substituição</span>
                      <span class="badge" [ngClass]="getStatusClass(sub.statusDiaria)">
                        {{ getStatusLabel(sub.statusDiaria) }}
                      </span>
                    </div>
                    <div class="timeline-body">
                      <strong>{{ sub.funcionario?.nome || 'Substituto Desconhecido' }}</strong>
                      @if (sub.origemModificacao) {
                        <span class="origem">Registrado por: {{ sub.origemModificacao }}</span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline-container {
      padding: var(--space-4);
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      color: var(--text-tertiary);
      gap: var(--space-2);
      
      p { margin: 0; font-size: var(--text-sm); }
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .timeline-group {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .timeline-item {
      position: relative;
      display: flex;
      gap: var(--space-4);
      padding-left: var(--space-2);
    }

    .timeline-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--border-color);
      margin-top: 6px;
      position: relative;
      z-index: 2;
      flex-shrink: 0;

      &.badge-success { background: var(--success-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--success-color) 20%, transparent); }
      &.badge-danger { background: var(--error-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--error-color) 20%, transparent); }
      &.badge-warning { background: var(--warning-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--warning-color) 20%, transparent); }
      &.badge-inactive { background: var(--text-secondary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--text-secondary) 20%, transparent); }
    }

    .timeline-connector {
      position: absolute;
      left: 14px; /* center of marker */
      top: -100%;
      bottom: 12px;
      width: 2px;
      background: var(--border-color);
      z-index: 1;
    }

    .substituicao {
      margin-top: var(--space-4);
      .timeline-marker {
        width: 10px;
        height: 10px;
        margin-left: 1px;
        margin-top: 7px;
      }
    }

    .timeline-content {
      flex: 1;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      border: 1px solid var(--border-color);
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);

      .date {
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        font-size: var(--text-sm);
      }
    }

    .timeline-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);

      strong {
        color: var(--text-primary);
        font-size: var(--text-sm);
      }

      .origem {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        font-style: italic;
      }
    }

    .badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      font-weight: var(--fw-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.badge-success { background: color-mix(in srgb, var(--success-color) 15%, transparent); color: var(--success-color); }
      &.badge-danger { background: color-mix(in srgb, var(--error-color) 15%, transparent); color: var(--error-color); }
      &.badge-warning { background: color-mix(in srgb, var(--warning-color) 15%, transparent); color: var(--warning-color); }
      &.badge-info { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
      &.badge-inactive { background: color-mix(in srgb, var(--text-secondary) 15%, transparent); color: var(--text-secondary); }
    }
  `]
})
export class DiariaTimelineComponent {
  diarias = input.required<Diaria[]>();

  groupedDiarias = computed<TimelineGroup[]>(() => {
    const list = this.diarias();
    if (!list) return [];

    // Map by ID
    const dict = new Map<string, Diaria>();
    list.forEach(d => dict.set(d.id, d));

    // Encontrar substituicoes e mapeá-las pro original
    const groups = new Map<string, TimelineGroup>();

    list.forEach(d => {
      // Se é substituição de alguém
      if (d.diariaSubstituidaId && dict.has(d.diariaSubstituidaId)) {
        const originalId = d.diariaSubstituidaId;
        
        if (!groups.has(originalId)) {
          groups.set(originalId, {
            original: dict.get(originalId)!,
            substituicoes: []
          });
        }
        groups.get(originalId)!.substituicoes.push(d);
      }
    });

    // Converter para array
    return Array.from(groups.values()).sort((a, b) => {
      return new Date(b.original.data).getTime() - new Date(a.original.data).getTime();
    });
  });

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatusLabel(status: StatusDiaria): string {
    const labels: Record<string, string> = {
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelamento',
      FALTA_INJUSTIFICADA: 'Falta Injustificada',
      FALTA_JUSTIFICADA: 'Falta Justificada'
    };
    return labels[status as string] || status;
  }

  getStatusClass(status: StatusDiaria): string {
    const classes: Record<string, string> = {
      CONFIRMADA: 'badge-success',
      CANCELADA: 'badge-inactive',
      FALTA_INJUSTIFICADA: 'badge-danger',
      FALTA_JUSTIFICADA: 'badge-warning'
    };
    return classes[status as string] || '';
  }
}
