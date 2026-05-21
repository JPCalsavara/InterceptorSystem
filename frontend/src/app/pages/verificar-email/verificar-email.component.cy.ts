import { VerificarEmailComponent } from './verificar-email.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('VerificarEmailComponent', () => {
  const providersSucesso = [
    provideRouter([]),
    provideHttpClient(),
    {
      provide: AuthService,
      useValue: {
        confirmarEmail: () => of({})
      }
    },
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          queryParamMap: {
            get: (key: string) => key === 'token' ? 'valid-token' : null
          }
        }
      }
    }
  ];

  it('Desktop: carrega em estado de loading e valida token com sucesso', () => {
    cy.mount(VerificarEmailComponent, { providers: providersSucesso });
    cy.get('.status-box.success').should('be.visible');
    cy.get('.status-box').should('contain', 'E-mail verificado com sucesso!');
    cy.get('[data-cy="verificar-dashboard-btn"]').should('be.visible');
  });

  it('Desktop: exibe erro ao encontrar token inválido', () => {
    const providersErro = [
      provideRouter([]),
      provideHttpClient(),
      {
        provide: AuthService,
        useValue: {
          confirmarEmail: () => throwError(() => ({ error: { mensagem: 'Token expirado' } }))
        }
      },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: {
              get: (key: string) => key === 'token' ? 'invalid-token' : null
            }
          }
        }
      }
    ];

    cy.mount(VerificarEmailComponent, { providers: providersErro });
    cy.get('.status-box.error').should('be.visible');
    cy.get('.status-box').should('contain', 'Token expirado');
    cy.get('[data-cy="verificar-dashboard-btn-error"]').should('be.visible');
  });

  it('Desktop: exibe erro se não houver token na URL', () => {
    const semTokenProviders = [
      provideRouter([]),
      provideHttpClient(),
      { provide: AuthService, useValue: {} },
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

    cy.mount(VerificarEmailComponent, { providers: semTokenProviders });
    cy.get('.status-box.error').should('be.visible');
    cy.get('.status-box').should('contain', 'Token não encontrado');
  });
});
