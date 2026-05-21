import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img [src]="logoSrc()" alt="Interceptor System" class="auth-logo" />
          <h1 class="auth-title">Verificação de E-mail</h1>
        </div>

        @if (carregando()) {
          <div class="status-box loading">
            <div class="spinner"></div>
            <p>Verificando seu e-mail...</p>
          </div>
        }

        @if (!carregando() && sucesso()) {
          <div class="status-box success">
            <svg class="status-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p>E-mail verificado com sucesso!</p>
            <a routerLink="/dashboard" class="btn-primary btn-lg action-btn" data-cy="verificar-dashboard-btn">Ir para o painel</a>
          </div>
        }

        @if (!carregando() && erro()) {
          <div class="status-box error">
            <svg class="status-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p>{{ erro() }}</p>
            <a routerLink="/dashboard" class="btn-secondary action-btn" data-cy="verificar-dashboard-btn-error" style="padding: var(--space-3) var(--space-6); text-align: center; display: inline-block;">Voltar ao painel</a>
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
        text-align: center;
      }

      .auth-header {
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
      }

      .status-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-6);
        border-radius: var(--radius-lg);

        p {
          color: var(--text-primary);
          font-size: var(--text-base);
          font-weight: var(--fw-medium);
          margin: 0;
        }

        &.loading {
          background: var(--surface-card);
        }

        &.success {
          background: var(--surface-muted);
          border: 1px solid var(--border-subtle);
          .status-icon {
            color: var(--primary-color);
          }
        }

        &.error {
          background: var(--surface-muted);
          border: 1px solid var(--border-strong);
          .status-icon {
            color: var(--kanban-error-border, #dc2626);
          }
        }
      }

      .status-icon {
        font-size: var(--text-5xl);
        flex-shrink: 0;
      }

      .spinner {
        width: 2.5rem;
        height: 2.5rem;
        border: 3px solid var(--border-subtle);
        border-top-color: var(--primary-color);
        border-radius: var(--radius-full);
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .action-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        margin-top: var(--space-2);
        box-sizing: border-box;
      }
    `,
  ],
})
export class VerificarEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  carregando = signal(true);
  sucesso = signal(false);
  erro = signal<string | null>(null);
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode.set(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.carregando.set(false);
      this.erro.set('Token não encontrado.');
      return;
    }

    this.authService.confirmarEmail(token).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Token inválido ou expirado.');
      },
    });
  }
}
