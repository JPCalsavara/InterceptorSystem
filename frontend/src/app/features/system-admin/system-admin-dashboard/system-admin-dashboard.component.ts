import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemAdminService, SystemDashboardDto } from '../../../services/system-admin.service';

@Component({
  selector: 'app-system-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-admin-container">
      <header class="page-header">
        <h1>Painel do Super Administrador</h1>
        <p>Visão global de todos os tenants (empresas) do sistema.</p>
      </header>

      @if (loading()) {
        <div class="loading-state">Carregando métricas globais...</div>
      }

      @if (!loading() && erro()) {
        <div class="error-state">
          <p>{{ erro() }}</p>
        </div>
      }

      @if (!loading() && !erro() && metrics()) {
        <div class="metrics-grid">
          
          <div class="metric-card">
            <div class="icon-wrapper" style="background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
            </div>
            <div class="metric-info">
              <h3>Tenants (Contas)</h3>
              <p class="value">{{ metrics()!.totalTenants }}</p>
              <p class="subtitle">Ativos: {{ metrics()!.tenantsAtivos }} | Inativos: {{ metrics()!.tenantsInativos }}</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="icon-wrapper" style="background: color-mix(in srgb, var(--success-color) 10%, transparent); color: var(--success-color);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div class="metric-info">
              <h3>Faturamento Global</h3>
              <p class="value">{{ metrics()!.faturamentoTotal | currency:'BRL' }}</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="icon-wrapper" style="background: color-mix(in srgb, var(--warning-color) 10%, transparent); color: var(--warning-color);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            <div class="metric-info">
              <h3>Total Funcionários</h3>
              <p class="value">{{ metrics()!.totalFuncionarios }}</p>
              <p class="subtitle">Média: {{ metrics()!.mediaFuncionariosPorTenant | number:'1.0-1' }} / tenant</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="icon-wrapper" style="background: color-mix(in srgb, #8b5cf6 10%, transparent); color: #8b5cf6;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
            </div>
            <div class="metric-info">
              <h3>Total Clientes</h3>
              <p class="value">{{ metrics()!.totalClientes }}</p>
              <p class="subtitle">Média: {{ metrics()!.mediaClientesPorTenant | number:'1.0-1' }} / tenant</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="icon-wrapper" style="background: color-mix(in srgb, #f97316 10%, transparent); color: #f97316;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            </div>
            <div class="metric-info">
              <h3>Total Postos</h3>
              <p class="value">{{ metrics()!.totalPostos }}</p>
              <p class="subtitle">Média: {{ metrics()!.mediaPostosPorTenant | number:'1.0-1' }} / tenant</p>
            </div>
          </div>

        </div>

        <div class="dashboard-sections">
          <div class="section-card">
            <div class="section-header">
              <h2>🏆 Top 5 Tenants (Maior Faturamento)</h2>
              <p>As contas que mais geram valor na plataforma.</p>
            </div>
            
            <div class="table-responsive">
              <table class="tenant-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Email</th>
                    <th>Plano</th>
                    <th class="text-right">Faturamento</th>
                    <th class="text-right">Funcionários</th>
                  </tr>
                </thead>
                <tbody>
                  @for(t of metrics()!.topTenantsPorFaturamento; track t.id) {
                    <tr>
                      <td class="font-medium">{{ t.nomeEmpresa }}</td>
                      <td class="text-secondary">{{ t.email }}</td>
                      <td><span class="badge">{{ t.plano }}</span></td>
                      <td class="text-right font-bold text-success">{{ t.faturamentoEstimado | currency:'BRL' }}</td>
                      <td class="text-right">{{ t.totalFuncionarios }}</td>
                    </tr>
                  }
                  @empty {
                    <tr><td colspan="5" class="text-center text-secondary py-4">Nenhum dado encontrado</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="section-card">
            <div class="section-header">
              <h2>⏳ Tenants Mais Antigos</h2>
              <p>Os primeiros clientes a acreditarem no Interceptor.</p>
            </div>
            
            <div class="table-responsive">
              <table class="tenant-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Data de Cadastro</th>
                    <th class="text-right">Faturamento</th>
                    <th class="text-right">Clientes</th>
                    <th class="text-right">Funcionários</th>
                  </tr>
                </thead>
                <tbody>
                  @for(t of metrics()!.tenantsMaisAntigos; track t.id) {
                    <tr>
                      <td class="font-medium">{{ t.nomeEmpresa }}</td>
                      <td class="text-secondary">{{ t.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="text-right text-success">{{ t.faturamentoEstimado | currency:'BRL' }}</td>
                      <td class="text-right">{{ t.totalClientes }}</td>
                      <td class="text-right">{{ t.totalFuncionarios }}</td>
                    </tr>
                  }
                  @empty {
                    <tr><td colspan="5" class="text-center text-secondary py-4">Nenhum dado encontrado</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .system-admin-container {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: var(--space-6);
    }

    .page-header h1 {
      font-size: var(--text-2xl);
      font-weight: var(--fw-bold);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }

    .page-header p {
      color: var(--text-secondary);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-4);
    }

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-wrapper svg {
      width: 24px;
      height: 24px;
    }

    .metric-info h3 {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: var(--fw-medium);
      margin-bottom: var(--space-1);
    }

    .metric-info .value {
      font-size: var(--text-2xl);
      font-weight: var(--fw-bold);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }

    .metric-info .subtitle {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
    }

    .loading-state, .error-state {
      padding: var(--space-6);
      text-align: center;
      color: var(--text-secondary);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
    }

    .error-state {
      color: var(--danger-color);
      background: color-mix(in srgb, var(--danger-color) 5%, transparent);
      border-color: color-mix(in srgb, var(--danger-color) 20%, transparent);
    }

    .dashboard-sections {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      margin-top: var(--space-8);
    }

    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .section-header {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--border-subtle);
      background: color-mix(in srgb, var(--surface-muted) 30%, transparent);
    }

    .section-header h2 {
      font-size: var(--text-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }

    .section-header p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .tenant-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .tenant-table th, .tenant-table td {
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--border-subtle);
      font-size: var(--text-sm);
      white-space: nowrap;
    }

    .tenant-table th {
      background: var(--bg-primary);
      color: var(--text-secondary);
      font-weight: var(--fw-medium);
      text-transform: uppercase;
      font-size: var(--text-xs);
      letter-spacing: 0.05em;
    }

    .tenant-table tbody tr:hover {
      background: color-mix(in srgb, var(--primary-color) 3%, transparent);
    }

    .tenant-table tbody tr:last-child td {
      border-bottom: none;
    }

    .font-medium { font-weight: var(--fw-medium); color: var(--text-primary); }
    .font-bold { font-weight: var(--fw-bold); }
    .text-secondary { color: var(--text-secondary); }
    .text-success { color: var(--success-color); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-4 { padding-top: var(--space-4) !important; padding-bottom: var(--space-4) !important; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: var(--text-xs);
      font-weight: var(--fw-medium);
      background: color-mix(in srgb, var(--primary-color) 15%, transparent);
      color: var(--primary-color);
    }
  `]
})
export class SystemAdminDashboardComponent implements OnInit {
  private adminService = inject(SystemAdminService);

  metrics = signal<SystemDashboardDto | null>(null);
  loading = signal(true);
  erro = signal<string | null>(null);

  ngOnInit() {
    this.adminService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar métricas globais', err);
        this.erro.set('Não foi possível carregar as métricas do sistema.');
        this.loading.set(false);
      }
    });
  }
}
