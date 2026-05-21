import { PostoFormComponent } from './posto-form.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { CepService } from '../../../services/cep.service';

describe('PostoFormComponent', () => {
  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockContratos = [{ id: 'ct1', clienteId: 'c1', descricao: 'Contrato A' }];

  const mockPostoService = {
    create: () => of({}),
    update: () => of({}),
    getById: () => of({
      id: 'p1',
      clienteId: 'c1',
      contratoId: 'ct1',
      nome: 'Portaria Edit',
      cep: '01000-000',
      endereco: 'Rua Direita',
      numero: '123',
      cidade: 'São Paulo',
      estado: 'SP'
    })
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockContratoService = {
    getByClienteId: () => of(mockContratos)
  };

  const mockCepService = {
    formatCep: (cep: string) => cep,
    onlyDigits: (cep: string) => cep.replace(/\D/g, ''),
    isCepValido: () => true,
    buscarCep: () => of({ cep: '01000-000', logradouro: 'Rua Direita', cidade: 'São Paulo', estado: 'SP' })
  };

  const providers = [
    provideRouter([]),
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: CepService, useValue: mockCepService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => null } } }
    }
  ];

  it('Desktop: renderiza o formulario e permite preencher dados', () => {
    cy.mount(PostoFormComponent, { providers });
    cy.get('h1').should('contain', 'Novo Posto');
    
    // Seleciona Cliente e depois Contrato
    cy.get('select[formControlName="clienteId"]').select('c1');
    cy.get('select[formControlName="contratoId"]').select('ct1');
    
    cy.get('input[formControlName="nome"]').type('Nova Portaria');
    cy.get('input[formControlName="cep"]').type('01000000');
    cy.get('input[formControlName="numero"]').type('123');
  });

  it('Desktop: exibe mensagens de erro ao tentar enviar vazio', () => {
    cy.mount(PostoFormComponent, { providers });
    cy.get('button[type="submit"]').click();
    cy.get('.error-message').should('have.length.greaterThan', 0);
  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(PostoFormComponent, { providers });
    cy.get('.form-container').should('be.visible');
  });
});
