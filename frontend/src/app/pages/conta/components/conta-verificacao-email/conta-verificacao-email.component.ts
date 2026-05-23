import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-conta-verificacao-email',
  standalone: true,
  imports: [CommonModule],
  template: `
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
  `,
  styles: [
    `
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
      .feedback-msg {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin: 0;
      }
      @media (max-width: 768px) {
        .card { padding: var(--space-4); }
        .card-header h2 { font-size: var(--text-xl); }
        .btn-secondary { width: 100%; }
      }
    `,
  ],
})
export class ContaVerificacaoEmailComponent {
  authService = inject(AuthService);

  enviandoVerificacao = signal(false);
  msgVerificacao = signal<string | null>(null);

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
}
