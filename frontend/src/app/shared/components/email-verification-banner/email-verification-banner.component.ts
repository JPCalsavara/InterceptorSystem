import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-email-verification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (mostrar()) {
      <div class="verification-banner">
        <div class="banner-content">
          <span class="banner-icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span class="banner-text">
            Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada.
          </span>
        </div>
        <button class="banner-btn" (click)="reenviar()" [disabled]="enviando()">
          @if (enviando()) {
            Enviando...
          } @else {
            Reenviar e-mail
          }
        </button>
        @if (mensagem()) {
          <span class="banner-msg">{{ mensagem() }}</span>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: var(--space-6);
      }

      .verification-banner {
        background: var(--kanban-warning-bg);
        border-bottom: 1px solid var(--kanban-warning-border);
        padding: var(--space-2) var(--space-6);
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-size: var(--text-sm);
        color: var(--text-primary);
        flex-wrap: wrap;
        border-radius: var(--radius-md);

        @media (max-width: 768px) {
          flex-direction: column;
          align-items: stretch;
          gap: var(--space-2);
          padding: var(--space-3);
        }
      }

      .banner-content {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex: 1;
      }

      .banner-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        color: var(--kanban-warning-border);
      }

      .banner-text {
        flex: 1;
      }

      .banner-btn {
        padding: var(--space-1) var(--space-3);
        background: var(--kanban-warning-border);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        white-space: nowrap;

        @media (max-width: 768px) {
          width: 100%;
          padding: var(--space-2) var(--space-3);
        }

        &:hover:not(:disabled) {
          opacity: 0.85;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .banner-msg {
        font-style: italic;
        opacity: 0.75;

        @media (max-width: 768px) {
          width: 100%;
          text-align: center;
        }
      }

      .banner-info {
        display: inline;
        gap: var(--space-2);
      }
      @media (max-width: 768px) {
        .banner-info {
          display: flex;
          gap: var(--space-2);
        }
      }
    `,
  ],
})
export class EmailVerificationBannerComponent {
  private authService = inject(AuthService);

  mostrar = () => this.authService.isAuthenticated() && !this.authService.isEmailVerificado();
  enviando = signal(false);
  mensagem = signal<string | null>(null);

  reenviar(): void {
    this.enviando.set(true);
    this.mensagem.set(null);

    this.authService.reenviarVerificacaoEmail().subscribe({
      next: () => {
        this.enviando.set(false);
        this.mensagem.set('E-mail enviado!');
      },
      error: () => {
        this.enviando.set(false);
        this.mensagem.set('Erro ao enviar. Tente novamente.');
      },
    });
  }
}
