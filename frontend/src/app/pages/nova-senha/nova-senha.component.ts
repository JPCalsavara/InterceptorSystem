import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
          <img [src]="logoSrc()" alt="Interceptor System" class="auth-logo" />
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

            <button type="submit" class="btn-primary btn-lg submit-btn" [disabled]="carregando()">
              @if (carregando()) {
                <span class="spinner"></span> Salvando...
              } @else {
                Redefinir senha
              }
            </button>
          </form>
        } @else {
          <div class="success-box">
            <svg class="success-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p>Senha redefinida com sucesso! Faça login com sua nova senha.</p>
            <a routerLink="/login" class="btn-primary btn-lg submit-btn link-btn">Ir para o login</a>
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
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
        padding: var(--space-4);
      }

      .auth-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: clamp(var(--space-6), 8vw, var(--space-10));
        width: 100%;
        max-width: 420px;
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
      }

      .auth-header {
        text-align: center;
        margin-bottom: var(--space-8);
      }

      .auth-logo {
        height: 12rem;
        margin-bottom: var(--space-4);
      }

      .auth-title {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin-bottom: var(--space-2);
      }

      .auth-subtitle {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        font-weight: var(--fw-regular);
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);

        label {
          font-size: var(--text-sm);
          font-weight: var(--fw-medium);
          color: var(--text-secondary);
        }

        input {
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--border-color, var(--border-strong));
          border-radius: var(--radius-md);
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: var(--text-base);
          font-weight: var(--fw-regular);
          transition: border-color 0.2s, box-shadow 0.2s;

          &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
          }

          &::placeholder {
            color: var(--text-tertiary);
            opacity: 0.7;
          }
        }
      }

      .error-message {
        background: var(--surface-muted);
        color: var(--text-primary);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-xs);
      }

      .submit-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        box-sizing: border-box;
      }

      .spinner {
        width: 1em;
        height: 1em;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: currentColor;
        border-radius: var(--radius-full);
        animation: spin 0.6s linear infinite;
        display: inline-block;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .success-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        text-align: center;
        
        p {
          color: var(--text-primary);
          font-size: var(--text-base);
          font-weight: var(--fw-medium);
          margin: 0;
        }
      }

      .success-icon {
        font-size: var(--text-5xl);
        color: var(--primary-color);
      }

      .link-btn {
        text-decoration: none;
        margin-top: var(--space-2);
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
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode.set(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));

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
