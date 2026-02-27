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
    <div class="plano-page">
      <div class="page-header">
        <h1>Plano de Assinatura</h1>
        <p class="page-subtitle">
          Veja os detalhes do seu plano e compare com as opções disponíveis
        </p>
      </div>

      <!-- Plano atual -->
      <div class="current-plan-card">
        <div class="current-plan-info">
          <span class="current-label">Plano Atual</span>
          <h2 class="current-plan-name">
            {{ planoAtual() }}
            <span [class]="'badge badge-' + planoAtual().toLowerCase()">{{ planoAtual() }}</span>
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
                  <td class="feature-value">{{ renderValue(feature.free) }}</td>
                  <td class="feature-value">{{ renderValue(feature.basic) }}</td>
                  <td class="feature-value">{{ renderValue(feature.pro) }}</td>
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
      .plano-page {
        max-width: 860px;
      }

      .page-header {
        margin-bottom: 2rem;
      }

      .page-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }

      .page-subtitle {
        color: var(--text-secondary);
        font-size: 0.95rem;
      }

      .current-plan-card {
        background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 1.5rem;
        color: white;
      }

      .current-label {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.8;
      }

      .current-plan-name {
        font-size: 1.75rem;
        font-weight: 800;
        margin: 0.4rem 0 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .plan-status {
        font-size: 0.9rem;
        opacity: 0.85;

        &.success {
          opacity: 1;
          font-weight: 600;
        }
      }

      .badge {
        display: inline-block;
        padding: 0.2rem 0.65rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .badge-free {
        background: rgba(255, 255, 255, 0.25);
        color: white;
      }
      .badge-basic {
        background: rgba(255, 255, 255, 0.25);
        color: white;
      }
      .badge-pro {
        background: rgba(255, 255, 255, 0.25);
        color: white;
      }

      .card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: var(--shadow-sm);
      }

      .table-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .plans-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;

        th {
          text-align: center;
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-bottom: 2px solid var(--border-subtle);
          background: var(--bg-primary);

          &:first-child {
            text-align: left;
          }
        }

        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
          text-align: center;

          &:last-child td {
            border-bottom: none;
          }
        }
      }

      .feature-label {
        text-align: left !important;
        color: var(--text-primary);
        font-weight: 500;
      }

      .feature-value {
        color: var(--text-secondary);
      }

      .current-badge {
        display: inline-block;
        background: var(--primary-color);
        color: white;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.15rem 0.5rem;
        border-radius: 10px;
        margin-left: 0.4rem;
        text-transform: uppercase;
        vertical-align: middle;
      }

      .upgrade-cta {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-subtle);
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .contact-info {
        display: block;
        margin-top: 0.4rem;
        color: var(--primary-color);
        font-weight: 600;
      }
    `,
  ],
})
export class PlanoComponent {
  private authService = inject(AuthService);

  planoAtual = computed(() => (this.authService.currentUser()?.plano ?? 'FREE').toUpperCase());

  features: PlanFeature[] = [
    { label: 'Condomínios', free: 'Até 3', basic: 'Até 10', pro: 'Ilimitado' },
    { label: 'Funcionários', free: 'Até 20', basic: 'Até 100', pro: 'Ilimitado' },
    { label: 'Contratos ativos', free: 'Até 3', basic: 'Até 10', pro: 'Ilimitado' },
    { label: 'Postos de trabalho', free: 'Até 10', basic: 'Até 50', pro: 'Ilimitado' },
    { label: 'Gestão de alocações', free: true, basic: true, pro: true },
    { label: 'Dashboard financeiro', free: false, basic: true, pro: true },
    { label: 'Wizard de criação rápida', free: false, basic: true, pro: true },
    { label: 'Cálculo automático de salários', free: false, basic: false, pro: true },
    { label: 'Relatórios avançados', free: false, basic: false, pro: true },
    { label: 'Suporte prioritário', free: false, basic: false, pro: true },
  ];

  renderValue(value: string | boolean): string {
    if (value === true) return '✓';
    if (value === false) return '—';
    return value;
  }
}
