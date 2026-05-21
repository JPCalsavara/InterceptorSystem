import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LayoutStateService } from '../services/layout-state.service';
import { of } from 'rxjs';

import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import { AlocacaoService } from '../../services/alocacao.service';
import { TagService } from '../../services/tag.service';

const mockService = { 
  getAll: () => of([{ id: '1', ativo: true, statusFuncionario: 'ATIVO', statusDiaria: 'CONFIRMADA', status: 'ATIVO' }]) 
};

const mockAuthService = { logout: () => {} };

describe('SidebarComponent', () => {
  const providers = [
    provideRouter([{ path: '**', component: SidebarComponent }]),
    { provide: AuthService, useValue: mockAuthService },
    { provide: ClienteService, useValue: mockService },
    { provide: FuncionarioService, useValue: mockService },
    { provide: PostoService, useValue: mockService },
    { provide: DiariaService, useValue: mockService },
    { provide: ContratoService, useValue: mockService },
    { provide: AlocacaoService, useValue: mockService },
    { provide: TagService, useValue: mockService },
    LayoutStateService
  ];

  it('Desktop: renderiza sidebar expandida e carrega counts', () => {
    cy.viewport(1280, 720);
    cy.mount(SidebarComponent, { providers });

    cy.get('[data-cy="sidebar"]').should('not.have.class', 'collapsed');
    cy.get('[data-cy="nav-item"]').should('have.length', 8);
    cy.get('.nav-badge').should('contain.text', '1');
  });

  it('Desktop: deve colapsar sidebar ao clicar em collapse-toggle', () => {
    cy.viewport(1280, 720);
    cy.mount(SidebarComponent, { providers });

    cy.get('[data-cy="collapse-toggle"]').click();
    cy.get('[data-cy="sidebar"]').should('have.class', 'collapsed');
    
    cy.get('.label').should('not.be.visible');
  });

  it('Mobile: deve fechar a sidebar ao clicar em um nav-item', () => {
    cy.viewport(375, 812);
    cy.mount(SidebarComponent, { providers }).then((res) => {
      res.component.layoutState.leftDrawerOpen.set(true);
      cy.get('[data-cy="sidebar"]').should('have.class', 'open');
      cy.get('[data-cy="nav-item"]').first().click();
      cy.get('[data-cy="sidebar"]').should('not.have.class', 'open');
    });
  });

  it('deve realizar logout', () => {
    cy.spy(mockAuthService, 'logout').as('logoutSpy');
    cy.mount(SidebarComponent, { providers });
    cy.get('[data-cy="sidebar-logout"]').click({ force: true });
    cy.get('@logoutSpy').should('have.been.called');
  });
});
