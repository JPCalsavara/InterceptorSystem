import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent as FormGroup;
  if (!parent) return null;
  const novaSenha = parent.get('novaSenha')?.value;
  const confirmar = control.value;
  if (novaSenha && confirmar && novaSenha !== confirmar) {
    return { senhasNaoIguais: true };
  }
  return null;
}

@Component({
  selector: 'app-nova-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img [src]="logoSrc()" alt="Interceptor System" class="auth-logo" />
          <h1 class="auth-title">Nova senha</h1>
          <p class="auth-subtitle">Escolha uma nova senha para sua conta</p>
        </div>

        @if (!concluido()) {
          <form class="auth-form" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="novaSenha">Nova senha</label>
              <div class="input-password-wrapper">
                <input
                  id="novaSenha"
                  [type]="mostrarSenha() ? 'text' : 'password'"
                  formControlName="novaSenha"
                  [class.input-error]="hasError('novaSenha')"
                  placeholder="8+ carac., 1 maiúscula, 1 num."
                  autocomplete="new-password"
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
              @if (hasError('novaSenha')) {
                <span class="field-error">{{ getErrorMessage('novaSenha') }}</span>
              }
            </div>

            <div class="form-group">
              <label for="confirmarSenha">Confirmar nova senha</label>
              <div class="input-password-wrapper">
                <input
                  id="confirmarSenha"
                  [type]="mostrarConfirmar() ? 'text' : 'password'"
                  formControlName="confirmarSenha"
                  [class.input-error]="hasError('confirmarSenha')"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="toggle-senha"
                  (click)="mostrarConfirmar.set(!mostrarConfirmar())"
                  [title]="mostrarConfirmar() ? 'Ocultar senha' : 'Mostrar senha'"
                >
                  @if (mostrarConfirmar()) {
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
              @if (hasError('confirmarSenha')) {
                <span class="field-error">{{ getErrorMessage('confirmarSenha') }}</span>
              }
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
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form!: FormGroup;
  token = '';
  carregando = signal(false);
  erro = signal<string | null>(null);
  concluido = signal(false);
  mostrarSenha = signal(false);
  mostrarConfirmar = signal(false);
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode.set(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));

    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.erro.set('Token não encontrado. Solicite um novo link.');
    }

    this.form = this.fb.group({
      novaSenha: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
      ],
      confirmarSenha: ['', [Validators.required, senhasIguaisValidator]],
    });

    // Re-validate confirmarSenha when novaSenha changes
    this.form.get('novaSenha')?.valueChanges.subscribe(() => {
      this.form.get('confirmarSenha')?.updateValueAndValidity();
    });
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
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'A senha deve conter pelo menos 8 caracteres, 1 maiúscula e 1 número';
    if (errors['senhasNaoIguais']) return 'As senhas não coincidem';

    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    const { novaSenha } = this.form.value;

    this.authService.confirmarResetSenha(this.token, novaSenha).subscribe({
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
