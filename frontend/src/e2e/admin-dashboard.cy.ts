describe('Fluxo do Super Administrador', () => {
  it('Deve acessar o dashboard de admin e carregar as métricas com sucesso', () => {
    // 1. Acessa a página de login
    cy.visit('/login');

    // 2. Realiza o login como admin
    cy.get('input[type="email"]').type('admin@gmail.com');
    cy.get('input[type="password"]').type('Abcd1234');
    cy.get('button[type="submit"]').click();

    // 3. Espera redirecionar para o dashboard normal
    cy.url().should('include', '/dashboard');

    // 4. Verifica se o menu "Admin Global" está visível na sidebar e clica
    cy.contains('Admin Global').should('be.visible').click();

    // 5. Verifica se redirecionou para /system-admin
    cy.url().should('include', '/system-admin');

    // 6. Aguarda o carregamento e verifica os cards de métricas
    cy.contains('Painel do Super Administrador').should('be.visible');
    
    // Verifica se os cards de métricas foram renderizados
    cy.get('.metric-card').should('have.length', 5);

    // Verifica textos chaves das métricas
    cy.contains('Tenants (Contas)').should('be.visible');
    cy.contains('Faturamento Global').should('be.visible');
    cy.contains('Total Funcionários').should('be.visible');
    cy.contains('Total Clientes').should('be.visible');
    cy.contains('Total Postos').should('be.visible');
  });
});
