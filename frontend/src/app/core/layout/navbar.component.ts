import { Component, signal, effect, OnInit, Inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <img [src]="logoSrc()" alt="Logo da Empresa" class="logo-img">
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"
            />
          </svg>
          } @else {
          <!-- Moon Icon -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          }
        </button>

        <!-- Profile -->
        <div class="navbar-profile">
          <div class="profile-trigger" (click)="toggleDropdown()">
            <div class="avatar">
              <span>{{ getInitials() }}</span>
            </div>
            <span class="company-name">{{ companyName() }}</span>
            <svg
              class="dropdown-icon"
              [class.rotated]="isDropdownOpen()"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              />
            </svg>
          </div>

          @if (isDropdownOpen()) {
          <div class="dropdown-menu">
            <button class="dropdown-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
              Perfil
            </button>
            <button class="dropdown-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fill-rule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clip-rule="evenodd"
                />
              </svg>
              Contrato
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clip-rule="evenodd"
                />
              </svg>
              Sair
            </button>
          </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        height: 64px;
        background: var(--navbar-bg);
        border-bottom: 1px solid var(--navbar-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        transition: background-color 0.3s ease, border-color 0.3s ease;
      }

      .navbar-brand {
        display: flex;
        align-items: center;
      }

      .logo-img {
        height: 90px;
        transition: content 0.3s ease;
      }

      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
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
        gap: 0.75rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: background 0.2s;

        &:hover {
          background: var(--profile-hover-bg);
        }
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 0.875rem;
      }

      .company-name {
        font-weight: 500;
        color: var(--text-primary);
      }

      .dropdown-icon {
        transition: transform 0.2s;
        color: var(--text-secondary);

        &.rotated {
          transform: rotate(180deg);
        }
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: var(--dropdown-bg);
        border: 1px solid var(--dropdown-border);
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        min-width: 200px;
        padding: 0.5rem;
        animation: slideDown 0.2s ease-out;
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
        gap: 0.75rem;
        padding: 0.75rem;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--text-primary);
        transition: background 0.2s;

        &:hover {
          background: var(--dropdown-item-hover);
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
        background: var(--dropdown-divider);
        margin: 0.5rem 0;
      }

      @media (max-width: 768px) {
        .navbar {
          padding: 0 1rem;
        }

        .company-name {
          display: none;
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  companyName = signal('Empresa Interceptor');
  isDropdownOpen = signal(false);
  isDarkMode = signal(false);

  logoSrc = computed(() =>
    this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png'
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Effect to apply theme changes
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

  getInitials(): string {
    return this.companyName()
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
