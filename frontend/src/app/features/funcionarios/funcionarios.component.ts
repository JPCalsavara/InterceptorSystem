import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>👥 Funcionários</h1>
        <button class="btn-primary" routerLink="/funcionarios/novo">+ Novo Funcionário</button>
      </div>
      <p class="coming-soon">Em desenvolvimento - Gestão de vigilantes e porteiros</p>
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
        background: #4caf50;
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
        color: #4caf50;
        text-decoration: none;
      }
    `,
  ],
})
export class FuncionariosComponent {}
