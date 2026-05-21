import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContaService, ContaPerfilOutput } from '../../services/conta.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
        <h1>Perfil da Empresa</h1>
      </div>
      <p class="page-subtitle">Gerencie as informações da sua conta</p>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (perfil()) {
        <!-- Banner de aviso quando a API falhou (dados vindos do token) -->
        @if (erroCarregamento()) {
          <div class="alert-warning">
            <strong>Dados parciais.</strong>
            O servidor retornou um erro ao carregar o perfil completo. Você pode editar as
            informações disponíveis abaixo, mas campos como CNPJ e data de cadastro podem não estar
            disponíveis.
          </div>
        }

        @if (erro()) {
          <div class="error-message" style="margin-bottom: 1rem">{{ erro() }}</div>
        }
        @if (sucesso()) {
          <div class="success-message" style="margin-bottom: 1rem">{{ sucesso() }}</div>
        }

        <!-- Visualização -->
        @if (!modoEdicao()) {
          <div class="card">
            <div class="card-header">
              <h2>Informações da Conta</h2>
              <button class="btn-secondary" data-cy="perfil-editar-btn" (click)="iniciarEdicao()">Editar</button>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nome da Empresa</span>
                  <span class="info-value">{{ perfil()!.nomeEmpresa }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">E-mail</span>
                  <span class="info-value">{{ perfil()!.email }}</span>
                </div>
                @if (perfil()!.cnpj) {
                  <div class="info-item">
                    <span class="info-label">CNPJ</span>
                    <span class="info-value">{{ perfil()!.cnpj }}</span>
                  </div>
                }
                <div class="info-item">
                  <span class="info-label">Plano</span>
                  <span class="info-value">
                    <span [class]="'badge badge-' + getBadge(perfil()!.plano)">
                      {{ perfil()!.plano }}
                    </span>
                  </span>
                </div>
                @if (!erroCarregamento()) {
                  <div class="info-item">
                    <span class="info-label">Membro desde</span>
                    <span class="info-value">{{ perfil()!.createdAt | date: 'dd/MM/yyyy' }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else {
          <!-- Modo edição -->
          <div class="card">
            <div class="card-header">
              <h2>Editar Informações</h2>
            </div>
            <div class="card-body">

              <form class="form" (ngSubmit)="salvar()">
                <div class="form-group">
                  <label for="nomeEmpresa">Nome da Empresa</label>
                  <input
                    id="nomeEmpresa"
                    type="text"
                    [(ngModel)]="editNomeEmpresa"
                    name="nomeEmpresa"
                    data-cy="perfil-nome-input"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div class="form-group">
                  <label for="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="editEmail"
                    name="email"
                    placeholder="E-mail da conta"
                  />
                </div>

                <div class="section-divider">
                  <span>Alterar Senha (opcional)</span>
                </div>

                <div class="form-group">
                  <label for="senhaAtual">Senha Atual</label>
                  <div class="input-password-wrapper">
                    <input
                      id="senhaAtual"
                      [type]="mostrarSenhaAtual() ? 'text' : 'password'"
                      [(ngModel)]="senhaAtual"
                      name="senhaAtual"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      class="toggle-senha"
                      (click)="mostrarSenhaAtual.set(!mostrarSenhaAtual())"
                      [title]="mostrarSenhaAtual() ? 'Ocultar senha' : 'Mostrar senha'"
                    >
                      @if (mostrarSenhaAtual()) {
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      } @else {
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label for="novaSenha">Nova Senha</label>
                  <div class="input-password-wrapper">
                    <input
                      id="novaSenha"
                      [type]="mostrarNovaSenha() ? 'text' : 'password'"
                      [(ngModel)]="novaSenha"
                      name="novaSenha"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      class="toggle-senha"
                      (click)="mostrarNovaSenha.set(!mostrarNovaSenha())"
                      [title]="mostrarNovaSenha() ? 'Ocultar senha' : 'Mostrar senha'"
                    >
                      @if (mostrarNovaSenha()) {
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      } @else {
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label for="confirmarSenha">Confirmar Nova Senha</label>
                  <div class="input-password-wrapper">
                    <input
                      id="confirmarSenha"
                      [type]="mostrarConfirmarSenha() ? 'text' : 'password'"
                      [(ngModel)]="confirmarSenha"
                      name="confirmarSenha"
                      placeholder="Repita a nova senha"
                    />
                    <button
                      type="button"
                      class="toggle-senha"
                      (click)="mostrarConfirmarSenha.set(!mostrarConfirmarSenha())"
                      [title]="mostrarConfirmarSenha() ? 'Ocultar senha' : 'Mostrar senha'"
                    >
                      @if (mostrarConfirmarSenha()) {
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      } @else {
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" (click)="cancelarEdicao()">
                    Cancelar
                  </button>
                  <button type="submit" class="btn-primary" data-cy="perfil-salvar-btn" [disabled]="salvando()">
                    @if (salvando()) {
                      Salvando...
                    } @else {
                      Salvar Alterações
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      } @else {
        <div class="empty-state">Nenhum dado disponível. Tente fazer login novamente.</div>
      }
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

      .loading,
      .empty-state {
        color: var(--text-secondary);
        padding: var(--space-6) 0;
        font-size: var(--text-base);
      }

      .alert-warning {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        background: rgba(245, 158, 11, 0.1);
        color: #92400e;
        border: 1px solid rgba(245, 158, 11, 0.35);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
        margin-bottom: var(--space-4);
        line-height: 1.5;
      }

      .alert-warning strong {
        font-weight: var(--fw-bold);
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

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-header h2 {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin: 0;
      }

      .card-body {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .info-grid {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        padding-bottom: var(--space-4);
        border-bottom: 1px solid var(--border-subtle);
      }

      .info-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .info-label {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .info-value {
        font-size: var(--text-lg);
        color: var(--text-primary);
        font-weight: var(--fw-medium);
      }

      .badge {
        display: inline-block;
        padding: 0 var(--space-2);
        border-radius: var(--radius-full);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
      }

      .badge-success { background: rgba(16, 185, 129, 0.15); color: #059669; }
      .badge-info { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
      .badge-neutral { background: rgba(156, 163, 175, 0.15); color: #4b5563; }

      .form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        width: 100%;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .form-group label {
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
      }

      .form-group input {
        padding: var(--space-3) var(--space-4);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
        background: var(--input-bg);
        color: var(--text-primary);
        font-size: var(--text-base);
        font-family: inherit;
        transition: all 0.2s ease;
      }

      .form-group input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
      }

      .input-password-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-password-wrapper input {
        width: 100%;
        padding-right: 3rem;
      }

      .toggle-senha {
        position: absolute;
        right: var(--space-3);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        padding: 0;
        line-height: 1;
        transition: color 0.2s ease;
      }

      .toggle-senha:hover {
        color: var(--text-primary);
      }

      .section-divider {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        color: var(--text-secondary);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        margin: var(--space-2) 0;
      }

      .section-divider::before,
      .section-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-subtle);
      }

      .form-actions {
        display: flex;
        gap: var(--space-4);
        justify-content: flex-end;
        margin-top: var(--space-2);
      }

      .btn-primary {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: var(--space-2) var(--space-6);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
        font-weight: var(--fw-semibold);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .btn-secondary {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-strong);
        padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-secondary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .error-message {
        background: rgba(220, 38, 38, 0.1);
        color: var(--kanban-error-border, #dc2626);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
        margin-bottom: var(--space-2);
      }

      .success-message {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
        margin-bottom: var(--space-2);
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
        .card {
          padding: var(--space-4);
        }
        .card-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-4);
        }
        .card-header h2 {
          font-size: var(--text-xl);
        }
        .form-actions {
          flex-direction: column-reverse;
        }
        .btn-primary, .btn-secondary {
          width: 100%;
          text-align: center;
        }
      }
    `,
  ],
})
export class PerfilComponent implements OnInit {
  private contaService = inject(ContaService);
  private authService = inject(AuthService);

  perfil = signal<ContaPerfilOutput | null>(null);
  loading = signal(true);
  erroCarregamento = signal<string | null>(null);
  modoEdicao = signal(false);
  salvando = signal(false);
  erro = signal<string | null>(null);
  sucesso = signal<string | null>(null);

  editNomeEmpresa = '';
  editEmail = '';
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  mostrarSenhaAtual = signal(false);
  mostrarNovaSenha = signal(false);
  mostrarConfirmarSenha = signal(false);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.perfil.set({
        empresaId: user.empresaId,
        nomeEmpresa: user.nomeEmpresa,
        email: user.email,
        cnpj: null,
        plano: user.plano,
        createdAt: new Date().toISOString(),
      });
    }

    this.contaService.getPerfil().subscribe({
      next: (data) => {
        this.perfil.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.mensagem ?? `Erro ${err?.status ?? ''} ao buscar dados do servidor.`;
        this.erroCarregamento.set(msg);
        this.loading.set(false);
      },
    });
  }

  getBadge(plano: string): string {
    const p = (plano || '').toUpperCase();
    if (p === 'PRO') return 'success';
    if (p === 'BASIC') return 'info';
    return 'neutral';
  }

  iniciarEdicao(): void {
    const p = this.perfil();
    if (!p) return;
    this.editNomeEmpresa = p.nomeEmpresa;
    this.editEmail = p.email;
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.erro.set(null);
    this.sucesso.set(null);
    this.modoEdicao.set(true);
  }

  cancelarEdicao(): void {
    this.modoEdicao.set(false);
    this.erro.set(null);
  }

  salvar(): void {
    this.erro.set(null);

    if (this.novaSenha && this.novaSenha !== this.confirmarSenha) {
      this.erro.set('A nova senha e a confirmação não coincidem.');
      return;
    }

    this.salvando.set(true);

    const input: Record<string, string> = {};
    if (this.editNomeEmpresa !== this.perfil()?.nomeEmpresa) {
      input['nomeEmpresa'] = this.editNomeEmpresa;
    }
    if (this.editEmail !== this.perfil()?.email) {
      input['email'] = this.editEmail;
    }
    if (this.novaSenha) {
      input['senhaAtual'] = this.senhaAtual;
      input['novaSenha'] = this.novaSenha;
    }

    this.contaService.atualizarPerfil(input).subscribe({
      next: (updated) => {
        this.perfil.set(updated);
        this.authService.atualizarUser({
          nomeEmpresa: updated.nomeEmpresa,
          email: updated.email,
          plano: updated.plano,
        });
        this.salvando.set(false);
        this.modoEdicao.set(false);
        this.sucesso.set('Informações atualizadas com sucesso!');
        setTimeout(() => this.sucesso.set(null), 4000);
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = err?.error?.mensagem;
        this.erro.set(msg ?? 'Erro ao salvar. Tente novamente.');
      },
    });
  }
}
