import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="flex-shrink:0"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Contratos
        </h1>
        <button class="btn-primary" routerLink="/contratos/novo">+ Novo Contrato</button>
      </div>

      <div class="info-box">
        <h3>Gestão de Contratos</h3>
        <p>Em desenvolvimento - Controle completo do ciclo de vida dos contratos</p>
        <div class="status-grid">
          <div class="status-card" style="border-color: #4CAF50;">
            <span class="status-badge" style="background: #4CAF50;">ATIVO</span>
            <p>Contratos vigentes</p>
          </div>
          <div class="status-card" style="border-color: #FF9800;">
            <span class="status-badge" style="background: #FF9800;">PENDENTE</span>
            <p>Aguardando assinatura</p>
          </div>
          <div class="status-card" style="border-color: #2196F3;">
            <span class="status-badge" style="background: #2196F3;">RENOVACAO</span>
            <p>Próximos a vencer</p>
          </div>
          <div class="status-card" style="border-color: #F44336;">
            <span class="status-badge" style="background: #F44336;">ENCERRADO</span>
            <p>Finalizados</p>
          </div>
        </div>
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
      }
      h1 {
        font-size: 2rem;
        color: #333;
        margin: 0;
      }
      .btn-primary {
        background: #f44336;
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
      .info-box {
        background: white;
        border-left: 4px solid #f44336;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .info-box h3 {
        margin-top: 0;
        color: #f44336;
      }
      .status-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      }
      .status-card {
        border: 2px solid;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
      }
      .status-badge {
        display: inline-block;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      .status-card p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }
      .back-link {
        display: inline-block;
        margin-top: 1rem;
        color: #f44336;
        text-decoration: none;
      }
    `,
  ],
})
export class ContratosComponent {}
