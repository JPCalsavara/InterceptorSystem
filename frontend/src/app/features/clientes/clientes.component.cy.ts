import { ClientesComponent } from './clientes.component';
import { provideRouter } from '@angular/router';

describe('ClientesComponent', () => {
  it('Desktop: renderiza o placeholder corretamente', () => {
    cy.mount(ClientesComponent, {
      providers: [provideRouter([])]
    });
    cy.get('h1').should('contain', 'Clientes');
    cy.get('.coming-soon').should('be.visible');
  });
});
