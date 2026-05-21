import { DiariasViewComponent } from './diarias-view.component';
import { Diaria, Funcionario, Posto, Alocacao, Cliente } from '../../../../models';

// Mocks
const mockFuncionarios: Funcionario[] = [
  { id: 'f1', nome: 'João Silva', cpf: '123', rg: '123', telefone: '123', email: 'joao@a.com', dataAdmissao: '2023-01-01', status: 'ATIVO', valorDiaria: 100 }
];
const mockClientes: Cliente[] = [
  { id: 'c1', nome: 'Cliente A', cnpj: '123', inscricaoEstadual: '123', email: 'c@a.com', telefone: '123', endereco: 'Rua A', status: 'ATIVO', contatoNome: 'A', contatoTelefone: '1' }
];
const mockPostos: Posto[] = [
  { id: 'p1', nome: 'Posto Central', clienteId: 'c1', endereco: 'Rua', bairro: 'Bairro', cidade: 'Cidade', cep: '123', status: 'ATIVO' }
];
const mockAlocacoes: Alocacao[] = [
  { id: 'a1', funcionarioId: 'f1', postoId: 'p1', dataInicio: '2023-01-01', status: 'ATIVA', cargaHoraria: '12x36', diasTrabalho: [], tipoEscala: '12x36' }
];

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const mockDiarias: Diaria[] = [
  { id: 'd1', alocacaoId: 'a1', funcionarioId: 'f1', data: todayStr, statusDiaria: 'CONFIRMADA', tipoDiaria: 'REGULAR', observacao: '', valorPago: 100 }
];

describe('DiariasViewComponent', () => {
  it('Desktop: deve renderizar na view mensal (padrão) e exibir as diárias do mês', () => {
    cy.viewport(1024, 768);
    cy.mount(DiariasViewComponent, {
      componentProperties: {
        diarias: mockDiarias,
        funcionarios: mockFuncionarios,
        postos: mockPostos,
        alocacoes: mockAlocacoes,
        clientes: mockClientes,
      }
    });

    cy.get('.diarias-view').should('be.visible');
    cy.get('[data-cy="calendar-cell"]').should('have.length.at.least', 28);
    cy.get('.calendar-cell .funcionario-number').should('have.length', 1).and('contain.text', '1');
  });

  it('Desktop: deve alterar para view semanal e exibir o kanban', () => {
    cy.viewport(1024, 768);
    cy.mount(DiariasViewComponent, {
      componentProperties: {
        diarias: mockDiarias,
        funcionarios: mockFuncionarios,
        postos: mockPostos,
        alocacoes: mockAlocacoes,
        clientes: mockClientes,
      }
    });

    cy.get('[data-cy="view-weekly-btn"]').click();
    cy.get('[data-cy="kanban-column"]').should('have.length', 7);
    cy.get('.funcionario-card').should('contain.text', 'João Silva');
  });

  it('Mobile: deve renderizar corretamente na view diária', () => {
    cy.viewport(320, 568);
    cy.mount(DiariasViewComponent, {
      componentProperties: {
        diarias: mockDiarias,
        funcionarios: mockFuncionarios,
        postos: mockPostos,
        alocacoes: mockAlocacoes,
        clientes: mockClientes,
      }
    });

    cy.get('[data-cy="view-daily-btn"]').click();
    cy.get('[data-cy="diaria-card"]').should('have.length', 1);
    cy.get('[data-cy="diaria-card"]').should('contain.text', 'João Silva');
  });

  it('deve filtrar as diárias pelo status', () => {
    cy.viewport(1024, 768);
    cy.mount(DiariasViewComponent, {
      componentProperties: {
        diarias: mockDiarias,
        funcionarios: mockFuncionarios,
        postos: mockPostos,
        alocacoes: mockAlocacoes,
        clientes: mockClientes,
      }
    });

    cy.get('[data-cy="view-daily-btn"]').click();
    cy.get('[data-cy="diaria-card"]').should('have.length', 1);

    // Filtra por Cancelada (não deve achar nada)
    cy.get('[data-cy="filtro-status"]').select('CANCELADA');
    cy.get('.empty-state').should('be.visible').and('contain.text', 'Nenhuma diária encontrada');
  });
});
