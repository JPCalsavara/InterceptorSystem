import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/logo-preta.png" alt="Interceptor System" class="auth-logo" />
          <h1 class="auth-title">Esqueci minha senha</h1>
          <p class="auth-subtitle">Informe seu e-mail para receber as instruções de recuperação</p>
        </div>

        @if (!enviado()) {
          <form class="auth-form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">E-mail</label>
              <input
                id="email"
                type="email"
                name="email"
                [(ngModel)]="email"
                placeholder="sua@empresa.com"
                required
                autocomplete="email"
              />
            </div>

            <button type="submit" class="btn-submit" [disabled]="carregando()">
              @if (carregando()) {
                <span class="spinner"></span> Enviando...
              } @else {
                Enviar instruções
              }
            </button>
          </form>
        } @else {
          <div class="success-box">
            <p>Se o e-mail estiver cadastrado, você receberá as instruções em breve.</p>
          </div>
        }

        <div class="auth-footer">
          <a routerLink="/login">Voltar para o login</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
        padding: 1rem;
      }

      .auth-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: 16px;
        padding: 2.5rem;
        width: 100%;
        max-width: 420px;
        box-shadow: var(--shadow-lg);
      }

      .auth-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .auth-logo {
        height: 60px;
        margin-bottom: 1rem;
      }

      .auth-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .auth-subtitle {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        input {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: border-color 0.2s;

          &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
          }
        }
      }

      .btn-submit {
        width: 100%;
        padding: 0.875rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .success-box {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #6ee7b7;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        font-size: 0.95rem;
      }

      .auth-footer {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.875rem;

        a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    `,
  ],
})
export class EsqueciSenhaComponent {
  email = '';
  enviado = signal(false);
  carregando = signal(false);

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (!this.email) return;
    this.carregando.set(true);

    this.authService.solicitarResetSenha(this.email).subscribe({
      next: () => {
        this.carregando.set(false);
        this.enviado.set(true);
      },
      error: () => {
        this.carregando.set(false);
        this.enviado.set(true); // Mostra mensagem genérica mesmo em caso de erro
      },
    });
  }
}
