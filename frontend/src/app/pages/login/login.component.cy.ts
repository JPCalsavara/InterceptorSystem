import { LoginComponent } from './login.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { NgZone } from '@angular/core';

describe('LoginComponent', () => {
  const mockAuthService = {
    login: () => of({}),
    logout: () => {},
  };

  const providers = [
    provideRouter([{ path: 'dashboard', children: [] }]),
    provideHttpClient(),
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: renderiza corretamente', () => {
    cy.mount(LoginComponent, { providers });
    cy.get('.auth-title').should('contain', 'Entrar na sua conta');
    cy.get('[data-testid="login-email"]').should('be.visible');
    cy.get('[data-testid="login-password"]').should('be.visible');
  });

  it('Desktop: deve exibir erros ao submeter formulário vazio', () => {
    cy.mount(LoginComponent, { providers });
    cy.get('[data-testid="login-submit"]').click();
    cy.get('.field-error').should('have.length', 2); // E-mail e Senha required
    cy.get('.field-error').first().should('contain', 'obrigatório');
  });

  it('Desktop: deve validar formato de e-mail', () => {
    cy.mount(LoginComponent, { providers });
    cy.get('[data-testid="login-email"]').type('email-invalido');
    cy.get('[data-testid="login-password"]').type('123456');
    cy.get('[data-testid="login-submit"]').click();
    cy.get('.field-error').should('contain', 'E-mail inválido');
  });

  it('Desktop: deve tentar login com sucesso', () => {
    cy.mount(LoginComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component['authService'], 'login').as('loginSpy');
    });
    cy.get('[data-testid="login-email"]').type('contato@empresa.com');
    cy.get('[data-testid="login-password"]').type('SenhaSegura123!');
    cy.get('[data-testid="login-submit"]').click();
    cy.get('@loginSpy').should('have.been.calledWith', {
      email: 'contato@empresa.com',
      senha: 'SenhaSegura123!'
    });
  });

  it('Mobile: renderiza de forma responsiva', () => {
    cy.viewport(320, 568); // iPhone SE
    cy.mount(LoginComponent, { providers });
    cy.get('.auth-card').should('have.css', 'width').and('not.eq', '0px');
    cy.get('[data-testid="login-submit"]').should('have.css', 'width').and('not.eq', '0px');
  });
});
