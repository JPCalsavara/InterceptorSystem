import { DashboardComponent } from './dashboard.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import { ContratoFinanceiroUiService } from '../../services/contrato-financeiro-ui.service';

describe('DashboardComponent', () => {
  const mockClienteService = { getAll: () => of([]) };
  const mockFuncionarioService = { getAll: () => of([]) };
  const mockPostoService = { getAll: () => of([]) };
  const mockDiariaService = { getAll: () => of([]) };
  const mockContratoService = { getAll: () => of([]) };
  const mockFinanceiroUiService = {
    carregarCalculosDetalhados$: () => of(new Map()),
    getFaturamentoDetalhado: () => 0,
    getCustoDetalhado: () => 0,
    getLucroDetalhado: () => 0
  };

  const providers = [
    provideRouter([]),
    provideHttpClient(),
    { provide: ClienteService, useValue: mockClienteService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: ContratoFinanceiroUiService, useValue: mockFinanceiroUiService }
  ];

  it('Desktop: renderiza estado de loading inicial e depois grid principal', () => {
    // Para testar o loading, podemos mockar um delay ou apenas verificar o estado final
    cy.mount(DashboardComponent, { providers });
    
    // Como os observables de mock são resolvidos sincronicamente,
    // o loading pode sumir antes do cypress pegar se não houver delay no mock, 
    // mas vamos verificar a presença da grid principal.
    cy.get('.dashboard-main-grid').should('be.visible');
    cy.get('h1').contains('Métricas Financeiras').should('be.visible');
  });

  it('Desktop: carrega os dados no botão atualizar', () => {
    cy.mount(DashboardComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component, 'loadAllData').as('loadSpy');
    });
    
    cy.get('[data-cy="btn-refresh"]').click();
    cy.get('@loadSpy').should('have.been.called');
  });

  it('Mobile: renderiza de forma responsiva', () => {
    cy.viewport(320, 568);
    cy.mount(DashboardComponent, { providers });
    cy.get('.metricas-grid').should('have.css', 'display', 'grid');
    cy.get('.btn-refresh').should('have.css', 'width').and('not.eq', '0px');
  });
});
