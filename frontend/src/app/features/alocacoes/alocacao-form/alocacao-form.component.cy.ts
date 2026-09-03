import { AlocacaoFormComponent } from './alocacao-form.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AlocacaoService } from '../../../services/alocacao.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { TipoEscala, StatusContrato } from '../../../models';

describe('AlocacaoFormComponent', () => {
  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockPostos = [{ id: 'p1', clienteId: 'c1', nome: 'Portaria Principal' }];
  const mockContratos = [{ id: 'ct1', clienteId: 'c1', descricao: 'Contrato A', status: StatusContrato.ATIVO }];

  const mockAlocacaoService = {
    create: () => of({}),
    update: () => of({}),
    getById: () => of({
      id: 'a1',
      postoId: 'p1',
      contratoId: 'ct1',
      horarioInicio: '08:00:00',
      horarioFim: '18:00:00',
      tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
      permiteDobrarEscala: true
    })
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockPostoService = {
    getAll: () => of(mockPostos)
  };

  const mockContratoService = {
    getAll: () => of(mockContratos)
  };

  const providers = [
    provideRouter([]),
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: ContratoService, useValue: mockContratoService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } }
    }
  ];

  it('Desktop: renderiza o formulario e permite preencher dados', () => {
    cy.mount(AlocacaoFormComponent, { providers });
    cy.get('h1').should('contain', 'Novo Turno');
    
    // Seleciona Cliente, depois Posto e Contrato
    cy.get('select#clienteId').select('c1');
    cy.get('select#postoId').select('p1');
    cy.get('select#contratoId').select('ct1');
    
    cy.get('input#horarioInicio').type('08:00');
    cy.get('input#horarioFim').type('18:00');
    cy.get('select#tipoEscala').select(TipoEscala.DOZE_POR_TRINTA_SEIS);
  });

  it('Desktop: exibe erros ao tentar enviar vazio', () => {
    cy.mount(AlocacaoFormComponent, { providers });
    // Limpa campos preenchidos por padrão
    cy.get('input#horarioInicio').clear();
    cy.get('input#horarioFim').clear();

    cy.get('button[type="submit"]').click();
    cy.get('.error-message').should('have.length.greaterThan', 0);
  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(AlocacaoFormComponent, { providers });
    cy.get('.form-container').should('be.visible');
  });
});
