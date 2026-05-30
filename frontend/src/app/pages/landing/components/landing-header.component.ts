import { Component, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="landing-header" [class.header-hidden]="!isHeaderVisible()">
      <div class="header-container">
        <img [src]="logoSrc()" alt="Interceptor Assessoria Inteligente" class="header-logo" />
        <nav class="header-nav">
          <a href="#sobre" class="nav-link">Sobre</a>
          <a href="#servicos" class="nav-link">Serviços</a>
          <a href="#sistema" class="nav-link hide-mobile">Sistema</a>
          <a href="#numeros" class="nav-link hide-mobile">Números</a>
          <a href="#lideranca" class="nav-link hide-mobile">Liderança</a>
          <a href="#contato" class="nav-link hide-mobile">Contato</a>

          <button class="mobile-menu-btn" (click)="menuToggle.emit()" aria-label="Menu" data-cy="landing-mobile-menu">
            @if (isMobileMenuOpen()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          </button>

          <button
            class="theme-toggle"
            (click)="themeToggle.emit()"
            data-cy="landing-theme-toggle"
            [title]="isDarkMode() ? 'Ativar modo claro' : 'Ativar modo escuro'"
          >
            @if (isDarkMode()) {
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            }
          </button>

          <a routerLink="/login" class="btn-outline hide-on-mobile" data-cy="landing-login-nav">Entrar</a>
          <a routerLink="/cadastro" class="btn-primary hide-on-mobile" data-cy="landing-cadastro-nav">Criar conta</a>
        </nav>
      </div>
    </header>

    @if (isMobileMenuOpen()) {
      <div class="mobile-menu-overlay">
        <nav class="mobile-nav">
          <a href="#sobre" class="mobile-link" (click)="menuToggle.emit()">Sobre</a>
          <a href="#servicos" class="mobile-link" (click)="menuToggle.emit()">Serviços</a>
          <a href="#sistema" class="mobile-link" (click)="menuToggle.emit()">Sistema</a>
          <a href="#numeros" class="mobile-link" (click)="menuToggle.emit()">Números</a>
          <a href="#lideranca" class="mobile-link" (click)="menuToggle.emit()">Liderança</a>
          <a href="#contato" class="mobile-link" (click)="menuToggle.emit()">Contato</a>
          <div class="mobile-actions">
            <a routerLink="/login" class="btn-outline mobile-btn" data-cy="landing-login-mobile" (click)="menuToggle.emit()">Entrar</a>
            <a routerLink="/cadastro" class="btn-primary mobile-btn" data-cy="landing-cadastro-mobile" (click)="menuToggle.emit()">Criar conta</a>
          </div>
        </nav>
      </div>
    }
  `,
  styles: [`
    :host { --header-height: 72px; display: contents; }
    svg { width: 1em; height: 1em; }

    .landing-header {
      border-bottom: 1px solid var(--border-subtle);
      background: color-mix(in srgb, var(--surface-card) 85%, transparent);
      padding: 0 2rem;
      height: var(--header-height);
      display: flex;
      align-items: center;
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 50;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .landing-header.header-hidden { transform: translateY(-100%); }

    .header-container {
      width: 100%; max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
    }

    .header-logo { height: 7rem; }

    .header-nav { display: flex; align-items: center; gap: var(--space-3); }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: var(--text-sm);
      font-weight: var(--fw-medium);
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius-md);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-link:hover {
      color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    }

    .mobile-menu-btn {
      display: none;
      background: transparent; border: none;
      color: var(--text-primary); cursor: pointer;
      padding: var(--space-2); font-size: 1.5rem;
    }

    .mobile-menu-overlay {
      position: fixed;
      top: var(--header-height); left: 0; right: 0; bottom: 0;
      background: var(--bg-primary);
      z-index: 40;
      display: flex; flex-direction: column;
      padding: var(--space-8);
      animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      overflow-y: auto;
    }

    @keyframes slideDown {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .mobile-nav { display: flex; flex-direction: column; }

    .mobile-link {
      font-size: var(--text-xl); font-weight: var(--fw-semibold);
      color: var(--text-primary); text-decoration: none;
      padding: 1rem 0; border-bottom: 1px solid var(--border-subtle);
    }
    .mobile-link:last-of-type { border-bottom: none; }

    .mobile-actions {
      display: flex; flex-direction: column;
      gap: var(--space-4); margin-top: var(--space-8);
    }

    .mobile-btn { text-align: center; width: 100%; padding: 0.875rem; }

    .theme-toggle {
      width: 40px; height: 40px;
      border-radius: var(--radius-full); border: none;
      background: var(--theme-toggle-bg); color: var(--theme-toggle-color);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1.25rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .theme-toggle:hover { background: var(--theme-toggle-hover-bg); transform: scale(1.05); }
    .theme-toggle:active { transform: scale(0.95); }

    .btn-outline {
      padding: 0.5rem 1.25rem;
      border: 2px solid var(--primary-color); color: var(--primary-color);
      border-radius: var(--radius-md); text-decoration: none;
      font-weight: var(--fw-semibold); font-size: var(--text-sm);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-outline:hover { background: var(--primary-color); color: white; }

    .btn-primary {
      padding: 0.5rem 1.25rem;
      background: var(--primary-color); color: white;
      border-radius: var(--radius-md); text-decoration: none;
      font-weight: var(--fw-semibold); font-size: var(--text-sm);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-primary:hover { background: var(--primary-dark); }

    @media (max-width: 900px) {
      .hide-mobile { display: none; }
      .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
      .hide-on-mobile { display: none; }
    }

    @media (max-width: 600px) {
      .nav-link { display: none; }
      .landing-header { padding: 0 1rem; }
    }
  `],
})
export class LandingHeaderComponent {
  readonly isDarkMode = input.required<boolean>();
  readonly isMobileMenuOpen = input.required<boolean>();
  readonly isHeaderVisible = input.required<boolean>();

  readonly logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  readonly menuToggle = output<void>();
  readonly themeToggle = output<void>();
}
