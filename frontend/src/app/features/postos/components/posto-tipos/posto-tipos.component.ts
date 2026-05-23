import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiariasPorTipoItem {
  tipo: string;
  count: number;
  icon: string;
}

@Component({
  selector: 'app-posto-tipos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="tipos-section">
      <h2 class="section-title">Distribuição por Tipo</h2>
      <div class="tipos-grid">
        @for (item of diariasPorTipo(); track item.tipo) {
          <div class="tipo-card">
            <div class="tipo-icon">{{ item.icon }}</div>
            <div class="tipo-content">
              <span class="tipo-label">{{ item.tipo }}</span>
              <span class="tipo-count">{{ item.count }}</span>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .tipos-section {
        margin-bottom: var(--space-8);
      }
      .section-title {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin-bottom: var(--space-4);
      }
      .tipos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--space-4);
      }
      .tipo-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
      .tipo-icon {
        width: 40px;
        height: 40px;
        background: var(--surface-hover);
        color: var(--text-secondary);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--fw-bold);
        font-size: var(--text-lg);
      }
      .tipo-content {
        display: flex;
        flex-direction: column;
      }
      .tipo-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
      .tipo-count {
        font-size: var(--text-xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
      }
    `
  ]
})
export class PostoTiposComponent {
  diariasPorTipo = input<DiariasPorTipoItem[]>([]);
}
