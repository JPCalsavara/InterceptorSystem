import { ContaAlterarSenhaComponent } from './conta-alterar-senha.component';
import { AuthService } from '../../../../services/auth.service';

describe('ContaAlterarSenhaComponent - Cypress Component Test', () => {
  let mockAuthService: any;

  beforeEach(() => {
    // Mock minimalista só para renderizar
    mockAuthService = {
      currentUser: cy.stub().returns({ empresaId: '123' })
    };
  });

  it('Desktop (1024px): O botão de salvar deve ser pequeno e alinhado a esquerda', () => {
    cy.viewport(1024, 768);
    
    cy.mount(ContaAlterarSenhaComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    // Botão não deve esticar no Desktop
    cy.get('.btn-primary').invoke('outerWidth').should('be.lt', 300);
  });

  it('Mobile (320px): O botão de salvar deve esticar para 100% da largura', () => {
    cy.viewport(320, 568);
    
    cy.mount(ContaAlterarSenhaComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    // Tela = 320px, descontando padding de 16px(x2) = 288px livre pro botão
    cy.get('.btn-primary').invoke('outerWidth').should('be.gt', 280); 
  });
});
