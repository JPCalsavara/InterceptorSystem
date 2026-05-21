import { CadastroComponent } from './cadastro.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { of, throwError } from 'rxjs';

describe('CadastroComponent', () => {
  const mockAuthService = {
    registrar: () => of({}),
  };

  const providers = [
    provideRouter([{ path: 'dashboard', children: [] }]),
    provideHttpClient(),
    provideEnvironmentNgxMask(),
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: renderiza corretamente o formulário', () => {
    cy.mount(CadastroComponent, { providers });
    cy.get('.register-header h2').should('contain', 'Criar conta gratuita');
    cy.get('[data-testid="register-name"]').should('be.visible');
    cy.get('[data-testid="cnpj"]').should('be.visible');
    cy.get('[data-testid="register-email"]').should('be.visible');
    cy.get('[data-testid="register-password"]').should('be.visible');
  });

  it('Desktop: deve exibir erros de validação ao submeter formulário vazio', () => {
    cy.mount(CadastroComponent, { providers });
    cy.get('[data-testid="register-submit"]').click();
    cy.get('.field-error').should('have.length', 3); // Nome, E-mail e Senha (CNPJ opcional, sem required validator)
  });

  it('Desktop: deve realizar o cadastro com dados válidos', () => {
    cy.mount(CadastroComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component['authService'], 'registrar').as('registrarSpy');
    });

    cy.get('[data-testid="register-name"]').type('Condominio Teste');
    cy.get('[data-testid="cnpj"]').type('60746948000112'); // CNPJ válido (sem pontuação, máscara aplica)
    cy.get('[data-testid="register-email"]').type('teste@condominio.com');
    cy.get('[data-testid="register-password"]').type('Senha123!');
    
    cy.get('[data-testid="register-submit"]').click();

    cy.get('@registrarSpy').should('have.been.calledWith', {
      nomeEmpresa: 'Condominio Teste',
      cnpj: '60746948000112',
      email: 'teste@condominio.com',
      senha: 'Senha123!',
    });
  });

  it('Mobile: renderiza hero em modo responsivo', () => {
    cy.viewport(320, 568);
    cy.mount(CadastroComponent, { providers });
    // Em telas pequenas o css altera a grid e os elementos ganham adaptações
    cy.get('.hero').should('be.visible');
    cy.get('.register-card').should('have.css', 'width').and('not.eq', '0px');
  });
});
