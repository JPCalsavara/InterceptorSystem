import { EsqueciSenhaComponent } from './esqueci-senha.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('EsqueciSenhaComponent', () => {
  const mockAuthService = {
    solicitarResetSenha: () => of({}),
  };

  const providers = [
    provideRouter([]),
    provideHttpClient(),
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: renderiza corretamente', () => {
    cy.mount(EsqueciSenhaComponent, { providers });
    cy.get('.auth-title').should('contain', 'Esqueci minha senha');
    cy.get('[data-cy="esqueci-email"]').should('be.visible');
  });

  it('Desktop: valida formato do email', () => {
    cy.mount(EsqueciSenhaComponent, { providers });
    cy.get('[data-cy="esqueci-email"]').type('invalido');
    cy.get('[data-cy="esqueci-submit"]').click();
    cy.get('.field-error').should('contain', 'E-mail inválido');
  });

  it('Desktop: solicita redefinição de senha com sucesso', () => {
    cy.mount(EsqueciSenhaComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component['authService'], 'solicitarResetSenha').as('solicitarSpy');
    });
    cy.get('[data-cy="esqueci-email"]').type('email@teste.com');
    cy.get('[data-cy="esqueci-submit"]').click();
    cy.get('@solicitarSpy').should('have.been.calledWith', 'email@teste.com');
    cy.get('.success-box').should('contain', 'Se o e-mail estiver cadastrado');
  });

  it('Mobile: ajusta layout', () => {
    cy.viewport(320, 568);
    cy.mount(EsqueciSenhaComponent, { providers });
    cy.get('.auth-card').should('have.css', 'width').and('not.eq', '0px');
  });
});
