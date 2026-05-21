import { PostosComponent } from './postos.component';
import { provideRouter } from '@angular/router';

describe('PostosComponent', () => {
  it('Desktop: renderiza a pagina placeholder corretamente', () => {
    cy.mount(PostosComponent, {
      providers: [provideRouter([])]
    });
    cy.get('.coming-soon').should('exist');
  });
});
