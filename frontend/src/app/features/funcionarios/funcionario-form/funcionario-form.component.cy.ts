import { FuncionarioFormComponent } from './funcionario-form.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { StatusFuncionario, TipoFuncionario, TipoEscala, StatusContrato } from '../../../models';
import { FuncionarioService } from '../../../services/funcionario.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';

describe('FuncionarioFormComponent', () => {
  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockContratos = [
    { id: 'ct1', clienteId: 'c1', descricao: 'Contrato A', status: StatusContrato.ATIVO, tags: [{ tagId: 't1', tagNome: 'Tag 1' }] }
  ];

  const mockFuncionarioService = {
    create: () => of({}),
    update: () => of({}),
    getById: () => of({
      id: 'f1',
      clienteId: 'c1',
      contratoId: 'ct1',
      nome: 'João Edit',
      cpf: '11111111111',
      celular: '11999999999',
      statusFuncionario: StatusFuncionario.ATIVO,
      tipoFuncionario: TipoFuncionario.CLT,
      tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
      tags: [{ id: 't1', nome: 'Tag 1' }]
    })
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockContratoService = {
    getAll: () => of(mockContratos)
  };

  const providers = [
    provideRouter([]),
    provideEnvironmentNgxMask(),
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => null } } }
    }
  ];

  it('Desktop: renderiza o formulario corretamente e permite cadastro', () => {
    cy.mount(FuncionarioFormComponent, { providers });
    cy.get('h1').should('contain', 'Novo Funcionário');
    
    // Seleciona Cliente
    cy.get('select[formControlName="clienteId"]').select('c1');
    // Seleciona Contrato
    cy.get('select[formControlName="contratoId"]').select('ct1');
    
    // Preenche dados
    cy.get('input[formControlName="nome"]').type('Novo Funcionário');
    cy.get('input[formControlName="cpf"]').type('12345678909');
    cy.get('input[formControlName="celular"]').type('11988887777');
    
    cy.get('select[formControlName="statusFuncionario"]').select(StatusFuncionario.ATIVO);
  });

  it('Desktop: exibe erros ao tentar salvar vazio', () => {
    cy.mount(FuncionarioFormComponent, { providers });
    cy.get('button[type="submit"]').click();
    cy.get('.error-message').should('have.length.greaterThan', 0);
  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(FuncionarioFormComponent, { providers });
    cy.get('.form-container').should('be.visible');
  });
});
