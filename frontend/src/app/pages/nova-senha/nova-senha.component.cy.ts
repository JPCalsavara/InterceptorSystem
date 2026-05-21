import { NovaSenhaComponent } from './nova-senha.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('NovaSenhaComponent', () => {
  const mockAuthService = {
    confirmarResetSenha: () => of({}),
  };

  const providers = [
    provideRouter([]),
    provideHttpClient(),
    { provide: AuthService, useValue: mockAuthService },
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          queryParamMap: {
            get: (key: string) => key === 'token' ? 'fake-token-123' : null
          }
        }
      }
    }
  ];

  it('Desktop: renderiza corretamente e valida token', () => {
    cy.mount(NovaSenhaComponent, { providers });
    cy.get('.auth-title').should('contain', 'Nova senha');
    cy.get('[data-cy="nova-senha-input"]').should('be.visible');
  });

  it('Desktop: valida complexidade da senha e senhas iguais', () => {
    cy.mount(NovaSenhaComponent, { providers });
    
    // Senha fraca
    cy.get('[data-cy="nova-senha-input"]').type('senhainvalida');
    cy.get('[data-cy="nova-senha-submit"]').click();
    cy.get('.field-error').first().should('contain', 'pelo menos 8 caracteres, 1 maiúscula e 1 número');
    
    // Senha forte mas nao confere
    cy.get('[data-cy="nova-senha-input"]').clear().type('SenhaForte123!');
    cy.get('[data-cy="confirmar-senha-input"]').type('SenhaDiferente123!');
    cy.get('[data-cy="nova-senha-submit"]').click();
    cy.get('.field-error').last().should('contain', 'As senhas não coincidem');
  });

  it('Desktop: redefine senha com sucesso', () => {
    cy.mount(NovaSenhaComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component['authService'], 'confirmarResetSenha').as('confirmarSpy');
    });
    
    cy.get('[data-cy="nova-senha-input"]').type('SenhaForte123!');
    cy.get('[data-cy="confirmar-senha-input"]').type('SenhaForte123!');
    cy.get('[data-cy="nova-senha-submit"]').click();
    
    cy.get('@confirmarSpy').should('have.been.calledWith', 'fake-token-123', 'SenhaForte123!');
    cy.get('.success-box').should('contain', 'Senha redefinida com sucesso');
  });

  it('Desktop: exibe erro se não houver token na URL', () => {
    const semTokenProviders = [
      provideRouter([]),
      provideHttpClient(),
      { provide: AuthService, useValue: mockAuthService },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: {
              get: () => null
            }
          }
        }
      }
    ];

    cy.mount(NovaSenhaComponent, { providers: semTokenProviders });
    cy.get('.error-message').should('contain', 'Token não encontrado');
  });
});
