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
        <app-email-verification-banner />
        <router-outlet />
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
        padding: var(--space-8);
        min-height: calc(100vh - 64px);
        background: var(--bg-primary);

        @media (max-width: 768px) {
          margin-left: 0;
          padding: var(--space-4);
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
  overlayVisible = computed(
    () => this.layoutState.leftDrawerOpen() || this.layoutState.rightDrawerOpen(),
  );
}
