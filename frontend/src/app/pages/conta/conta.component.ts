import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ContaAlterarSenhaComponent } from './components/conta-alterar-senha/conta-alterar-senha.component';

@Component({
  selector: 'app-conta',
  standalone: true,
  imports: [CommonModule, FormsModule, ContaAlterarSenhaComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
        <h1>Minha Conta</h1>
      </div>

      <!-- Status de verificação de e-mail -->
      <section class="card">
        <div class="card-header">
          <h2>Status do E-mail</h2>
        </div>
        <div class="card-body">
          @if (authService.isEmailVerificado()) {
            <div class="badge badge-success">E-mail verificado</div>
          } @else {
            <div class="badge badge-warning">E-mail não verificado</div>
            <button
              class="btn-secondary"
              data-cy="conta-reenviar-verificacao"
              (click)="reenviarVerificacao()"
              [disabled]="enviandoVerificacao()"
            >
              @if (enviandoVerificacao()) {
                Enviando...
              } @else {
                Reenviar e-mail de verificação
              }
            </button>
            @if (msgVerificacao()) {
              <p class="feedback-msg">{{ msgVerificacao() }}</p>
            }
          }
        </div>
      </section>

      <!-- Alterar senha Componentizado -->
      <app-conta-alterar-senha></app-conta-alterar-senha>

      <!-- Alterar e-mail -->
      <section class="card">
        <div class="card-header">
          <h2>Alterar E-mail</h2>
        </div>
        <div class="card-body">
          <p class="section-desc">
            E-mail atual: <strong>{{ authService.currentUser()?.email }}</strong>
          </p>
          <form class="form" (ngSubmit)="solicitarAlteracaoEmail()">
            <div class="form-group">
              <label>Novo e-mail</label>
              <input
                type="email"
                [(ngModel)]="novoEmail"
                name="novoEmail"
                data-cy="conta-novo-email"
                placeholder="novo@empresa.com"
              />
            </div>
            @if (erroEmail()) {
              <div class="error-msg">{{ erroEmail() }}</div>
            }
            @if (sucessoEmail()) {
              <div class="success-msg">
                Um e-mail de confirmação foi enviado para {{ novoEmail }}. Acesse o link para
                confirmar a troca.
              </div>
            }
            <button type="submit" class="btn-primary" data-cy="conta-email-submit" [disabled]="salvandoEmail()">
              @if (salvandoEmail()) {
                Enviando...
              } @else {
                Solicitar alteração de e-mail
              }
            </button>
          </form>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 700px;
        margin: var(--space-4) auto;
        padding: 0 var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
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
        align-items: flex-start;
      }

      .section-desc {
        color: var(--text-secondary);
        font-size: var(--text-base);
        margin: 0;
      }

      .badge {
        display: inline-block;
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
      }

      .badge-success {
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
      }

      .badge-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #d97706;
      }

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

      .btn-primary {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
        font-weight: var(--fw-semibold);
        cursor: pointer;
        align-self: flex-start;
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
        align-self: flex-start;
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

      .error-msg {
        background: rgba(220, 38, 38, 0.1);
        color: var(--kanban-error-border, #dc2626);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
      }

      .success-msg {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
      }

      .feedback-msg {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin: 0;
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
        .card-header h2 {
          font-size: var(--text-xl);
        }
        .btn-primary, .btn-secondary {
          width: 100%;
        }
      }
    `,
  ],
})
export class ContaComponent {
  authService = inject(AuthService);

  // Verificação de e-mail
  enviandoVerificacao = signal(false);
  msgVerificacao = signal<string | null>(null);

  // Alterar e-mail
  novoEmail = '';
  salvandoEmail = signal(false);
  erroEmail = signal<string | null>(null);
  _sucessoEmail = signal(false);

  sucessoEmail(): boolean {
    return this._sucessoEmail();
  }

  reenviarVerificacao(): void {
    this.enviandoVerificacao.set(true);
    this.msgVerificacao.set(null);

    this.authService.reenviarVerificacaoEmail().subscribe({
      next: () => {
        this.enviandoVerificacao.set(false);
        this.msgVerificacao.set('E-mail enviado! Verifique sua caixa de entrada.');
      },
      error: () => {
        this.enviandoVerificacao.set(false);
        this.msgVerificacao.set('Erro ao enviar. Tente novamente.');
      },
    });
  }

  // alterarSenha() foi movido para o subcomponente

  solicitarAlteracaoEmail(): void {
    if (!this.novoEmail) return;

    this.erroEmail.set(null);
    this._sucessoEmail.set(false);
    this.salvandoEmail.set(true);

    this.authService.solicitarAlteracaoEmail(this.novoEmail).subscribe({
      next: () => {
        this.salvandoEmail.set(false);
        this._sucessoEmail.set(true);
      },
      error: (err) => {
        this.salvandoEmail.set(false);
        this.erroEmail.set(err?.error?.mensagem ?? 'Erro ao solicitar alteração de e-mail.');
      },
    });
  }
}
