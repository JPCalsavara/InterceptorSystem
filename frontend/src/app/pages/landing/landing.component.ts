import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Header -->
      <header class="landing-header">
        <div class="header-container">
          <img [src]="logoSrc()" alt="Interceptor System" class="header-logo" />
          <nav class="header-nav">
            <!-- Theme Toggle -->
            <button
              class="theme-toggle"
              (click)="toggleTheme()"
              [title]="isDarkMode() ? 'Ativar modo claro' : 'Ativar modo escuro'"
            >
              @if (isDarkMode()) {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clip-rule="evenodd"
                  />
                </svg>
              } @else {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              }
            </button>

            <a routerLink="/login" class="btn-outline">Entrar</a>
            <a routerLink="/cadastro" class="btn-primary">Criar conta</a>
          </nav>
        </div>
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-badge">Gestão de Segurança Patrimonial</div>
          <h1 class="hero-title">
            Controle total da sua<br />
            <span class="hero-highlight">operação de segurança</span>
          </h1>
          <p class="hero-description">
            Gerencie funcionários, contratos, turnos e alocações em um só lugar. Simples, eficiente
            e pensado para empresas de segurança patrimonial.
          </p>
          <div class="hero-actions">
            <a routerLink="/cadastro" class="btn-hero-primary">Começar gratuitamente</a>
            <a routerLink="/login" class="btn-hero-secondary">Já tenho uma conta</a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features">
        <div class="features-inner">
          <h2 class="features-title">Tudo que sua empresa precisa</h2>
          <p class="features-subtitle">
            Uma plataforma completa para gerenciar sua operação do dia a dia
          </p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3>Escalas e Alocações</h3>
              <p>
                Controle de escalas 12x36 e comercial com alocações automáticas e gestão de
                coberturas de falta.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📄</div>
              <h3>Gestão de Contratos</h3>
              <p>
                Acompanhe contratos por condomínio com vencimentos, status e alertas de renovação em
                kanban visual.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💰</div>
              <h3>Dashboard Financeiro</h3>
              <p>
                Visão completa de faturamento, custos, lucro mensal e impostos com cálculos
                automáticos.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📍</div>
              <h3>Postos de Trabalho</h3>
              <p>
                Defina turnos e horários por condomínio com controle de capacidade e permissão de
                dobras.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3>Gestão de Funcionários</h3>
              <p>
                Cadastro completo com cálculo automático de salário base, adicionais noturnos e
                benefícios.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏢</div>
              <h3>Condomínios</h3>
              <p>
                Gerencie seus clientes com dados de contato, gestor responsável e quantidade ideal
                por turno.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="cta-banner">
        <div class="cta-inner">
          <h2>Comece a usar gratuitamente</h2>
          <p>Sem cartão de crédito. Configure em minutos.</p>
          <a routerLink="/cadastro" class="btn-cta">Criar conta gratuita</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-inner">
          <img [src]="logoSrc()" alt="Interceptor System" class="footer-logo" />
          <p class="footer-text">© 2026 Interceptor System. Todos os direitos reservados.</p>
        </div>
      </footer>
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
        position: sticky;
        top: 0;
        z-index: 50;
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

      .header-nav {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .theme-toggle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: var(--theme-toggle-bg);
        color: var(--theme-toggle-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--theme-toggle-hover-bg);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }
      }

      .btn-outline {
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

      .btn-primary {
        padding: 0.5rem 1.25rem;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-dark);
        }
      }

      /* Hero */
      .hero {
        padding: 6rem 2rem;
        text-align: center;
        background: linear-gradient(180deg, var(--surface-card) 0%, var(--bg-primary) 100%);
      }

      .hero-inner {
        max-width: 700px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
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
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .hero-title {
        font-size: 3.25rem;
        font-weight: 800;
        line-height: 1.15;
        color: var(--text-primary);
      }

      .hero-highlight {
        color: var(--primary-color);
      }

      .hero-description {
        font-size: 1.1rem;
        color: var(--text-secondary);
        line-height: 1.7;
        max-width: 560px;
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn-hero-primary {
        padding: 0.875rem 2rem;
        background: var(--primary-color);
        color: white;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
        }
      }

      .btn-hero-secondary {
        padding: 0.875rem 2rem;
        border: 2px solid var(--border-strong);
        color: var(--text-primary);
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
      }

      /* Features */
      .features {
        padding: 5rem 2rem;
        background: var(--bg-primary);
      }

      .features-inner {
        max-width: 1100px;
        margin: 0 auto;
      }

      .features-title {
        font-size: 2rem;
        font-weight: 800;
        text-align: center;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }

      .features-subtitle {
        text-align: center;
        color: var(--text-secondary);
        font-size: 1rem;
        margin-bottom: 3rem;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      .feature-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: 16px;
        padding: 2rem;
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 20px rgba(33, 150, 243, 0.1);
          transform: translateY(-2px);
        }
      }

      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        line-height: 1;
      }

      .feature-card h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.6rem;
      }

      .feature-card p {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      /* CTA Banner */
      .cta-banner {
        padding: 5rem 2rem;
        background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      }

      .cta-inner {
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .cta-inner h2 {
        font-size: 2rem;
        font-weight: 800;
        color: white;
      }

      .cta-inner p {
        font-size: 1.05rem;
        color: rgba(255, 255, 255, 0.85);
      }

      .btn-cta {
        padding: 1rem 2.5rem;
        background: white;
        color: #1976d2;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        margin-top: 0.5rem;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
      }

      /* Footer */
      .landing-footer {
        padding: 2rem;
        border-top: 1px solid var(--border-subtle);
        background: var(--surface-card);
      }

      .footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .footer-logo {
        height: 36px;
        opacity: 0.7;
      }

      .footer-text {
        font-size: 0.85rem;
        color: var(--text-tertiary);
      }

      /* Responsive */
      @media (max-width: 900px) {
        .hero-title {
          font-size: 2.5rem;
        }

        .features-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 600px) {
        .hero-title {
          font-size: 2rem;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }

        .footer-inner {
          flex-direction: column;
          text-align: center;
        }

        .btn-outline {
          display: none;
        }
      }
    `,
  ],
})
export class LandingComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isDarkMode = signal(false);
  logoSrc = computed(() => (this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png'));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('theme');
    if (saved) {
      this.isDarkMode.set(saved === 'dark');
      return;
    }

    this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  private applyTheme(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.isDarkMode.update((v) => !v);
  }
}
