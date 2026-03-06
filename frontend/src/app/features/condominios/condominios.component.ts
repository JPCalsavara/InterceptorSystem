import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-condominios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--primary-color);font-size:2rem;width:1em;height:1em">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
        <h1>Condomínios</h1>
        <button class="btn-primary" routerLink="/condominios/novo">+ Novo Condomínio</button>
      </div>
      <p class="coming-soon">Em desenvolvimento - CRUD completo em breve</p>
      <a routerLink="/" class="back-link">← Voltar ao Dashboard</a>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-8);
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-8);
      }
      .page-header h1 {
        font-size: var(--text-3xl);
        font-weight: var(--fw-extrabold);
        color: var(--text-primary);
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      .btn-primary {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-primary:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
      .coming-soon {
        background: var(--surface-muted);
        border-left: 4px solid var(--primary-color);
        padding: var(--space-4);
        color: var(--text-secondary);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
      }
      .back-link {
        display: inline-block;
        margin-top: var(--space-4);
        color: var(--primary-color);
        text-decoration: none;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
      }
    `,
  ],
})
export class CondominiosComponent {}
