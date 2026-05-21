import { PlanoComponent } from './plano.component';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';

describe('PlanoComponent', () => {
  const mountWithPlan = (plano: string) => {
    const mockAuthService = {
      currentUser: signal({ plano })
    };

    return cy.mount(PlanoComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  };

  it('Desktop: renderiza plano FREE corretamente', () => {
    mountWithPlan('FREE');
    cy.get('.current-plan-name').should('contain', 'FREE');
    cy.get('.plan-status').should('contain', 'Faça upgrade');
    cy.get('th').contains('FREE').find('.current-badge').should('exist');
    cy.get('th').contains('PRO').find('.current-badge').should('not.exist');
    cy.get('.upgrade-cta').should('be.visible');
  });

  it('Desktop: renderiza plano PRO corretamente', () => {
    mountWithPlan('PRO');
    cy.get('.current-plan-name').should('contain', 'PRO');
    cy.get('.plan-status').should('contain', 'Plano completo ativo');
    cy.get('th').contains('PRO').find('.current-badge').should('exist');
    cy.get('.upgrade-cta').should('not.exist');
  });

  it('Mobile: ajusta tabela e container', () => {
    cy.viewport(320, 568);
    mountWithPlan('BASIC');
    cy.get('.table-wrapper').should('have.css', 'overflow-x', 'auto');
    cy.get('.current-plan-name').should('contain', 'BASIC');
  });
});
