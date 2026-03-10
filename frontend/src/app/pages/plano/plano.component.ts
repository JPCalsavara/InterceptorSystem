import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface PlanFeature {
  label: string;
  free: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
}

@Component({
  selector: 'app-plano',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <h1>Plano de Assinatura</h1>
      </div>
      <p class="page-subtitle">
        Veja os detalhes do seu plano e compare com as opções disponíveis
      </p>

      <!-- Plano atual -->
      <div class="current-plan-card">
        <div class="current-plan-info">
          <span class="current-label">Plano Atual</span>
          <h2 class="current-plan-name">
            {{ planoAtual() }}
            <span class="badge badge-current">{{ planoAtual() }}</span>
          </h2>
          @if (planoAtual() === 'PRO') {
            <p class="plan-status success">Plano completo ativo</p>
          } @else {
            <p class="plan-status">Faça upgrade para acessar todos os recursos</p>
          }
        </div>
      </div>

      <!-- Comparativo de planos -->
      <div class="card">
        <h2 class="table-title">Comparativo de Planos</h2>
        <div class="table-wrapper">
          <table class="plans-table">
            <thead>
              <tr>
                <th>Recurso</th>
                <th>
                  FREE
                  @if (planoAtual() === 'FREE') {
                    <span class="current-badge">atual</span>
                  }
                </th>
                <th>
                  BASIC
                  @if (planoAtual() === 'BASIC') {
                    <span class="current-badge">atual</span>
                  }
                </th>
                <th>
                  PRO
                  @if (planoAtual() === 'PRO') {
                    <span class="current-badge">atual</span>
                  }
                </th>
              </tr>
            </thead>
            <tbody>
              @for (feature of features; track feature.label) {
                <tr>
                  <td class="feature-label">{{ feature.label }}</td>
                  <td>
                    @if (feature.free === true) {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-check">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    } @else if (feature.free === false) {
                      —
                    } @else {
                      {{ feature.free }}
                    }
                  </td>
                  <td>
                    @if (feature.basic === true) {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-check">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    } @else if (feature.basic === false) {
                      —
                    } @else {
                      {{ feature.basic }}
                    }
                  </td>
                  <td>
                    @if (feature.pro === true) {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-check">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    } @else if (feature.pro === false) {
                      —
                    } @else {
                      {{ feature.pro }}
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- CTA -->
        @if (planoAtual() !== 'PRO') {
          <div class="upgrade-cta">
            <p>Para fazer upgrade do seu plano, entre em contato com nossa equipe.</p>
            <span class="contact-info">contato&#64;interceptorsystem.com.br</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 860px;
        margin: var(--space-4) auto;
        padding: 0 var(--space-4);
        display: flex;
        flex-direction: column;
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-2);
      }

      .page-header svg {
        width: 1.5em;
        height: 1.5em;
        color: var(--primary-color);
        font-size: var(--text-3xl);
      }

      .page-header h1 {
        font-size: var(--text-3xl);
        font-weight: var(--fw-extrabold);
        color: var(--text-primary);
        margin: 0;
      }

      .page-subtitle {
        color: var(--text-secondary);
        font-size: var(--text-base);
        margin-top: 0;
        margin-bottom: var(--space-6);
        font-weight: var(--fw-regular);
      }

      .card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .current-plan-card {
        background: var(--primary-color);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        color: white;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        box-shadow: var(--shadow-md);
        margin-bottom: var(--space-6);
      }

      .current-label {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.9;
        display: block;
      }

      .current-plan-name {
        font-size: var(--text-4xl);
        font-weight: var(--fw-extrabold);
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .plan-status {
        font-size: var(--text-base);
        opacity: 0.9;
        margin: 0;
      }

      .plan-status.success {
        opacity: 1;
        font-weight: var(--fw-semibold);
      }

      .badge {
        display: inline-block;
        padding: 0 var(--space-2);
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        text-transform: uppercase;
        line-height: normal;
      }

      .badge-current {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: var(--text-sm);
        padding: var(--space-1) var(--space-3);
      }

      .table-title {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin: 0;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .plans-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);
      }

      .plans-table th {
        text-align: center;
        font-weight: var(--fw-bold);
        font-size: var(--text-sm);
        color: var(--text-primary);
        padding: var(--space-3) var(--space-4);
        border-bottom: 2px solid var(--border-subtle);
        background: var(--bg-primary);
        white-space: nowrap;
      }

      .plans-table th:first-child {
        text-align: left;
      }

      .plans-table td {
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--border-subtle);
        vertical-align: middle;
        text-align: center;
        color: var(--text-secondary);
        font-size: var(--text-sm);
      }

      .plans-table tr:last-child td {
        border-bottom: none;
      }

      .feature-label {
        text-align: left !important;
        color: var(--text-primary) !important;
        font-weight: var(--fw-medium);
      }

      .icon-check {
        width: 1.5em;
        height: 1.5em;
        color: var(--primary-color);
        display: inline-block;
        vertical-align: middle;
      }

      .current-badge {
        display: inline-block;
        background: var(--primary-color);
        color: white;
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        padding: 2px var(--space-2);
        border-radius: var(--radius-sm);
        margin-left: var(--space-2);
        text-transform: uppercase;
        vertical-align: middle;
      }

      .upgrade-cta {
        margin-top: var(--space-6);
        padding-top: var(--space-6);
        border-top: 1px solid var(--border-subtle);
        text-align: center;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }

      .contact-info {
        display: inline-block;
        margin-top: var(--space-2);
        color: var(--primary-color);
        font-weight: var(--fw-semibold);
      }

      /* Responsive rules */
      @media (max-width: 768px) {
        .page-container {
          padding: 0 var(--space-2);
        }
        .page-header h1 {
          font-size: var(--text-2xl);
        }
        .page-header svg {
          font-size: var(--text-2xl);
        }
        .current-plan-card {
          padding: var(--space-4);
        }
        .current-plan-name {
          font-size: var(--text-3xl);
        }
        .card {
          padding: var(--space-4);
        }
        .plans-table th, .plans-table td {
          padding: var(--space-2);
        }
      }
    `,
  ],
})
export class PlanoComponent {
  private authService = inject(AuthService);

  planoAtual = computed(() => (this.authService.currentUser()?.plano ?? 'FREE').toUpperCase());

  features: PlanFeature[] = [
    { label: 'Clientes', free: 'Até 3', basic: 'Até 10', pro: 'Ilimitado' },
    { label: 'Funcionários', free: 'Até 20', basic: 'Até 100', pro: 'Ilimitado' },
    { label: 'Contratos ativos', free: 'Até 3', basic: 'Até 10', pro: 'Ilimitado' },
    { label: 'Postos de trabalho', free: 'Até 10', basic: 'Até 50', pro: 'Ilimitado' },
    { label: 'Gestão de diárias', free: true, basic: true, pro: true },
    { label: 'Dashboard financeiro', free: false, basic: true, pro: true },
    { label: 'Wizard de criação rápida', free: false, basic: true, pro: true },
    { label: 'Cálculo automático de salários', free: false, basic: false, pro: true },
    { label: 'Relatórios avançados', free: false, basic: false, pro: true },
    { label: 'Suporte prioritário', free: false, basic: false, pro: true },
  ];
}

