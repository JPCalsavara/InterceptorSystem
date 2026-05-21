import { PerfilPageComponent } from './perfil-page.component';
import { AuthService } from '../../../services/auth.service';
import { signal } from '@angular/core';

describe('PerfilPageComponent', () => {
  const mockAuthService = {
    currentUser: signal({ nomeEmpresa: 'Test Corp', email: 'test@corp.com', plano: 'PRO' })
  };

  const providers = [
    { provide: AuthService, useValue: mockAuthService }
  ];

  it('Desktop: renderiza corretamente', () => {
    cy.mount(PerfilPageComponent, { providers });
    cy.get('h1').should('contain', 'Meu Perfil'); // Ajuste dependendo do html real
    // Como a lógica apenas gera as iniciais e pega dados do usuário, não há muita interação
    // Vamos garantir que não quebra e que a tag principal existe.
  });

  it('Desktop: calcula iniciais corretamente', () => {
    cy.mount(PerfilPageComponent, { providers }).then((fixture) => {
      expect(fixture.component.getInitials()).to.equal('TC');
    });
  });
});
