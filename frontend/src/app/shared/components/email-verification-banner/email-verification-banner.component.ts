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
        <span class="banner-icon">⚠️</span>
        <span class="banner-text">
          Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada.
        </span>
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
      .verification-banner {
        background: #fef3c7;
        border-bottom: 1px solid #f59e0b;
        padding: 0.6rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        color: #92400e;
        flex-wrap: wrap;
      }

      .banner-icon {
        flex-shrink: 0;
      }

      .banner-text {
        flex: 1;
      }

      .banner-btn {
        padding: 0.35rem 0.85rem;
        background: #f59e0b;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        white-space: nowrap;

        &:hover:not(:disabled) {
          background: #d97706;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .banner-msg {
        font-style: italic;
        color: #78350f;
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
