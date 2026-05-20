import { EmailVerificationBannerComponent } from './email-verification-banner.component';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';

describe('EmailVerificationBannerComponent - Cypress Component Test', () => {
  let mockAuthService: any;

  beforeEach(() => {
    // Criando um Mock do Serviço de Autenticação usando Sinon Stubs (nativo do Cypress)
    mockAuthService = {
      isAuthenticated: cy.stub().returns(true),
      isEmailVerificado: cy.stub().returns(false), // Força o banner a aparecer
      reenviarVerificacaoEmail: cy.stub().returns(of({})) // Retorna um Observable de sucesso instantâneo
    };
  });

  it('Desktop (1024px): Deve usar Flexbox Row (em linha) e botão pequeno', () => {
    cy.viewport(1024, 768);
    
    cy.mount(EmailVerificationBannerComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    // Garante matematicamente a regra Desktop (Responsividade)
    cy.get('.verification-banner').should('have.css', 'flex-direction', 'row');
    
    // Botão não deve esticar no Desktop
    cy.get('.banner-btn').invoke('outerWidth').should('be.lt', 250);
  });

  it('Mobile (320px): Deve usar Flexbox Column (empilhado) e botão 100%', () => {
    cy.viewport(320, 568);
    
    cy.mount(EmailVerificationBannerComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    // Mágica CSS Mobile Breakpoint (<= 768px)
    cy.get('.verification-banner').should('have.css', 'flex-direction', 'column');
    
    // No celular, tela=320px, descontando paddings, botão passa de 280px.
    cy.get('.banner-btn').invoke('outerWidth').should('be.gt', 280); 
  });

  it('Interação: Deve chamar o envio e exibir mensagem de sucesso', () => {
    cy.viewport(1024, 768);
    
    cy.mount(EmailVerificationBannerComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    // Clica no botão
    cy.get('.banner-btn').click();
    
    // Garante que a injeção de dependência disparou a função correta
    cy.wrap(mockAuthService.reenviarVerificacaoEmail).should('have.been.calledOnce');
    
    // Verifica se a tela exibiu o feedback pro usuário
    cy.get('.banner-msg').should('contain.text', 'E-mail enviado!');
  });
});
