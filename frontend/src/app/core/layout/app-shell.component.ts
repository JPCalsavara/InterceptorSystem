import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';
import { EmailVerificationBannerComponent } from '../../shared/components/email-verification-banner/email-verification-banner.component';
import { LayoutStateService } from '../services/layout-state.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, EmailVerificationBannerComponent],
  template: `
    <app-navbar />
    <div class="overlay" [class.visible]="overlayVisible()" (click)="layoutState.closeAll()"></div>
    <div class="app-layout">
      <app-sidebar />
      <main class="main-content">
        <div class="main-content-inner">
          <app-email-verification-banner />
          <div class="page-router-slot">
            <router-outlet />
          </div>

          <footer class="system-footer">
            <div class="footer-brand">Interceptor System</div>
            <div class="footer-meta">
              Gestao interna de clientes, postos, alocacoes e cronogramas.
            </div>
            <div class="footer-copy">{{ currentYear }} Interceptor. Ambiente interno.</div>
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

        /* Remove banner margin for pages that handle their own spacing */
        &:has(app-contrato-list, app-posto-list, app-alocacao-list) {
          app-email-verification-banner {
            margin-bottom: 0;
          }
        }
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
          padding: var(--space-4) 0 0;
          border-top: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: grid;
          gap: var(--space-2);
          font-size: var(--text-sm);
        }

        .footer-brand {
          color: var(--text-primary);
          font-weight: var(--fw-semibold);
        }

        .footer-copy {
          font-size: var(--text-xs);
        }

        @media (max-width: 768px) {
          margin-left: 0;

          .main-content-inner {
            padding: var(--space-4) var(--space-3);
          }
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
