import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { NgZone } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
    <div class="auth-card">
    <a routerLink="/" class="back-link">
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      Voltar ao início
    </a>
        <div class="auth-header">
          <img [src]="logoSrc()" alt="Interceptor System" class="auth-logo" />
          <h1 class="auth-title">Entrar na sua conta</h1>
          <p class="auth-subtitle">Gerencie suas operações de segurança</p>
        </div>

        <form class="auth-form" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              data-cy="login-email"
              [class.input-error]="hasError('email')"
              placeholder="seu@email.com"
              autocomplete="username"
            />
            @if (hasError('email')) {
              <span class="field-error">{{ getErrorMessage('email') }}</span>
            }
          </div>

          <div class="form-group">
            <label for="senha">Senha</label>
            <div class="input-password-wrapper">
              <input
                id="senha"
                [type]="mostrarSenha() ? 'text' : 'password'"
                formControlName="senha"
                data-cy="login-password"
                [class.input-error]="hasError('senha')"
                placeholder="Sua senha segura"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-senha"
                (click)="mostrarSenha.set(!mostrarSenha())"
                [title]="mostrarSenha() ? 'Ocultar senha' : 'Mostrar senha'"
              >
                @if (mostrarSenha()) {
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                } @else {
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              </button>
            </div>
            @if (hasError('senha')) {
              <span class="field-error">{{ getErrorMessage('senha') }}</span>
            }
          </div>

          @if (erro()) {
            <div class="error-message">{{ erro() }}</div>
          }

          <button
            type="submit"
            class="btn-primary btn-lg"
            data-cy="login-submit"
            [disabled]="carregando()"
            style="width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-top: var(--space-1);"
          >
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

        <div class="divider">
          <span>ou continue com</span>
        </div>

        <button
          type="button"
          class="btn-google"
          (click)="loginComGoogle()"
          [disabled]="carregando()"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Google
        </button>

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
        max-width: 420px;
        width: 100%;
        transition: color 0.2s;

        &:hover {
          color: var(--primary-color);
        }

        .icon-container {
          font-size: var(--text-xl);
          display: flex;
        }

        svg {
          flex-shrink: 0;
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
        right: var(--space-3);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        padding: 0;
        line-height: 1;
        font-size: var(--text-lg);

        &:hover {
          color: var(--text-primary);
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

      .auth-footer {
        text-align: center;
        margin-top: var(--space-6);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        font-weight: var(--fw-regular);

        a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: var(--fw-semibold);

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .forgot-password {
        text-align: right;
        font-size: var(--text-sm);
        margin-top: calc(-1 * var(--space-2));

        a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: var(--fw-medium);

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: var(--space-6) 0;
        color: var(--text-tertiary);
        font-size: var(--text-sm);

        &::before,
        &::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-subtle);
        }

        &::before {
          margin-right: var(--space-3);
        }

        &::after {
          margin-left: var(--space-3);
        }
      }

      .btn-google {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-3);
        background: var(--surface-card);
        color: var(--text-primary);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
        padding: var(--space-3);
        font-size: var(--text-base);
        font-weight: var(--fw-medium);
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not([disabled]) {
          background: var(--surface-hover);
          border-color: var(--border-hover);
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        svg {
          width: 24px;
          height: 24px;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private fb = new FormBuilder();
  form!: FormGroup;
  erro = signal<string | null>(null);
  carregando = signal(false);
  mostrarSenha = signal(false);
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
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

    this.erro.set(null);
    this.carregando.set(true);

    const { email, senha } = this.form.value;

    this.authService.login({ email, senha }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.carregando.set(false);
        const msg = err?.error?.mensagem;
        this.erro.set(msg ?? 'Erro ao entrar. Verifique seus dados.');
      },
    });
  }

  loginComGoogle(): void {
    this.carregando.set(true);
    if (typeof google === 'undefined') {
      this.erro.set('O Google Identity Services não pôde ser carregado. Verifique sua conexão.');
      this.carregando.set(false);
      return;
    }

    if (!environment.googleClientId || environment.googleClientId.startsWith('COLOQUE_SEU_CLIENT_ID')) {
      this.erro.set('O Client ID do Google não está configurado no arquivo environment.ts.');
      this.carregando.set(false);
      return;
    }

    // Inicializa o prompt de login do Google
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.ngZone.run(() => this.handleGoogleCredentialResponse(response))
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        this.erro.set('O pop-up de login do Google foi bloqueado pelo navegador ou ignorado.');
        this.carregando.set(false);
      }
    });
  }

  private handleGoogleCredentialResponse(response: any): void {
    if (response.credential) {
      this.authService.loginGoogle({ idToken: response.credential }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.carregando.set(false);
          const msg = err?.error?.mensagem;
          this.erro.set(msg ?? 'Erro ao autenticar com o Google.');
        }
      });
    } else {
      this.carregando.set(false);
      this.erro.set('Falha ao obter credenciais do Google.');
    }
  }
}
