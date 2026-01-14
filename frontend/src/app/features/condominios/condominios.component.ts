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
        <h1>🏢 Condomínios</h1>
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
        color: #333;
        margin: 0;
      }
      .btn-primary {
        background: #2196f3;
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
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 1rem;
        color: #856404;
        border-radius: 4px;
      }
      .back-link {
        display: inline-block;
        margin-top: 1rem;
        color: #2196f3;
        text-decoration: none;
      }
    `,
  ],
})
export class CondominiosComponent {}
