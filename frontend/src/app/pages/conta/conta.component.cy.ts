import { ContaComponent } from './conta.component';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

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

  it('Deve montar o componente pai sem quebrar', () => {
    cy.mount(ContaComponent, { providers });
    cy.get('h1').should('contain', 'Minha Conta');
    cy.get('app-conta-verificacao-email').should('exist');
    cy.get('app-conta-alterar-email').should('exist');
    cy.get('app-conta-alterar-senha').should('exist');
  });
});
