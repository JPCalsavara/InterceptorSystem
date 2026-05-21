import { FuncionariosComponent } from './funcionarios.component';
import { provideRouter } from '@angular/router';

describe('FuncionariosComponent', () => {
  it('Desktop: renderiza a pagina placeholder corretamente', () => {
    cy.mount(FuncionariosComponent, {
      providers: [provideRouter([])]
    });
    cy.get('.coming-soon').should('exist');
  });
});
