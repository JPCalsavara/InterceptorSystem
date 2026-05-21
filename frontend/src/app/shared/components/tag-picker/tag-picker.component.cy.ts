import { TagPickerComponent } from './tag-picker.component';
import { Tag } from '../../../models';

describe('TagPickerComponent', () => {
  const mockTags: Tag[] = [
    { id: '1', nome: 'Vigilante', descricao: 'Armado', valor: 0 },
    { id: '2', nome: 'Porteiro', descricao: 'Noturno', valor: 0 },
    { id: '3', nome: 'Zelador', descricao: '', valor: 0 },
  ];

  it('Desktop: deve renderizar corretamente e permitir selecao e busca', () => {
    cy.viewport(1024, 768);
    cy.mount(TagPickerComponent, {
      componentProperties: {
        tags: mockTags,
      }
    }).then((res) => {
      cy.spy(res.component.selectionChange, 'emit').as('selectionChangeSpy');
    });

    // Check rendering
    cy.get('.picker-label').should('contain.text', 'Funções');
    cy.get('[data-cy="tag-list"]').should('be.visible');
    cy.get('[data-cy="tag-option"]').should('have.length', 3);

    // Click to select
    cy.get('[data-cy="tag-option"]').eq(0).click();
    cy.get('@selectionChangeSpy').should('have.been.calledWith', ['1']);

    // Search
    cy.get('[data-cy="tag-picker-search"]').type('Porteiro');
    cy.get('[data-cy="tag-option"]').should('have.length', 1).and('contain.text', 'Porteiro');
  });

  it('Desktop: deve exibir chips selecionados quando selectedIds possuir valores', () => {
    cy.viewport(1024, 768);
    cy.mount(TagPickerComponent, {
      componentProperties: {
        tags: mockTags,
        selectedIds: ['1'],
      }
    });

    cy.get('[data-cy="selected-chips"]').should('be.visible');
    cy.get('[data-cy="tag-chip"]').should('have.length', 1).and('contain.text', 'Vigilante');
  });

  it('Desktop: deve exibir empty state quando não há tags', () => {
    cy.viewport(1024, 768);
    cy.mount(TagPickerComponent, {
      componentProperties: {
        tags: [],
        emptyText: 'Nenhuma tag de teste.'
      },
    });

    cy.get('[data-cy="tag-picker-empty"]').should('be.visible').and('contain.text', 'Nenhuma tag de teste.');
  });

  it('Mobile: deve renderizar responsivamente os chips', () => {
    cy.viewport(320, 568);
    cy.mount(TagPickerComponent, {
      componentProperties: {
        tags: mockTags,
        selectedIds: ['1', '2', '3']
      },
    });

    cy.get('[data-cy="selected-chips"]').should('have.css', 'display', 'flex');
    cy.get('[data-cy="tag-list"]').should('be.visible');
  });

  it('deve desabilitar campos quando disabled = true e respeitar fixed/locked tags', () => {
    cy.mount(TagPickerComponent, {
      componentProperties: {
        tags: mockTags,
        selectedIds: ['1'],
        lockedIds: ['1'],
        disabled: true,
      }
    }).then((res) => {
      cy.spy(res.component.selectionChange, 'emit').as('selectionChangeSpy');
    });

    cy.get('[data-cy="tag-picker-search"]').should('be.disabled');
    cy.get('[data-cy="tag-option"]').eq(1).should('be.disabled');
    
    cy.get('[data-cy="tag-option"]').eq(0).click({ force: true });
    cy.get('@selectionChangeSpy').should('not.have.been.called');
    
    cy.get('[data-cy="tag-chip"]').eq(0).should('contain.text', 'fixa').and('have.class', 'locked');
  });
});
