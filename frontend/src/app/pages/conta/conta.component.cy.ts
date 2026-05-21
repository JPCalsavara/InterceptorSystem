import { ContaComponent } from './conta.component';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ContaComponent', () => {
  const mockAuthService = {
    isEmailVerificado: signal(false),
    currentUser: signal({ email: 'teste@empresa.com' }),
    reenviarVerificacaoEmail: () => of({}),
    solicitarAlteracaoEmail: () => of({})
  };

  const providers = [
    provideHttpClient(),
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: exibe email não verificado e permite reenviar', () => {
    cy.mount(ContaComponent, { providers }).then((fixture) => {
      fixture.component.authService.isEmailVerificado = signal(false);
      cy.spy(fixture.component.authService, 'reenviarVerificacaoEmail').as('reenviarSpy');
    });

    cy.get('.badge-warning').should('contain', 'não verificado');
    cy.get('[data-cy="conta-reenviar-verificacao"]').click();
    cy.get('@reenviarSpy').should('have.been.called');
    cy.get('.feedback-msg').should('contain', 'Verifique sua caixa de entrada');
  });

  it('Desktop: exibe email verificado', () => {
    mockAuthService.isEmailVerificado.set(true);
    cy.mount(ContaComponent, { providers });

    cy.get('.badge-success').should('contain', 'verificado');
    cy.get('[data-cy="conta-reenviar-verificacao"]').should('not.exist');
  });

  it('Desktop: permite solicitar alteração de e-mail', () => {
    cy.mount(ContaComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component.authService, 'solicitarAlteracaoEmail').as('alterarSpy');
    });

    cy.get('.section-desc').should('contain', 'teste@empresa.com');
    cy.get('[data-cy="conta-novo-email"]').type('novo@teste.com');
    cy.get('[data-cy="conta-email-submit"]').click();
    
    cy.get('@alterarSpy').should('have.been.calledWith', 'novo@teste.com');
    cy.get('.success-msg').should('contain', 'novo@teste.com');
  });

  it('Mobile: responsividade dos cards', () => {
    cy.viewport(320, 568);
    cy.mount(ContaComponent, { providers });
    cy.get('.card').should('have.css', 'width').and('not.eq', '0px');
    cy.get('.btn-primary').should('have.css', 'width').and('not.eq', '0px');
  });
});
