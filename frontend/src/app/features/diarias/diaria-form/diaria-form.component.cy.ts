import { DiariaFormComponent } from './diaria-form.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { StatusDiaria, TipoDiaria } from '../../../models';

describe('DiariaFormComponent', () => {
  const mockFuncionarios = [{ id: 'f1', nome: 'João Diarista' }];
  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockPostos = [{ id: 'p1', clienteId: 'c1', nome: 'Posto Central' }];
  const mockAlocacoes = [{ id: 'a1', postoId: 'p1', horarioInicio: '08:00:00', horarioFim: '18:00:00' }];

  const mockDiariaService = {
    create: () => of({}),
    update: () => of({}),
    getById: () => of({
      id: 'd1',
      funcionarioId: 'f1',
      alocacaoId: 'a1',
      data: '2026-05-20',
      statusDiaria: StatusDiaria.CONFIRMADA,
      tipoDiaria: TipoDiaria.REGULAR
    })
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

  const mockAlocacaoService = {
    getAll: () => of(mockAlocacoes)
  };

  const providers = [
    provideRouter([]),
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => null } } }
    }
  ];

  it('Desktop: renderiza o formulario e preenche campos corretamente', () => {
    cy.mount(DiariaFormComponent, { providers });
    cy.get('h1').should('contain', 'Nova Diária');
    
    // Seleciona as opções
    cy.get('select[formControlName="funcionarioId"]').select('f1');
    cy.get('select[formControlName="alocacaoId"]').select('a1');
    cy.get('input[formControlName="data"]').type('2026-05-20');
  });

  it('Desktop: renderiza como componente embeded para edição', () => {
    cy.mount(DiariaFormComponent, { 
      providers, 
      componentProperties: { 
        embeddedDiariaId: 'd1' 
      } 
    });
    
    // No modo de edição com ID preexistente (ou embeded), campos de ID de Funcionario e Alocacao são desabilitados.
    cy.get('select[formControlName="funcionarioId"]').should('be.disabled');
    cy.get('select[formControlName="alocacaoId"]').should('be.disabled');
    
    cy.get('input[formControlName="data"]').should('have.value', '2026-05-20');
  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(DiariaFormComponent, { providers });
    cy.get('form').should('be.visible');
  });
});
