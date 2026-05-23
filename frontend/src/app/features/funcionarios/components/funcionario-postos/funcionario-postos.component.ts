import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiariasPorPostoItem {
  posto: {
    id: string;
    nome: string;
    cidade: string;
  };
  total: number;
}

@Component({
  selector: 'app-funcionario-postos',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (diariasPorPosto().length > 0) {
      <section class="postos-section">
        <h2 class="section-title">Diárias por Posto de Trabalho</h2>
        <div class="postos-grid">
          @for (item of diariasPorPosto(); track item.posto.id) {
            <div class="posto-card">
              <div class="posto-header">
                <span class="posto-horario">{{ item.posto.nome }} - {{ item.posto.cidade }}</span>
                <span class="posto-total">{{ item.total }} diárias</span>
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      .postos-section {
        margin-bottom: var(--space-8);
      }
      .section-title {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin-bottom: var(--space-4);
      }
      .postos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--space-4);
      }
      .posto-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
      }
      .posto-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .posto-horario {
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
      }
      .posto-total {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: var(--surface-hover);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
      }
    `
  ]
})
export class FuncionarioPostosComponent {
  diariasPorPosto = input<DiariasPorPostoItem[]>([]);
}
