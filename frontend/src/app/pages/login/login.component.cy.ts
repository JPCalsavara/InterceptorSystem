import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

const mountLogin = () => {
  const authServiceStub = {
    login: cy.stub().as('loginStub').returns(of({})),
  };
  const routerStub = {
    navigate: cy.stub().as('navigate'),
    createUrlTree: cy.stub().returns({}),
    serializeUrl: cy.stub().returns(''),
    events: of(),
    url: '/',
  };
  const activatedRouteStub = {
    snapshot: { 
      paramMap: { get: () => null }, 
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      data: {},
      outlet: 'primary',
      component: null,
    },
    params: of({}),
    queryParams: of({}),
    url: of([]),
    fragment: of(null),
    data: of({}),
    outlet: 'primary',
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    root: null,
  };

  return cy.mount(LoginComponent, {
    imports: [HttpClientTestingModule, RouterLink],
    providers: [
      { provide: AuthService, useValue: authServiceStub },
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: activatedRouteStub },
    ],
  });
};

describe('LoginComponent - Cypress Component Test', () => {
  it('Desktop (1024px): O card deve ter largura maxima de 420px e estar centralizado', () => {
    cy.viewport(1024, 768);
    mountLogin();

    cy.get('.auth-card').should('exist');
    cy.get('.auth-card').invoke('outerWidth').should('be.lte', 420);
  });

  it('Mobile (320px): O card deve ocupar quase toda a largura da tela', () => {
    cy.viewport(320, 568);
    mountLogin();

    cy.get('.auth-card').should('exist');
    cy.get('.auth-card').invoke('outerWidth').should('be.gte', 260);
  });

  it('Deve exibir o formulario com campos de email e senha', () => {
    cy.viewport(1024, 768);
    mountLogin();

    cy.get('[data-cy="login-email"]').should('exist');
    cy.get('[data-cy="login-password"]').should('exist');
    cy.get('[data-cy="login-submit"]').should('exist');
  });

  it('Deve mostrar erro de validacao ao submeter com campos vazios', () => {
    cy.viewport(1024, 768);
    mountLogin();

    cy.get('[data-cy="login-submit"]').click();

    cy.get('.field-error').should('have.length.gte', 1);
    cy.get('.field-error').first().should('contain', 'obrigatório');
  });

  it('Deve mostrar erro de email invalido ao digitar email malformado', () => {
    cy.viewport(1024, 768);
    mountLogin();

    cy.get('[data-cy="login-email"]').type('emailinvalido').blur();
    cy.get('.field-error').should('contain', 'E-mail inválido');
  });

  it('Deve alternar visibilidade da senha ao clicar no botao de toggle', () => {
    cy.viewport(1024, 768);
    mountLogin();

    cy.get('[data-cy="login-password"]').should('have.attr', 'type', 'password');
    cy.get('.toggle-senha').click();
    cy.get('[data-cy="login-password"]').should('have.attr', 'type', 'text');
  });

  it('Mobile (375px): O botao de submit deve ocupar a largura disponivel do card', () => {
    cy.viewport(375, 667);
    mountLogin();

    cy.get('.auth-card').invoke('innerWidth').then((cardWidth) => {
      cy.get('[data-cy="login-submit"]').invoke('outerWidth').should('be.gte', (cardWidth as number) * 0.7);
    });
  });
});
