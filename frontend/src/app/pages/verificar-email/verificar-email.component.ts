import { Component, OnInit, inject, signal } from '@angular/core';
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
          <img src="/logo-preta.png" alt="Interceptor System" class="auth-logo" />
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
            <div class="status-icon">✓</div>
            <p>E-mail verificado com sucesso!</p>
            <a routerLink="/dashboard" class="btn-primary">Ir para o painel</a>
          </div>
        }

        @if (!carregando() && erro()) {
          <div class="status-box error">
            <div class="status-icon">✕</div>
            <p>{{ erro() }}</p>
            <a routerLink="/dashboard" class="btn-secondary">Voltar ao painel</a>
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
        text-align: center;
      }

      .auth-header {
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
      }

      .status-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 8px;

        p {
          color: var(--text-primary);
          font-size: 1rem;
        }

        &.loading {
          background: var(--surface-card);
        }

        &.success {
          background: #d1fae5;
          .status-icon {
            color: #059669;
          }
        }

        &.error {
          background: #fee2e2;
          .status-icon {
            color: #dc2626;
          }
        }
      }

      .status-icon {
        font-size: 2.5rem;
        font-weight: bold;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-subtle);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
      }

      .btn-primary {
        background: var(--primary-color);
        color: white;
      }

      .btn-secondary {
        background: var(--surface-card);
        color: var(--text-primary);
        border: 1px solid var(--border-strong);
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

  ngOnInit(): void {
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
