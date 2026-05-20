import { ActionCardComponent } from './action-card.component';

describe('ActionCardComponent - Responsividade e CSS Computado', () => {
  it('Desktop (1024px): Deve alinhar o texto e o botão em linha (row)', () => {
    cy.viewport(1024, 768);
    
    cy.mount(ActionCardComponent, {
      componentProperties: {
        title: 'Plano Premium',
        description: 'Upgrade sua conta hoje mesmo.',
        buttonText: 'Comprar'
      }
    });

    // Validação 1: O Flexbox deve estar emparelhando os blocos na horizontal
    cy.get('.action-card-container').should('have.css', 'flex-direction', 'row');
    
    // Validação 2: O botão NÃO deve estar esticado
    cy.get('.btn-primary').invoke('outerWidth').should('be.lt', 250); 
  });

  it('Mobile (320px): Deve quebrar o flexbox, empilhar verticalmente e esticar o botão', () => {
    // Redimensiona o navegador headless simulando celular antigo
    cy.viewport(320, 568);
    
    cy.mount(ActionCardComponent, {
      componentProperties: {
        title: 'Plano Premium',
        description: 'Upgrade sua conta hoje mesmo.',
        buttonText: 'Comprar'
      }
    });

    // MÁGICA: Garante matematicamente que a Media Query funcionou e virou coluna
    cy.get('.action-card-container').should('have.css', 'flex-direction', 'column');
    
    // Testa se o botão virou full-width (ocupando o espaço da tela)
    // Se um dia alguém quebrar o CSS sem querer, esse teste vai falhar no build!
    // Nota: Tela tem 320px. O Card tem padding de 24px nas laterais (48px total). 320 - 48 = 272px livres!
    cy.get('.btn-primary').invoke('outerWidth').should('be.gt', 260); 
  });
});
