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
          <a routerLink="/login" class="btn-login-header">Entrar</a>
        </div>
      </header>

      <main class="landing-main">
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Controle de escalas e alocações automáticas
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Cálculo automático de salários e adicionais noturnos
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
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
                    placeholder="Mínimo 8 caracteres"
                    required
                    minlength="8"
                    autocomplete="new-password"
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
                        <path
                          d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                        />
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
        padding: 0 2rem;
        height: 64px;
        display: flex;
        align-items: center;
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
        height: 50px;
      }

      .btn-login-header {
        padding: 0.5rem 1.25rem;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-color);
          color: white;
        }
      }

      /* Main */
      .landing-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 4rem 2rem;
      }

      .hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: center;
      }

      .hero-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .hero-badge {
        display: inline-block;
        background: rgba(33, 150, 243, 0.12);
        color: var(--primary-color);
        border: 1px solid rgba(33, 150, 243, 0.3);
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        width: fit-content;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .hero-title {
        font-size: 2.75rem;
        font-weight: 800;
        line-height: 1.15;
        color: var(--text-primary);
      }

      .hero-highlight {
        color: var(--primary-color);
      }

      .hero-description {
        font-size: 1.05rem;
        color: var(--text-secondary);
        line-height: 1.7;
      }

      .hero-features {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-primary);

          svg {
            color: #10b981;
            flex-shrink: 0;
          }
        }
      }

      /* Register Card */
      .register-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: 20px;
        padding: 2.5rem;
        box-shadow: var(--shadow-lg);
      }

      .register-header {
        text-align: center;
        margin-bottom: 1.75rem;

        h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
        }

        p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      }

      .register-form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .optional {
          font-weight: 400;
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        input {
          padding: 0.7rem 0.9rem;
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: border-color 0.2s;

          &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.12);
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
        padding: 0.7rem 0.9rem;
        font-size: 0.85rem;
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
        margin-top: 0.25rem;

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

      .terms {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        text-align: center;
      }

      .register-footer {
        text-align: center;
        margin-top: 1.25rem;
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

      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }

        .hero-title {
          font-size: 2rem;
        }

        .landing-main {
          padding: 2rem 1rem;
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
