import { ContratoFormComponent } from './contrato-form.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { ClienteService } from '../../../services/cliente.service';
import { TagService } from '../../../services/tag.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { of } from 'rxjs';
import { provideEnvironmentNgxMask } from 'ngx-mask';

describe('ContratoFormComponent', () => {
  const mockContratoService = {
    getById: () => of({
      id: '1',
      clienteId: 'c1',
      descricao: 'Contrato Novo',
      dataInicio: '2025-01-01',
      dataFim: '2028-01-01',
      status: 'ATIVO',
      percentualImpostos: 15,
      percentualAdicionalNoturno: 20,
      percentualAdicionalFimSemana: 100,
      percentualMargemLucro: 15,
      percentualMargemFaltas: 10,
      postosConfig: []
    }),
    create: () => of({ id: '2' }),
    update: () => of({ id: '1' })
  };

  const mockClienteService = {
    getAll: () => of([{ id: 'c1', nome: 'Cliente A' }])
  };

  const mockTagService = { getAll: () => of([]) };
  const mockAlocacaoService = { getByContratoId: () => of([]) };
  
  const mockCalculoService = {
    calcularValorTotal: () => of({ valorTotalMensal: 10000, custoBaseMensal: 5000 })
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null // modo de criação
      }
    }
  };

  const providers = [
    provideRouter([{ path: 'contratos', component: ContratoFormComponent }]),
    provideEnvironmentNgxMask(),
    FormBuilder,
    { provide: ContratoService, useValue: mockContratoService },
    { provide: ContratoCalculoService, useValue: mockCalculoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: TagService, useValue: mockTagService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: ActivatedRoute, useValue: mockActivatedRoute }
  ];

  it('Desktop: renderiza o formulário e permite preencher', () => {
    cy.mount(ContratoFormComponent, { providers });
    cy.get('h1').should('contain', 'Novo Contrato');
    cy.get('[data-cy="contrato-cliente"]').select('c1');
    cy.get('[data-cy="contrato-titulo"]').type('Meu Contrato de Teste');
    cy.get('[data-cy="contrato-data-inicio"]').type('2025-01-01');
    // Preencher data fim
    cy.get('[data-cy="contrato-data-fim"]').type('2028-01-01');
  });

  it('Desktop: exibe erros ao tentar salvar formulario em branco', () => {
    cy.mount(ContratoFormComponent, { providers });
    cy.get('[data-cy="btn-save-contrato"]').click();
    cy.get('.error-message').should('have.length.greaterThan', 0);
  });

  it('Mobile: ajusta o layout da visualizacao', () => {
    cy.viewport(320, 568);
    cy.mount(ContratoFormComponent, { providers });
    cy.get('.form-container').should('be.visible');
  });
});
