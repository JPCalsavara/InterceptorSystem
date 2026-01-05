import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type ViewMode = 'semana' | 'mes';

@Component({
  selector: 'app-alocacoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📅 Alocações</h1>
        <div class="view-toggle">
          <button
            [class.active]="viewMode() === 'semana'"
            (click)="viewMode.set('semana')"
            class="toggle-btn"
          >
            Semanal
          </button>
          <button
            [class.active]="viewMode() === 'mes'"
            (click)="viewMode.set('mes')"
            class="toggle-btn"
          >
            Mensal
          </button>
        </div>
      </div>

      <div class="info-box">
        <h3>🗓️ Visualização {{ viewMode() === 'semana' ? 'Semanal' : 'Mensal' }}</h3>
        <p>Em desenvolvimento - Escala de funcionários nos postos de trabalho</p>
        <ul>
          <li>✅ Validação de turnos consecutivos (bloqueio automático)</li>
          <li>✅ Dobras programadas (exceção à regra)</li>
          <li>✅ Filtro por condomínio e funcionário</li>
          <li>✅ Exportação para PDF/Excel</li>
        </ul>
      </div>

      <a routerLink="/" class="back-link">← Voltar ao Dashboard</a>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      h1 {
        font-size: 2rem;
        color: #333;
        margin: 0;
      }
      .view-toggle {
        display: flex;
        gap: 0.5rem;
        background: #f5f5f5;
        padding: 0.25rem;
        border-radius: 8px;
      }
      .toggle-btn {
        background: transparent;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        color: #666;
        transition: all 0.2s;
      }
      .toggle-btn.active {
        background: #9c27b0;
        color: white;
      }
      .info-box {
        background: white;
        border-left: 4px solid #9c27b0;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .info-box h3 {
        margin-top: 0;
        color: #9c27b0;
      }
      .info-box ul {
        margin: 1rem 0 0 0;
        padding-left: 1.5rem;
      }
      .info-box li {
        margin: 0.5rem 0;
        color: #666;
      }
      .back-link {
        display: inline-block;
        margin-top: 1rem;
        color: #9c27b0;
        text-decoration: none;
      }
    `,
  ],
})
export class AlocacoesComponent {
  viewMode = signal<ViewMode>('semana');
}
