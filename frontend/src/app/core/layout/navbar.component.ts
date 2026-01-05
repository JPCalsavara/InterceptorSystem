import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="logo">Interceptor</span>
      </div>

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
    </nav>
  `,
  styles: [
    `
      .navbar {
        height: 64px;
        background: white;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
      }

      .navbar-brand {
        display: flex;
        align-items: center;
      }

      .logo {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #2196f3 0%, #9c27b0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
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
          background: #f3f4f6;
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
        color: #374151;
      }

      .dropdown-icon {
        transition: transform 0.2s;
        color: #6b7280;

        &.rotated {
          transform: rotate(180deg);
        }
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
        color: #374151;
        transition: background 0.2s;

        &:hover {
          background: #f3f4f6;
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
        background: #e5e7eb;
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
export class NavbarComponent {
  companyName = signal('Empresa Interceptor');
  isDropdownOpen = signal(false);

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
