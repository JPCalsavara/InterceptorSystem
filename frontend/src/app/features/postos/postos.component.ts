import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-postos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="flex-shrink:0;vertical-align:middle"
          >
            <path
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Postos de Trabalho
        </h1>
        <button class="btn-primary" routerLink="/postos/novo">+ Novo Posto</button>
      </div>
      <p class="coming-soon">Em desenvolvimento - Gestão de postos e turnos de 12h</p>
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
      }
      h1 {
        font-size: 2rem;
        color: var(--text-primary);
        margin: 0;
      }
      .btn-primary {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .coming-soon {
        background: var(--warning-bg, #fff3cd);
        border-left: 4px solid var(--warning-border, #ffc107);
        padding: 1rem;
        color: var(--warning-text, #856404);
        border-radius: 4px;
      }
      .back-link {
        display: inline-block;
        margin-top: 1rem;
        color: var(--primary-color);
        text-decoration: none;
      }
    `,
  ],
})
export class PostosComponent {}
