import { PerfilComponent } from './perfil.component';
import { provideHttpClient } from '@angular/common/http';
import { ContaService } from '../../services/conta.service';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('PerfilComponent', () => {
  const mockPerfilData = {
    empresaId: '123',
    nomeEmpresa: 'Interceptor Ltda',
    email: 'admin@interceptor.com',
    cnpj: '00.000.000/0001-00',
    plano: 'PRO',
    createdAt: new Date().toISOString()
  };

  const mockContaService = {
    getPerfil: () => of(mockPerfilData),
    atualizarPerfil: () => of({ ...mockPerfilData, nomeEmpresa: 'Interceptor S.A.' })
  };

  const mockAuthService = {
    currentUser: signal(mockPerfilData),
    atualizarUser: () => {}
  };

  const providers = [
    provideHttpClient(),
    { provide: ContaService, useValue: mockContaService },
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: renderiza corretamente o perfil carregado', () => {
    cy.mount(PerfilComponent, { providers });
    cy.get('.info-value').should('contain', 'Interceptor Ltda');
    cy.get('.badge').should('contain', 'PRO');
  });

  it('Desktop: abre o modo de edição e salva alterações', () => {
    cy.mount(PerfilComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component['contaService'], 'atualizarPerfil').as('atualizarSpy');
    });

    cy.get('[data-cy="perfil-editar-btn"]').click();
    cy.get('[data-cy="perfil-nome-input"]').clear().type('Interceptor S.A.');
    cy.get('[data-cy="perfil-salvar-btn"]').click();

    cy.get('@atualizarSpy').should('have.been.called');
    cy.get('.success-message').should('contain', 'atualizadas com sucesso');
  });

  it('Mobile: ajusta layout', () => {
    cy.viewport(320, 568);
    cy.mount(PerfilComponent, { providers });
    cy.get('.card').should('have.css', 'width').and('not.eq', '0px');
  });
});
