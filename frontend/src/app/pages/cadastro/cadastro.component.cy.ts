import { CadastroComponent } from './cadastro.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

const mountCadastro = () => {
  const authServiceStub = {
    registrar: cy.stub().as('registrarStub').returns(of({})),
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

  return cy.mount(CadastroComponent, {
    imports: [HttpClientTestingModule, NgxMaskDirective, RouterLink],
    providers: [
      { provide: AuthService, useValue: authServiceStub },
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: activatedRouteStub },
      provideNgxMask(),
    ],
  });
};

describe('CadastroComponent - Cypress Component Test', () => {
  it('Desktop (1024px): O card de registro deve ser exibido', () => {
    cy.viewport(1024, 768);
    mountCadastro();

    cy.get('.register-card').should('exist');
    cy.get('.hero').should('exist');
  });

  it('Mobile (768px): O layout deve exibir o card de registro', () => {
    cy.viewport(768, 1024);
    mountCadastro();

    cy.get('.register-card').should('exist');
  });

  it('Deve exibir todos os campos do formulario de cadastro', () => {
    cy.viewport(1024, 768);
    mountCadastro();

    cy.get('[data-cy="register-name"]').should('exist');
    cy.get('[data-cy="cnpj"]').should('exist');
    cy.get('[data-cy="register-email"]').should('exist');
    cy.get('[data-cy="register-password"]').should('exist');
    cy.get('[data-cy="register-submit"]').should('exist');
  });

  it('Deve mostrar erros de validacao ao submeter com campos vazios', () => {
    cy.viewport(1024, 768);
    mountCadastro();

    cy.get('[data-cy="register-termos"]').check({ force: true });
    cy.get('[data-cy="register-submit"]').click();

    cy.get('.field-error').should('have.length.gte', 1);
    cy.get('.field-error').first().should('contain', 'obrigatório');
  });

  it('Deve mostrar erro de email invalido', () => {
    cy.viewport(1024, 768);
    mountCadastro();

    cy.get('[data-cy="register-email"]').type('nao-e-email').blur();
    cy.get('.field-error').should('contain', 'E-mail inválido');
  });

  it('Deve mostrar erro de senha fraca (sem maiuscula ou numero)', () => {
    cy.viewport(1024, 768);
    mountCadastro();

    cy.get('[data-cy="register-password"]').type('senhafraca').blur();
    cy.get('.field-error').should('contain', 'pelo menos 8 caracteres');
  });

  it('Deve alternar visibilidade da senha ao clicar no toggle', () => {
    cy.viewport(1024, 768);
    mountCadastro();

    cy.get('[data-cy="register-password"]').should('have.attr', 'type', 'password');
    cy.get('.toggle-senha').click();
    cy.get('[data-cy="register-password"]').should('have.attr', 'type', 'text');
  });

  it('Mobile (320px): O card de registro deve ocupar a tela sem overflow', () => {
    cy.viewport(320, 568);
    mountCadastro();

    cy.get('.register-card').should('exist');
    cy.get('.register-card').invoke('outerWidth').should('be.lte', 320);
  });
});
