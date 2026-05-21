import { DiariaBatchFormComponent } from './diaria-batch-form.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { StatusContrato, TipoEscala } from '../../../models';

describe('DiariaBatchFormComponent', () => {
  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockContratos = [{ id: 'ct1', clienteId: 'c1', dataInicio: '2026-05-01', dataFim: '2026-05-31', status: StatusContrato.ATIVO }];
  const mockFuncionarios = [{ id: 'f1', clienteId: 'c1', nome: 'João Diarista', tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS }];
  const mockAlocacoes = [{ id: 'a1', postoId: 'p1', contratoId: 'ct1', horarioInicio: '08:00:00', horarioFim: '18:00:00', tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS }];
  const mockPostos = [{ id: 'p1', clienteId: 'c1', nome: 'Posto Central' }];

  const mockDiariaService = {
    createBatch: () => of([{ id: 'd1' }])
  };

  const mockFuncionarioService = {
    getAll: () => of(mockFuncionarios)
  };

  const mockPostoService = {
    getAll: () => of(mockPostos)
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockContratoService = {
    getAll: () => of(mockContratos)
  };

  const mockAlocacaoService = {
    getByContratoId: () => of(mockAlocacoes)
  };

  const providers = [
    provideRouter([]),
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => null } } }
    }
  ];

  it('Desktop: renderiza o formulario em lote', () => {
    cy.mount(DiariaBatchFormComponent, { providers });
    cy.get('h1').should('contain', 'Nova Diária Múltipla');
    
    // Selecionar Cliente
    cy.get('select[formControlName="clienteId"]').select('c1');
    
    // Contrato e Funcionario devem ser habilitados
    cy.get('select[formControlName="contratoId"]').should('not.be.disabled').select('ct1');
    cy.get('select[formControlName="alocacaoId"]').should('not.be.disabled').select('a1');
    cy.get('select[formControlName="funcionarioId"]').should('not.be.disabled').select('f1');
    
    cy.get('.summary-box').should('contain', 'Serão geradas');
  });

  it('Mobile: ajusta o layout para telas pequenas', () => {
    cy.viewport(320, 568);
    cy.mount(DiariaBatchFormComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
