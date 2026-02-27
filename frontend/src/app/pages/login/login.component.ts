import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/logo-preta.png" alt="Interceptor System" class="auth-logo" />
          <h1 class="auth-title">Entrar na sua conta</h1>
          <p class="auth-subtitle">Gerencie suas operações de segurança</p>
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()" #form="ngForm">
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

          <div class="form-group">
            <label for="senha">Senha</label>
            <div class="input-password-wrapper">
              <input
                id="senha"
                [type]="mostrarSenha() ? 'text' : 'password'"
                name="senha"
                [(ngModel)]="senha"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-senha"
                (click)="mostrarSenha.set(!mostrarSenha())"
                [title]="mostrarSenha() ? 'Ocultar senha' : 'Mostrar senha'"
              >
                @if (mostrarSenha()) {
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                    />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                } @else {
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
              </button>
            </div>
          </div>

          @if (erro()) {
            <div class="error-message">{{ erro() }}</div>
          }

          <button type="submit" class="btn-submit" [disabled]="carregando()">
            @if (carregando()) {
              <span class="spinner"></span> Entrando...
            } @else {
              Entrar
            }
          </button>

          <div class="forgot-password">
            <a routerLink="/esqueci-senha">Esqueci minha senha</a>
          </div>
        </form>

        <div class="auth-footer">
          <p>Não tem uma conta? <a routerLink="/cadastro">Criar conta gratuita</a></p>
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

          &::placeholder {
            color: var(--text-tertiary);
            opacity: 0.7;
          }
        }
      }

      .input-password-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        input {
          width: 100%;
          padding-right: 2.75rem;
        }
      }

      .toggle-senha {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        padding: 0;
        line-height: 1;

        &:hover {
          color: var(--text-primary);
        }
      }

      .error-message {
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
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
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.35);
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

      .auth-footer {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.875rem;
        color: var(--text-secondary);

        a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .forgot-password {
        text-align: right;
        font-size: 0.875rem;
        margin-top: -0.5rem;

        a {
          color: var(--primary-color);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    `,
  ],
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = signal<string | null>(null);
  carregando = signal(false);
  mostrarSenha = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (!this.email || !this.senha) return;

    this.erro.set(null);
    this.carregando.set(true);

    this.authService.login({ email: this.email, senha: this.senha }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.carregando.set(false);
        const msg = err?.error?.mensagem;
        this.erro.set(msg ?? 'Erro ao entrar. Verifique seus dados.');
      },
    });
  }
}
