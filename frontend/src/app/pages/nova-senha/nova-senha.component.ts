import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nova-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/logo-preta.png" alt="Interceptor System" class="auth-logo" />
          <h1 class="auth-title">Nova senha</h1>
          <p class="auth-subtitle">Escolha uma nova senha para sua conta</p>
        </div>

        @if (!concluido()) {
          <form class="auth-form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                type="password"
                name="novaSenha"
                [(ngModel)]="novaSenha"
                placeholder="••••••••"
                required
                autocomplete="new-password"
              />
            </div>

            <div class="form-group">
              <label for="confirmarSenha">Confirmar nova senha</label>
              <input
                id="confirmarSenha"
                type="password"
                name="confirmarSenha"
                [(ngModel)]="confirmarSenha"
                placeholder="••••••••"
                required
                autocomplete="new-password"
              />
            </div>

            @if (erro()) {
              <div class="error-message">{{ erro() }}</div>
            }

            <button type="submit" class="btn-submit" [disabled]="carregando()">
              @if (carregando()) {
                <span class="spinner"></span> Salvando...
              } @else {
                Redefinir senha
              }
            </button>
          </form>
        } @else {
          <div class="success-box">
            <p>Senha redefinida com sucesso! Faça login com sua nova senha.</p>
            <a routerLink="/login" class="btn-link">Ir para o login</a>
          </div>
        }
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

          &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
          }
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
        padding: 1.5rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      .btn-link {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class NovaSenhaComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  novaSenha = '';
  confirmarSenha = '';
  token = '';
  carregando = signal(false);
  erro = signal<string | null>(null);
  concluido = signal(false);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.erro.set('Token não encontrado. Solicite um novo link.');
    }
  }

  onSubmit(): void {
    if (!this.novaSenha || !this.confirmarSenha) return;
    if (this.novaSenha !== this.confirmarSenha) {
      this.erro.set('As senhas não coincidem.');
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    this.authService.confirmarResetSenha(this.token, this.novaSenha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.concluido.set(true);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Erro ao redefinir senha. Tente novamente.');
      },
    });
  }
}
