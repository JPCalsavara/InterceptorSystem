import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';
import { EmailVerificationBannerComponent } from '../../shared/components/email-verification-banner/email-verification-banner.component';
import { LayoutStateService } from '../services/layout-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    EmailVerificationBannerComponent,
  ],
  template: `
    <app-navbar data-cy="app-navbar" />
    <div class="overlay" data-cy="layout-overlay" [class.visible]="overlayVisible()" (click)="layoutState.closeAll()"></div>
    <div class="app-layout" data-cy="app-layout" [class.sidebar-collapsed]="layoutState.sidebarCollapsed()">
      <app-sidebar data-cy="app-sidebar" />
      <main class="main-content" data-cy="main-content">
        <div class="main-content-inner">
          <app-email-verification-banner />
          <div class="page-router-slot" data-cy="router-slot">
            <router-outlet />
          </div>

          <footer class="system-footer" data-cy="system-footer">
            <div class="footer-main">
              <div class="footer-links-grid">
                <div class="footer-link-group">
                  <a href="/#" class="footer-group-link"
                    ><h4 class="footer-group-title">Introducao</h4></a
                  >
                  <div class="footer-link-matrix">
                    <a href="/#sobre" class="footer-link">Sobre</a>
                    <a href="/#servicos" class="footer-link">Servico</a>
                    <a href="/#sistema" class="footer-link">Sistema</a>
                    <a href="/#numeros" class="footer-link">Numeros</a>
                    <a href="/#lideranca" class="footer-link">Lideranca</a>
                    <a href="/#contato" class="footer-link">Contato</a>
                  </div>
                </div>

                <div class="footer-link-group">
                  <a [routerLink]="['/dashboard']" class="footer-group-link"
                    ><h4 class="footer-group-title">Interna</h4></a
                  >
                  <div class="footer-link-matrix">
                    <a [routerLink]="['/clientes']" class="footer-link">Clientes</a>
                    <a [routerLink]="['/contratos']" class="footer-link">Contratos</a>
                    <a [routerLink]="['/funcionarios']" class="footer-link">Funcionarios</a>
                    <a [routerLink]="['/postos']" class="footer-link">Postos</a>
                    <a [routerLink]="['/alocacoes']" class="footer-link">Alocacoes</a>
                    <a [routerLink]="['/diarias']" class="footer-link">Diarias</a>
                  </div>
                </div>

                <div class="footer-link-group">
                  <a [routerLink]="['/perfil']" class="footer-group-link"
                    ><h4 class="footer-group-title">Perfil</h4></a
                  >
                  <div class="footer-link-matrix">
                    <a [routerLink]="['/conta']" class="footer-link">Configuracao</a>
                    <a [routerLink]="['/plano']" class="footer-link">Plano</a>
                  </div>
                </div>
              </div>

              <div class="footer-branding">
                <img
                  src="/logo-preta.png"
                  alt="Interceptor"
                  class="footer-logo footer-logo-light"
                />
                <img
                  src="/logo-branca.png"
                  alt="Interceptor"
                  class="footer-logo footer-logo-dark"
                />
              </div>
            </div>

            <p class="footer-copy">
              © {{ currentYear }} Interceptor Assessoria Inteligente. Ambiente interno.
            </p>
          </footer>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        padding-top: 64px;
        background: var(--bg-secondary);
      }

      .main-content {
        flex: 1;
        min-width: 0;
        margin-left: 260px;
        min-height: calc(100vh - 64px);
        background: var(--bg-primary);

        .main-content-inner {
          min-height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
          padding: var(--space-8) var(--space-6) var(--space-6);
        }

        .page-router-slot {
          flex: 1;
          min-width: 0;
        }

        .system-footer {
          margin-top: var(--space-8);
          padding: var(--space-8) var(--space-4);
          border-top: 2px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          font-size: var(--text-sm);
          text-align: left;
        }

        .footer-main {
          width: min(1080px, 100%);
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .footer-links-grid {
          width: min(920px, 100%);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
          text-align: left;
        }

        .footer-link-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .footer-link-matrix {
          display: flex;
          flex-wrap: wrap;
          column-gap: 0.9rem;
          row-gap: 0.2rem;
          max-height: 3.4rem;
          align-content: flex-start;
        }

        .footer-group-link {
          display: block;
          text-decoration: none;
          width: fit-content;
          text-align: center;
        }

        .footer-group-title {
          margin: 0 0 0.35rem 0;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.95rem;
          text-align: center;
        }

        .footer-link {
          display: inline-block;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.86rem;
          line-height: 1.5;
          transition: color 0.2s ease;

          &:hover {
            color: var(--app-ref-135fb0);
          }
        }

        .footer-branding {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
        }

        .footer-logo {
          width: 15rem;
          height: auto;
          display: block;
        }

        .footer-logo-dark {
          display: none;
        }

        :host-context(body.dark-mode) .footer-logo-light {
          display: none;
        }

        :host-context(body.dark-mode) .footer-logo-dark {
          display: block;
        }

        .footer-copy {
          color: var(--text-tertiary, var(--text-secondary));
          font-size: 0.8rem;
          line-height: 1.4;
          margin: 0;
          opacity: 0.8;
          text-align: center;
        }

        @media (max-width: 768px) {
          margin-left: 0;

          .main-content-inner {
            padding: var(--space-4) var(--space-3);
          }

          .system-footer {
            padding: var(--space-6) var(--space-3);
            gap: var(--space-4);
          }

          .footer-main {
            flex-direction: column;
            align-items: center;
          }

          .footer-links-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-link-matrix {
            max-height: none;
            justify-content: center;
          }

          .footer-group-link {
            width: 100%;
          }

          .footer-logo {
            width: 84px;
          }
        }
      }

      .app-layout.sidebar-collapsed .main-content {
        margin-left: 88px;
      }

      @media (max-width: 768px) {
        .app-layout.sidebar-collapsed .main-content {
          margin-left: 0;
        }
      }

      .overlay {
        display: none;

        @media (max-width: 768px) {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 150;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;

          &.visible {
            opacity: 1;
            pointer-events: all;
          }
        }
      }
    `,
  ],
})
export class AppShellComponent {
  layoutState = inject(LayoutStateService);
  currentYear = new Date().getFullYear();

  overlayVisible = computed(
    () => this.layoutState.leftDrawerOpen() || this.layoutState.rightDrawerOpen(),
  );
}
