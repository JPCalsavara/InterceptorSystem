import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/login" class="back-link" data-cy="esqueci-back">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Voltar para o login
        </a>
        <div class="auth-header">
          <img [src]="logoSrc()" alt="Interceptor System" class="auth-logo" />
          <h1 class="auth-title">Esqueci minha senha</h1>
          <p class="auth-subtitle">Informe seu e-mail para receber as instruções de recuperação</p>
        </div>

        @if (!enviado()) {
          <form class="auth-form" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">E-mail</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                data-cy="esqueci-email"
                [class.input-error]="hasError('email')"
                placeholder="sua@empresa.com"
                autocomplete="email"
              />
              @if (hasError('email')) {
                <span class="field-error">{{ getErrorMessage('email') }}</span>
              }
            </div>

            <button type="submit" class="btn-primary btn-lg submit-btn" data-cy="esqueci-submit" [disabled]="carregando()">
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

      .back-link {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        margin-bottom: var(--space-5);
        align-self: flex-start;
        transition: color 0.2s;

        &:hover {
          color: var(--primary-color);
        }

        svg {
          flex-shrink: 0;
          font-size: var(--text-xl);
        }
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

          &.input-error {
            border-color: #dc2626;

            &:focus {
              box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
            }
          }
        }
      }

      .field-error {
        font-size: var(--text-xs);
        color: #dc2626;
        font-weight: var(--fw-medium);
      }

      .submit-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
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
        background: var(--surface-muted);
        color: var(--text-primary);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        text-align: center;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
      }
    `,
  ],
})
export class EsqueciSenhaComponent implements OnInit {
  private fb = new FormBuilder();
  form: FormGroup;
  enviado = signal(false);
  carregando = signal(false);
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  constructor(private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode.set(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['email']) return 'E-mail inválido';

    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);

    const { email } = this.form.value;

    this.authService.solicitarResetSenha(email).subscribe({
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
