import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';
import { EmailVerificationBannerComponent } from '../../shared/components/email-verification-banner/email-verification-banner.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, EmailVerificationBannerComponent],
  template: `
    <app-navbar />
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
      }

      .main-content {
        flex: 1;
        margin-left: 260px;
        padding: 2rem;
        min-height: calc(100vh - 64px);
        background: var(--bg-primary);

        @media (max-width: 768px) {
          margin-left: 80px;
          padding: 1rem;
        }
      }
    `,
  ],
})
export class AppShellComponent {}
