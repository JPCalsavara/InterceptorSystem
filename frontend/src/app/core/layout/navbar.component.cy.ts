import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LayoutStateService } from '../services/layout-state.service';

const mockAuthService = {
  currentUser: () => ({ nomeEmpresa: 'Test Corp' }),
  logout: () => {}
};

describe('NavbarComponent', () => {
  const providers = [
    provideRouter([]),
    { provide: AuthService, useValue: mockAuthService },
    LayoutStateService
  ];

  it('Desktop: renderiza corretamente e exibe as iniciais da empresa', () => {
    cy.viewport(1280, 720);
    cy.mount(NavbarComponent, { providers });

    cy.get('[data-cy="navbar-logo"]').should('be.visible');
    cy.get('[data-cy="user-menu-desktop"]').should('be.visible').and('contain.text', 'TC');
  });

  it('Desktop: deve abrir e fechar dropdown do perfil', () => {
    cy.viewport(1280, 720);
    cy.spy(mockAuthService, 'logout').as('logoutSpy');
    cy.mount(NavbarComponent, { providers });

    cy.get('[data-cy="dropdown-menu"]').should('not.exist');
    cy.get('[data-cy="user-menu-desktop"]').click();
    cy.get('[data-cy="dropdown-menu"]').should('be.visible');
    
    cy.get('[data-cy="logout-btn"]').click();
    cy.get('@logoutSpy').should('have.been.called');
  });

  it('Mobile: deve exibir trigger mobile e abrir drawer da direita', () => {
    cy.viewport(375, 812);
    cy.mount(NavbarComponent, { providers });

    cy.get('[data-cy="user-menu-desktop"]').should('not.be.visible');
    cy.get('[data-cy="user-menu-mobile"]').should('be.visible').click();

    cy.get('[data-cy="profile-drawer"]').should('have.class', 'open');
    cy.get('[data-cy="drawer-close"]').click();
    cy.get('[data-cy="profile-drawer"]').should('not.have.class', 'open');
  });

  it('deve alternar modo escuro', () => {
    cy.window().then((win) => win.localStorage.setItem('theme', 'light'));
    cy.mount(NavbarComponent, { providers }).then((fixture) => {
      fixture.component.isDarkMode.set(false);
      fixture.fixture.detectChanges();
    });
    cy.get('[data-cy="theme-toggle"]').click();
    cy.window().its('localStorage').invoke('getItem', 'theme').should('eq', 'dark');
  });
});
