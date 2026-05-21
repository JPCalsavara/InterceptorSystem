import { ContratosComponent } from './contratos.component';
import { provideRouter } from '@angular/router';

describe('ContratosComponent', () => {
  it('Desktop: renderiza o router-outlet corretamente', () => {
    cy.mount(ContratosComponent, {
      providers: [provideRouter([])]
    });
    cy.get('.page-container').should('exist');
  });
});
