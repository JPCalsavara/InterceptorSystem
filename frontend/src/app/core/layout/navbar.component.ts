import {
  Component,
  signal,
  effect,
  OnInit,
  Inject,
  PLATFORM_ID,
  computed,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LayoutStateService } from '../services/layout-state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-left">
        <!-- Sidebar toggle: mobile opens drawer, desktop collapses sidebar -->
        <button
          class="menu-toggle"
          (click)="handleSidebarToggle()"
          [attr.aria-label]="
            isMobileView()
              ? layoutState.leftDrawerOpen()
                ? 'Fechar menu lateral'
                : 'Abrir menu lateral'
              : layoutState.sidebarCollapsed()
                ? 'Expandir sidebar'
                : 'Colapsar sidebar'
          "
        >
          @if (isMobileView() && layoutState.leftDrawerOpen()) {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          }
        </button>

        <div class="navbar-brand">
          <img [src]="logoSrc()" alt="Logo da Empresa" class="logo-img" />
        </div>
      </div>

      <div class="navbar-actions">
        <!-- Dark Mode Toggle -->
        <button
          class="theme-toggle"
          (click)="toggleTheme()"
          [attr.aria-label]="isDarkMode() ? 'Ativar modo claro' : 'Ativar modo escuro'"
          [title]="isDarkMode() ? 'Ativar modo claro' : 'Ativar modo escuro'"
        >
          @if (isDarkMode()) {
            <!-- Sun Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          } @else {
            <!-- Moon Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          }
        </button>

        <!-- Profile -->
        <div class="navbar-profile">
          <!-- Desktop trigger: opens dropdown -->
          <div class="profile-trigger desktop-trigger" (click)="toggleDropdown()" data-testid="user-menu-button">
            <div class="avatar">
              <span>{{ getInitials() }}</span>
            </div>
            <span class="company-name">{{ companyName() }}</span>
            <svg
              class="dropdown-icon"
              [class.rotated]="isDropdownOpen()"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>

          <!-- Mobile trigger: opens right drawer -->
          <div class="profile-trigger mobile-trigger" (click)="toggleRightDrawer()">
            <div class="avatar">
              <span>{{ getInitials() }}</span>
            </div>
          </div>

          <!-- Desktop dropdown -->
          @if (isDropdownOpen()) {
            <div class="dropdown-menu">
              <a routerLink="/perfil" class="dropdown-item" (click)="isDropdownOpen.set(false)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                Perfil
              </a>
              <a routerLink="/conta" class="dropdown-item" (click)="isDropdownOpen.set(false)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Minha Conta
              </a>
              <a routerLink="/plano" class="dropdown-item" (click)="isDropdownOpen.set(false)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Plano
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" (click)="logout()" data-testid="logout-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Sair
              </button>
            </div>
          }
        </div>
      </div>
    </nav>

    <!-- Right profile drawer: mobile only -->
    <div class="profile-drawer" [class.open]="layoutState.rightDrawerOpen()">
      <div class="profile-drawer-header">
        <div class="profile-drawer-user">
          <div class="avatar avatar-lg">
            <span>{{ getInitials() }}</span>
          </div>
          <span class="company-name-drawer">{{ companyName() }}</span>
        </div>
        <button
          class="drawer-close"
          (click)="layoutState.rightDrawerOpen.set(false)"
          aria-label="Fechar perfil"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="profile-drawer-nav">
        <a
          routerLink="/perfil"
          class="drawer-item"
          (click)="layoutState.rightDrawerOpen.set(false)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          Perfil
        </a>
        <a routerLink="/conta" class="drawer-item" (click)="layoutState.rightDrawerOpen.set(false)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Minha Conta
        </a>
        <a routerLink="/plano" class="drawer-item" (click)="layoutState.rightDrawerOpen.set(false)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Plano
        </a>
        <div class="drawer-divider"></div>
        <button class="drawer-item danger" (click)="logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          Sair
        </button>
      </nav>
    </div>
  `,
  styles: [
    `
      .navbar {
        height: 64px;
        background: var(--surface-card);
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--space-8);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        transition:
          background-color 0.3s ease,
          border-color 0.3s ease;
      }

      .navbar-left {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .menu-toggle {
        display: flex;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        border: none;
        background: transparent;
        color: var(--text-secondary);
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;

        &:hover {
          background: var(--surface-muted);
        }

        svg {
          width: 22px;
          height: 22px;
        }
      }

      .navbar-brand {
        display: flex;
        align-items: center;
      }

      .logo-img {
        height: 100px;
        transition: content 0.3s ease;
      }

      .navbar-actions {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }

      .theme-toggle {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        border: none;
        background: transparent;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--surface-muted);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .navbar-profile {
        position: relative;
      }

      .profile-trigger {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        cursor: pointer;
        padding: var(--space-2);
        border-radius: var(--radius-md);
        transition: background 0.2s;

        &:hover {
          background: var(--surface-muted);
        }
      }

      .mobile-trigger {
        display: none;
      }

      .avatar {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: var(--fw-semibold);
        font-size: var(--text-sm);
      }

      .company-name {
        font-weight: var(--fw-medium);
        color: var(--text-primary);
      }

      .dropdown-icon {
        transition: transform 0.2s;
        color: var(--text-secondary);
        width: 18px;
        height: 18px;

        &.rotated {
          transform: rotate(180deg);
        }
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + var(--space-2));
        right: 0;
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        min-width: 200px;
        padding: var(--space-2);
        animation: slideDown 0.2s ease-out;
        z-index: 110;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .dropdown-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        border: none;
        background: transparent;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: var(--text-sm);
        color: var(--text-primary);
        transition: background 0.2s;
        text-decoration: none;

        &:hover {
          background: var(--bg-tertiary);
        }

        &.danger {
          color: #dc2626;

          &:hover {
            background: #fee2e2;
          }
        }

        svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
      }

      .dropdown-divider {
        height: 1px;
        background: var(--border-subtle);
        margin: var(--space-2) 0;
      }

      /* ── Right Profile Drawer ── */
      .profile-drawer {
        display: none;
        position: fixed;
        top: 64px;
        right: 0;
        width: 280px;
        height: calc(100vh - 64px);
        background: var(--surface-card);
        border-left: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-lg);
        z-index: 200;
        transform: translateX(100%);
        transition:
          transform 0.3s ease,
          background-color 0.3s ease,
          border-color 0.3s ease;
        overflow-y: auto;
        flex-direction: column;
      }

      .profile-drawer.open {
        transform: translateX(0);
      }

      .profile-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-6) var(--space-4) var(--space-4);
        border-bottom: 1px solid var(--border-subtle);
      }

      .profile-drawer-user {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .avatar-lg {
        width: 48px;
        height: 48px;
        font-size: var(--text-base);
      }

      .company-name-drawer {
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        font-size: var(--text-sm);
      }

      .drawer-close {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        border: none;
        background: transparent;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: var(--surface-muted);
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .profile-drawer-nav {
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      .drawer-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        border: none;
        background: transparent;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-primary);
        transition: background 0.2s;
        text-decoration: none;

        &:hover {
          background: var(--bg-tertiary);
          color: var(--primary-color);
        }

        &.danger {
          color: #dc2626;

          &:hover {
            background: #fee2e2;
          }
        }

        svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
      }

      .drawer-divider {
        height: 1px;
        background: var(--border-subtle);
        margin: var(--space-2) 0;
      }

      /* ── Mobile overrides ── */
      @media (max-width: 768px) {
        .navbar {
          padding: 0 var(--space-4);
        }

        .desktop-trigger {
          display: none;
        }

        .mobile-trigger {
          display: flex;
        }

        .profile-drawer {
          display: flex;
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  layoutState = inject(LayoutStateService);

  companyName = computed(() => this.authService.currentUser()?.nomeEmpresa ?? 'Minha Empresa');
  isDropdownOpen = signal(false);
  isDarkMode = signal(false);

  logoSrc = computed(() => (this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png'));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  ngOnInit(): void {
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode.set(prefersDark);
  }

  private setupSystemThemeListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDarkMode.set(e.matches);
      }
    });
  }

  private applyTheme(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.isDarkMode.update((v) => !v);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  toggleLeftDrawer(): void {
    this.layoutState.leftDrawerOpen.update((v) => !v);
  }

  handleSidebarToggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.layoutState.toggleSidebarCollapsed();
      return;
    }

    const mobileViewport = window.matchMedia('(max-width: 768px)').matches;
    if (mobileViewport) {
      this.toggleLeftDrawer();
      return;
    }

    this.layoutState.toggleSidebarCollapsed();
  }

  isMobileView(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return window.matchMedia('(max-width: 768px)').matches;
  }

  toggleRightDrawer(): void {
    this.layoutState.rightDrawerOpen.update((v) => !v);
  }

  logout(): void {
    this.layoutState.closeAll();
    this.authService.logout();
  }

  getInitials(): string {
    return this.companyName()
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
