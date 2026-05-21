import { LandingComponent } from './landing.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('LandingComponent', () => {
  const providers = [
    provideRouter([]),
    provideHttpClient()
  ];

  it('Desktop: renderiza a hero section e features', () => {
    cy.mount(LandingComponent, { providers });
    cy.get('.hero-title').should('contain', 'Assessoria');
    cy.get('.features-grid').should('exist');
    cy.get('.feature-card').should('have.length.at.least', 6);
  });

  it('Desktop: navegação smooth scroll', () => {
    cy.mount(LandingComponent, { providers });
    cy.get('.header-nav .nav-link').contains('Sobre').should('have.attr', 'href', '#sobre');
    cy.get('#sobre').should('exist');
  });

  it('Desktop: alterna modo escuro no clique do theme toggle', () => {
    cy.window().then((win) => win.localStorage.setItem('theme', 'light'));
    cy.mount(LandingComponent, { providers }).then((fixture) => {
      fixture.component.isDarkMode.set(false);
      fixture.fixture.detectChanges();
    });
    cy.get('[data-cy="landing-theme-toggle"]').click();
    cy.window().its('localStorage').invoke('getItem', 'theme').should('eq', 'dark');
  });

  it('Mobile: abre e fecha overlay de navegação mobile', () => {
    cy.viewport(320, 568);
    cy.mount(LandingComponent, { providers });
    cy.get('.mobile-menu-overlay').should('not.exist');
    cy.get('[data-cy="landing-mobile-menu"]').click();
    cy.get('.mobile-menu-overlay').should('exist');
    cy.get('[data-cy="landing-login-mobile"]').should('be.visible');
    // Clica no botão de fechar (ou link mobile que tenha toggleMobileMenu)
    cy.get('[data-cy="landing-mobile-menu"]').click();
    cy.get('.mobile-menu-overlay').should('not.exist');
  });
});
