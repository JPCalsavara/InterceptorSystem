import { ClienteWizardComponent } from './cliente-wizard.component';
import { provideRouter } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { IbgeService } from '../../../services/ibge.service';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { TagService } from '../../../services/tag.service';

import { provideEnvironmentNgxMask } from 'ngx-mask';

describe('ClienteWizardComponent', () => {
  const mockIbgeService = {
    getEstados: () => of([{ id: 35, sigla: 'SP', nome: 'São Paulo' }]),
    getMunicipiosPorEstado: () => of([{ id: 3550308, nome: 'São Paulo' }])
  };

  const mockClienteService = {
    createCompleto: () => of({ id: '123' })
  };

  const mockTagService = {
    getAll: () => of([{ id: '1', nome: 'Vigilante', valor: 250 }])
  };

  const providers = [
    provideRouter([]),
    FormBuilder,
    provideEnvironmentNgxMask(),
    { provide: ClienteService, useValue: mockClienteService },
    { provide: IbgeService, useValue: mockIbgeService },
    { provide: TagService, useValue: mockTagService }
  ];

  it('Desktop: renderiza o wizard e avança para passo 2', () => {
    cy.mount(ClienteWizardComponent, { 
      providers
    });
    
    // Passo 1 - Preenche dados básicos
    cy.get('h1').should('contain', 'Novo Cliente Completo');
    // app-form-input renders <input id="nome"> — use id or data-cy selectors
    cy.get('[data-cy="wizard-cliente-nome"] input, input#nome').type('Cliente Horizon');
    cy.get('[data-cy="wizard-cliente-cnpj"] input, input#cnpj').type('33069150000100');
    cy.get('[formControlName="estado"]').select('SP');
    cy.get('[formControlName="cidade"]').should('not.be.disabled').select('São Paulo');
    cy.get('[data-cy="wizard-cliente-ideal"] input, input#quantidadeIdealPorTurno').clear().type('2');
    cy.get('[data-cy="wizard-cliente-horario"] input, input#horarioTrocaTurno').clear().type('06:00');

    // Clica no próximo (we have to find the next button in the footer)
    // Looking at common wizard structure, the next button is usually 'Próximo' or similar
    // We can just call the goToStep directly from the component to simulate if UI is complex
    // Or just find the step circle
    cy.get('.step-item').contains('2').click();
    
    // Passo 2 - Contrato
    cy.get('h2').should('contain', 'Contrato');
    cy.get('input[formControlName="criarContrato"]').should('not.be.checked');
    cy.get('input[formControlName="criarContrato"]').check();
    cy.get('input[formControlName="criarContrato"]').should('be.checked');
  });

  it('Mobile: responsividade do wizard', () => {
    cy.viewport(320, 568);
    cy.mount(ClienteWizardComponent, { 
      providers
    });
    // Check if progress indicator adapts
    cy.get('.progress-container').should('be.visible');
  });
});
