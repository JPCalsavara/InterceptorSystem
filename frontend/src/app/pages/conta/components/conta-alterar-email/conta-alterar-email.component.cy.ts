import { ContaAlterarEmailComponent } from './conta-alterar-email.component';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ContaAlterarEmailComponent', () => {
  const mockAuthService = {
    currentUser: signal({ email: 'teste@empresa.com' }),
    solicitarAlteracaoEmail: () => of({})
  };

  const providers = [
    provideHttpClient(),
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: permite solicitar alteração de e-mail', () => {
    cy.mount(ContaAlterarEmailComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component.authService, 'solicitarAlteracaoEmail').as('alterarSpy');
    });

    cy.get('.section-desc').should('contain', 'teste@empresa.com');
    cy.get('[data-cy="conta-novo-email"]').type('novo@teste.com');
    cy.get('[data-cy="conta-email-submit"]').click();
    
    cy.get('@alterarSpy').should('have.been.calledWith', 'novo@teste.com');
    cy.get('.success-msg').should('contain', 'novo@teste.com');
  });

  it('Mobile: responsividade do card', () => {
    cy.viewport(320, 568);
    cy.mount(ContaAlterarEmailComponent, { providers });
    cy.get('.card').should('have.css', 'width').and('not.eq', '0px');
    cy.get('.btn-primary').should('have.css', 'width').and('not.eq', '0px');
  });
});
