import { TagListComponent } from './tag-list.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TagService } from '../../../services/tag.service';

describe('TagListComponent', () => {
  const mockTags = [
    { id: 't1', nome: 'Insalubridade', valor: 150, descricao: 'Adicional de insalubridade' },
    { id: 't2', nome: 'Periculosidade', valor: 200, descricao: 'Adicional de periculosidade' }
  ];

  const mockTagService = {
    getAll: () => of(mockTags),
    create: () => of({}),
    update: () => of({}),
    delete: () => of({})
  };

  const providers = [
    provideRouter([]),
    { provide: TagService, useValue: mockTagService }
  ];

  it('Desktop: renderiza a lista de tags corretamente', () => {
    cy.mount(TagListComponent, { providers });
    cy.get('h1').should('contain', 'Tags / Funções');
    cy.get('.tag-card').should('have.length', 2);
    cy.get('.tag-card').first().should('contain', 'Insalubridade');
    cy.get('.tag-card').last().should('contain', 'Periculosidade');
  });

  it('Desktop: abre modal de criacao e interage', () => {
    cy.mount(TagListComponent, { providers });
    cy.get('.btn-primary').contains('Nova Tag').click();
    cy.get('.modal').should('be.visible');
    cy.get('h2').should('contain', 'Nova Tag');
    
    // Preenche e salva
    cy.get('input[formControlName="nome"]').type('Vale Alimentação');
    cy.get('input[formControlName="valor"]').clear().type('50');
    cy.get('.modal-actions .btn-primary').click();
    cy.get('.toast-success, .alert-success').should('be.visible').and('contain', 'Tag criada com sucesso');
  });

  it('Desktop: deleta tag e exibe mensagem de sucesso', () => {
    cy.mount(TagListComponent, { providers });
    // Clica no primeiro item
    cy.get('.tag-card').first().find('.btn-danger, [title="Excluir"]').click();
    cy.get('.modal').should('be.visible'); // Delete confirmation modal
    cy.get('.modal-actions .btn-danger').click();
    
    cy.get('.toast-success, .alert-success').should('be.visible').and('contain', 'Tag excluída com sucesso');
  });

  it('Mobile: ajusta o layout para telas pequenas', () => {
    cy.viewport(320, 568);
    cy.mount(TagListComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
