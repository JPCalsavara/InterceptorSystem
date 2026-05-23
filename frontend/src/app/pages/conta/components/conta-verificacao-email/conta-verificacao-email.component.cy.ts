import { ContaVerificacaoEmailComponent } from './conta-verificacao-email.component';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ContaVerificacaoEmailComponent', () => {
  const mockAuthService = {
    isEmailVerificado: signal(false),
    reenviarVerificacaoEmail: () => of({})
  };

  const providers = [
    provideHttpClient(),
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: exibe email não verificado e permite reenviar', () => {
    cy.mount(ContaVerificacaoEmailComponent, { providers }).then((fixture) => {
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
    cy.mount(ContaVerificacaoEmailComponent, { providers });

    cy.get('.badge-success').should('contain', 'verificado');
    cy.get('[data-cy="conta-reenviar-verificacao"]').should('not.exist');
  });

  it('Mobile: responsividade do card', () => {
    cy.viewport(320, 568);
    cy.mount(ContaVerificacaoEmailComponent, { providers });
    cy.get('.card').should('have.css', 'width').and('not.eq', '0px');
  });
});
