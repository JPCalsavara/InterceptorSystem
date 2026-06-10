import { AppShellComponent } from './app-shell.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LayoutStateService } from '../services/layout-state.service';
import { of } from 'rxjs';

import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import { AlocacaoService } from '../../services/alocacao.service';
import { TagService } from '../../services/tag.service';

const mockAuthService = {
  currentUser: () => ({ nomeEmpresa: 'Test Corp' }),
  logout: () => {},
  isAuthenticated: () => true,
  isEmailVerificado: () => true,
  isAdmin: () => true
};

const mockService = { getAll: () => of([]) };

describe('AppShellComponent', () => {
  const providers = [
    provideRouter([]),
    { provide: AuthService, useValue: mockAuthService },
    { provide: ClienteService, useValue: mockService },
    { provide: FuncionarioService, useValue: mockService },
    { provide: PostoService, useValue: mockService },
    { provide: DiariaService, useValue: mockService },
    { provide: ContratoService, useValue: mockService },
    { provide: AlocacaoService, useValue: mockService },
    { provide: TagService, useValue: mockService },
    LayoutStateService
  ];

  it('Desktop: deve renderizar layout completo (Navbar e Sidebar)', () => {
    cy.viewport(1280, 720);
    cy.mount(AppShellComponent, { providers });

    cy.get('[data-cy="app-navbar"]').should('be.visible');
    cy.get('[data-cy="app-sidebar"]').should('be.visible');
    cy.get('[data-cy="main-content"]').should('be.visible');
    cy.get('[data-cy="system-footer"]').should('be.visible');
  });

  it('Desktop: deve colapsar sidebar ao clicar no botão da navbar', () => {
    cy.viewport(1280, 720);
    cy.mount(AppShellComponent, { providers });

    cy.get('[data-cy="app-layout"]').should('not.have.class', 'sidebar-collapsed');
    cy.get('[data-cy="menu-toggle"]').click();
    cy.get('[data-cy="app-layout"]').should('have.class', 'sidebar-collapsed');
  });

  it('Mobile: deve exibir overlay e abrir left drawer ao clicar no menu', () => {
    cy.viewport(375, 812);
    cy.mount(AppShellComponent, { providers });

    cy.get('[data-cy="sidebar"]').should('not.have.class', 'open');
    cy.get('[data-cy="layout-overlay"]').should('not.have.class', 'visible');

    cy.get('[data-cy="menu-toggle"]').click();

    cy.get('[data-cy="sidebar"]').should('have.class', 'open');
    cy.get('[data-cy="layout-overlay"]').should('have.class', 'visible');
    
    cy.get('[data-cy="layout-overlay"]').click({ force: true });
    cy.get('[data-cy="sidebar"]').should('not.have.class', 'open');
  });
});
