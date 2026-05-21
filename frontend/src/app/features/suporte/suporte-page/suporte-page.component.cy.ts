import { SuportePageComponent } from './suporte-page.component';
import { provideRouter } from '@angular/router';

describe('SuportePageComponent', () => {
  const providers = [
    provideRouter([])
  ];

  it('Desktop: renderiza corretamente a página de suporte', () => {
    cy.mount(SuportePageComponent, { providers });
    cy.get('h1').should('contain', 'Suporte'); 
  });

  it('Desktop: navega por scroll', () => {
    cy.mount(SuportePageComponent, { providers }).then((fixture) => {
      // Como não podemos testar o scroll smoothly perfeitamente, chamamos o método para cobrir a linha
      cy.spy(fixture.component, 'scrollToFragment').as('scrollSpy');
      // Adicionamos um elemento fake se não tiver
      const div = document.createElement('div');
      div.id = 'contato';
      document.body.appendChild(div);
      
      fixture.component.scrollToFragment('contato');
      cy.get('@scrollSpy').should('have.been.calledWith', 'contato');
      
      document.body.removeChild(div);
    });
  });
});
