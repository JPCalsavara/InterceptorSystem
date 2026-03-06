import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxMaskDirective],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <header class="landing-header">
        <div class="header-container">
          <img src="/logo-preta.png" alt="Interceptor System" class="header-logo" />
          <a routerLink="/login" class="btn-outline" style="padding: var(--space-2) var(--space-4); text-decoration: none; border-radius: var(--radius-md);">Entrar</a>
        </div>
      </header>

      <main class="landing-main">
      <a routerLink="/" class="back-link">
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Voltar ao início
      </a>
        <section class="hero">
          <div class="hero-content">
            <div class="hero-badge">Gestão de Segurança Patrimonial</div>
            <h1 class="hero-title">
              Controle total da sua<br />
              <span class="hero-highlight">operação de segurança</span>
            </h1>
            <p class="hero-description">
              Gerencie funcionários, contratos, turnos e alocações em um só lugar. Simples,
              eficiente e pensado para empresas de segurança.
            </p>

            <ul class="hero-features">
              <li>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Controle de escalas e alocações automáticas
              </li>
              <li>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cálculo automático de salários e adicionais noturnos
              </li>
              <li>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dashboard financeiro com visão mensal e anual
              </li>
            </ul>
          </div>

          <!-- Formulário de Cadastro -->
          <div class="register-card">
            <div class="register-header">
              <h2>Criar conta gratuita</h2>
              <p>Comece em menos de 2 minutos</p>
            </div>

            <form class="register-form" (ngSubmit)="onSubmit()" #form="ngForm">
              <div class="form-group">
                <label for="nomeEmpresa">Nome da empresa</label>
                <input
                  id="nomeEmpresa"
                  type="text"
                  name="nomeEmpresa"
                  [(ngModel)]="nomeEmpresa"
                  placeholder="Segurança Total Ltda"
                  required
                />
              </div>

              <div class="form-group">
                <label for="cnpj">CNPJ <span class="optional">(opcional)</span></label>
                <input
                  id="cnpj"
                  type="text"
                  name="cnpj"
                  [(ngModel)]="cnpj"
                  placeholder="00.000.000/0001-00"
                  mask="00.000.000/0000-00"
                />
              </div>

              <div class="form-group">
                <label for="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  placeholder="contato@empresa.com"
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
                    placeholder="8+ carac., 1 maiúscula, 1 num."
                    required
                    minlength="8"
                    pattern="^(?=.*[A-Z])(?=.*\\d).{8,}$"
                    title="A senha deve conter pelo menos 8 caracteres, 1 letra maiúscula e 1 número."
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
              </div>

              @if (erro()) {
                <div class="error-message">{{ erro() }}</div>
              }

              <button type="submit" class="btn-primary btn-lg" [disabled]="carregando()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-top: var(--space-1);">
                @if (carregando()) {
                  <span class="spinner"></span> Criando conta...
                } @else {
                  Criar conta gratuita
                }
              </button>

              <p class="terms">Ao criar sua conta, você concorda com nossos termos de uso.</p>
            </form>

            <div class="register-footer">Já tem uma conta? <a routerLink="/login">Entrar</a></div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .landing-page {
        min-height: 100vh;
        background: var(--bg-primary);
        color: var(--text-primary);
      }

      /* Header */
      .landing-header {
        border-bottom: 1px solid var(--border-subtle);
        background: var(--surface-card);
        padding: 0 var(--space-8);
        height: 64px;
        display: flex;
        align-items: center;
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

        svg {
          flex-shrink: 0;
          font-size: var(--text-xl);
        }
      }

      .header-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-logo {
        height: 48px;
      }

      /* Main */
      .landing-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-12) var(--space-8);
      }

      .hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-12);
        align-items: center;
      }

      .hero-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .hero-badge {
        display: inline-block;
        background: var(--surface-muted);
        color: var(--primary-color);
        border: 1px solid var(--border-subtle);
        padding: var(--space-1) var(--space-4);
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        width: fit-content;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .hero-title {
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: var(--fw-extrabold);
        line-height: 1.15;
        color: var(--text-primary);
      }

      .hero-highlight {
        color: var(--primary-color);
      }

      .hero-description {
        font-size: var(--text-base);
        color: var(--text-secondary);
        line-height: 1.7;
      }

      .hero-features {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--text-primary);

          svg {
            color: #10b981; /* Success icon */
            flex-shrink: 0;
            font-size: var(--text-xl);
          }
        }
      }

      /* Register Card */
      .register-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-2xl);
        padding: clamp(var(--space-6), 6vw, var(--space-10));
        box-shadow: var(--shadow-lg);
      }

      .register-header {
        text-align: center;
        margin-bottom: var(--space-6);

        h2 {
          font-size: var(--text-2xl);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        p {
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
      }

      .register-form {
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

        .optional {
          font-weight: var(--fw-regular);
          color: var(--text-tertiary);
          font-size: var(--text-xs);
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
        font-weight: var(--fw-medium);
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

      .terms {
        font-size: var(--text-xs);
        color: var(--text-tertiary);
        text-align: center;
      }

      .register-footer {
        text-align: center;
        margin-top: var(--space-5);
        font-size: var(--text-sm);
        color: var(--text-secondary);

        a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: var(--fw-semibold);

          &:hover {
            text-decoration: underline;
          }
        }
      }

      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
          gap: var(--space-10);
        }

        .landing-main {
          padding: var(--space-8) var(--space-4);
        }

        .landing-header {
          padding: 0 var(--space-4);
        }
      }
    `,
  ],
})
export class CadastroComponent {
  nomeEmpresa = '';
  cnpj = '';
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
    if (!this.nomeEmpresa || !this.email || !this.senha) return;

    this.erro.set(null);
    this.carregando.set(true);

    this.authService
      .registrar({
        nomeEmpresa: this.nomeEmpresa,
        cnpj: this.cnpj || undefined,
        email: this.email,
        senha: this.senha,
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.carregando.set(false);
          const msg = err?.error?.mensagem;
          this.erro.set(msg ?? 'Erro ao criar conta. Tente novamente.');
        },
      });
  }
}
