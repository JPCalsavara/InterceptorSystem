import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="nav">
        @for (item of navItems; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.route === '/' }"
          class="nav-item"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </a>
        }
      </nav>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: 260px;
        height: calc(100vh - 64px);
        background: white;
        border-right: 1px solid #e5e7eb;
        position: fixed;
        top: 64px;
        left: 0;
        overflow-y: auto;
        padding: 1.5rem 1rem;
      }

      .nav {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        text-decoration: none;
        color: #6b7280;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
          background: #f3f4f6;
          color: #374151;
        }

        &.active {
          background: linear-gradient(135deg, #2196f3 0%, #9c27b0 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(33, 150, 243, 0.3);
        }
      }

      .icon {
        font-size: 1.5rem;
        line-height: 1;
        flex-shrink: 0;
      }

      .label {
        font-size: 0.9375rem;
      }

      /* Scrollbar customization */
      .sidebar::-webkit-scrollbar {
        width: 6px;
      }

      .sidebar::-webkit-scrollbar-track {
        background: transparent;
      }

      .sidebar::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      .sidebar::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 80px;
          padding: 1rem 0.5rem;
        }

        .label {
          display: none;
        }

        .nav-item {
          justify-content: center;
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Resumo', route: '/', icon: '📊' },
    { label: 'Condomínios', route: '/condominios', icon: '🏢' },
    { label: 'Contratos', route: '/contratos', icon: '📄' },
    { label: 'Funcionários', route: '/funcionarios', icon: '👥' },
    { label: 'Postos de Trabalho', route: '/postos', icon: '📍' },
    { label: 'Alocações', route: '/alocacoes', icon: '📅' },
  ];
}
