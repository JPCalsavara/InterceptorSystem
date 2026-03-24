import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import { StatusContrato, StatusDiaria, StatusFuncionario } from '../../models/index';
import { LayoutStateService } from '../services/layout-state.service';
import { AlocacaoService } from '../../services/alocacao.service';
import { TagService } from '../../services/tag.service';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  countKey?: 'clientes' | 'funcionarios' | 'postos' | 'alocacoes' | 'diarias' | 'contratos' | 'tags';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="sidebar"
      [class.open]="layoutState.leftDrawerOpen()"
      [class.collapsed]="layoutState.sidebarCollapsed()"
    >
      <nav class="nav">
        <div class="nav-main">
          @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="nav-item"
            [attr.title]="layoutState.sidebarCollapsed() ? item.label : null"
            (click)="layoutState.leftDrawerOpen.set(false)"
          >
            <span class="icon">
              @switch (item.icon) {
                @case ('chart-bar') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                    />
                  </svg>
                }
                @case ('building-office') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                    />
                  </svg>
                }
                @case ('document-text') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                }
                @case ('user-group') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                }
                @case ('map-pin') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                }
                @case ('calendar-days') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                    />
                  </svg>
                }
                @case ('clock') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                }
                @case ('tag') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                  </svg>
                }
              }
            </span>

            <span class="label">{{ item.label }}</span>
            @if (item.countKey && counts()[item.countKey] !== null) {
              <span class="nav-badge">{{ counts()[item.countKey] }}</span>
            }
          </a>
        }
      </div>

      <div class="nav-footer">
        <!-- Meu Perfil -->
        <a routerLink="/perfil" routerLinkActive="active" class="nav-item" [attr.title]="layoutState.sidebarCollapsed() ? 'Meu Perfil' : null" (click)="layoutState.leftDrawerOpen.set(false)">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </span>
          <span class="label">Meu Perfil</span>
        </a>

        <!-- Sair -->
        <button type="button" class="nav-item btn-logout" (click)="logout()" [attr.title]="layoutState.sidebarCollapsed() ? 'Sair' : null">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </span>
          <span class="label">Sair</span>
        </button>

        <div class="nav-divider"></div>


        <button
          type="button"
          class="collapse-toggle"
          (click)="layoutState.toggleSidebarCollapsed()"
          [attr.aria-label]="
            layoutState.sidebarCollapsed() ? 'Expandir menu lateral' : 'Colapsar menu lateral'
          "
          [attr.title]="
            layoutState.sidebarCollapsed() ? 'Expandir menu lateral' : 'Colapsar menu lateral'
          "
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            @if (layoutState.sidebarCollapsed()) {
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" />
            }
          </svg>
        </button>
      </div>
      </nav>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: 260px;
        height: calc(100vh - 64px);
        background: var(--surface-card);
        border-right: 1px solid var(--border-subtle);
        position: fixed;
        top: 64px;
        left: 0;
        overflow-y: auto;
        padding: var(--space-6) var(--space-4);
        transition:
          width 0.25s ease,
          background-color 0.3s ease,
          border-color 0.3s ease;
      }

      .sidebar.collapsed {
        width: 88px;
      }

      .nav {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .nav-main {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        flex: 1;
      }

      .nav-footer {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin-top: auto;
      }

      .btn-logout {
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        font-size: var(--text-sm);
      }

      .btn-logout:hover {
        background: #fee2e2 !important;
        color: #dc2626 !important;
      }

      .nav-divider {
        height: 1px;
        background: var(--border-subtle);
        margin: var(--space-2) 0;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-md);
        text-decoration: none;
        color: var(--text-secondary);
        font-weight: var(--fw-medium);
        transition: all 0.2s;

        &:hover {
          background: var(--bg-tertiary);
          color: var(--primary-color);
        }

        &.active {
          background: var(--bg-secondary);
          color: var(--primary-color);
          font-weight: var(--fw-semibold);
        }
      }

      .sidebar.collapsed .nav-item {
        justify-content: center;
        padding: var(--space-3);
      }

      .icon {
        font-size: 1.5rem;
        line-height: 1;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        svg {
          width: 100%;
          height: 100%;
        }
      }

      .label {
        font-size: var(--text-sm);
      }

      .sidebar.collapsed .label,
      .sidebar.collapsed .nav-badge {
        display: none;
      }

      .nav-badge {
        margin-left: auto;
        background: var(--bg-tertiary);
        color: var(--primary-dark);
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.15rem 0.6rem;
        border-radius: 9999px;
      }

      .nav-item.active .nav-badge {
        background: var(--surface-card);
        color: var(--primary-color);
      }

      .collapse-toggle {
        margin-top: auto;
        width: 100%;
        height: 40px;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
          background: var(--bg-tertiary);
          color: var(--primary-color);
          border-color: var(--primary-color);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      .sidebar.collapsed .collapse-toggle {
        width: 48px;
        align-self: center;
      }

      /* Scrollbar customization */
      .sidebar::-webkit-scrollbar {
        width: 6px;
      }

      .sidebar::-webkit-scrollbar-track {
        background: transparent;
      }

      .sidebar::-webkit-scrollbar-thumb {
        background: var(--border-strong);
        border-radius: var(--radius-sm);
      }

      .sidebar::-webkit-scrollbar-thumb:hover {
        background: var(--primary-color);
      }

      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
          transition:
            transform 0.3s ease,
            background-color 0.3s ease,
            border-color 0.3s ease;
          z-index: 200;
          width: 260px;
          padding: var(--space-6) var(--space-4);
        }

        .sidebar.collapsed {
          width: 260px;
        }

        /* On mobile, always present full drawer content, even if desktop
           collapsed state is persisted in localStorage. */
        .sidebar.collapsed .label {
          display: flex;
        }

        .sidebar.collapsed .nav-badge {
          display: inline-flex;
        }

        .sidebar.collapsed .nav-item {
          justify-content: flex-start;
          padding: var(--space-3) var(--space-4);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .label {
          display: flex;
        }

        .nav-badge {
          display: inline-flex;
        }

        .nav-item {
          justify-content: flex-start;
          padding: var(--space-3) var(--space-4);
        }

        .collapse-toggle {
          display: none;
        }
      }
    `,
  ],
})
export class SidebarComponent implements OnInit {
  layoutState = inject(LayoutStateService);
  private authService = inject(AuthService);
  private clienteService = inject(ClienteService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private diariaService = inject(DiariaService);
  private contratoService = inject(ContratoService);
  private alocacaoService = inject(AlocacaoService);
  private tagService = inject(TagService);

  counts = signal<Record<string, number | null>>({
    clientes: null,
    funcionarios: null,
    postos: null,
    alocacoes: null,
    diarias: null,
    contratos: null,
    tags: null,
  });

  navItems: NavItem[] = [
    { label: 'Resumo', route: '/dashboard', icon: 'chart-bar' },
    { label: 'Clientes', route: '/clientes', icon: 'building-office', countKey: 'clientes' },
    { label: 'Contratos', route: '/contratos', icon: 'document-text', countKey: 'contratos' },
    { label: 'Funcionários', route: '/funcionarios', icon: 'user-group', countKey: 'funcionarios' },
    { label: 'Postos', route: '/postos', icon: 'map-pin', countKey: 'postos' },
    { label: 'Alocações', route: '/alocacoes', icon: 'clock', countKey: 'alocacoes' },
    { label: 'Tags', route: '/tags', icon: 'tag', countKey: 'tags' },
    { label: 'Diárias', route: '/diarias', icon: 'calendar-days', countKey: 'diarias' },
  ];

  ngOnInit() {
    this.clienteService.getAll().subscribe({
      next: (data) =>
        this.counts.update((c) => ({ ...c, clientes: data.filter((x: any) => x.ativo).length })),
    });
    this.funcionarioService.getAll().subscribe({
      next: (data) =>
        this.counts.update((c) => ({
          ...c,
          funcionarios: data.filter((x: any) => x.statusFuncionario === StatusFuncionario.ATIVO)
            .length,
        })),
    });
    this.postoService.getAll().subscribe({
      next: (data) => this.counts.update((c) => ({ ...c, postos: data.length })),
    });
    this.alocacaoService.getAll().subscribe({
      next: (data) => this.counts.update((c) => ({ ...c, alocacoes: data.length })),
    });
    this.diariaService.getAll().subscribe({
      next: (data) =>
        this.counts.update((c) => ({
          ...c,
          diarias: data.filter((x: any) => x.statusDiaria === StatusDiaria.CONFIRMADA).length,
        })),
    });
    this.contratoService.getAll().subscribe({
      next: (data) =>
        this.counts.update((c) => ({
          ...c,
          contratos: data.filter((x: any) => x.status === StatusContrato.ATIVO).length,
        })),
    });
    this.tagService.getAll().subscribe({
      next: (data) => this.counts.update((c) => ({ ...c, tags: data.length })),
    });
  }

  logout() {
    this.layoutState.closeAll();
    this.authService.logout();
  }
}
