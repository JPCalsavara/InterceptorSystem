describe('Data Consistency Between List and Detail Views', () => {
  const baseUrl = 'http://localhost:4201';
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
  };

  const testCliente = {
    nome: 'Empresa Consistencia E2E',
    cnpj: '11222333000188',
  };

  before(() => {
    cy.visit(baseUrl);
    cy.clearCookies();
    cy.window().then((win) => win.localStorage.clear());
  });

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
  });

  it('Criar fluxo completo e validar consistência de dados', () => {
    // 1. Criar Cliente
    cy.createCliente(testCliente);

    // 2. Criar Contrato
    cy.visit('/contratos/novo');
    const contratoDesc = `Contrato Consistencia ${Date.now()}`;
    cy.get('input[formControlName="descricao"]').type(contratoDesc);
    cy.get('select[formControlName="clienteId"]').select(testCliente.nome);
    cy.get('input[formControlName="dataInicio"]').type('2026-01-01');
    cy.get('input[formControlName="dataFim"]').type('2026-12-31');
    cy.get('input[formControlName="valorDiariaCobrada"]').clear().type('250.00');
    cy.get('input[formControlName="numeroDePostos"]').clear().type('1');
    cy.get('input[formControlName="quantidadeFuncionarios"]').clear().type('2');
    cy.get('button[type="submit"]').contains('Salvar Contrato').click();

    cy.url({ timeout: 15000 }).should('include', '/contratos');
    cy.contains(contratoDesc).should('be.visible');

    // 3. Criar Posto
    cy.visit('/postos/novo');
    const postoNome = `Posto Consistencia ${Date.now()}`;
    cy.get('input[formControlName="nome"]').type(postoNome);
    cy.get('select[formControlName="clienteId"]').select(testCliente.nome);
    cy.get('input[formControlName="endereco"]').type('Rua da Consistencia, 123');
    cy.get('input[formControlName="cidade"]').type('São Paulo');
    cy.get('select[formControlName="estado"]').select('SP');
    cy.get('button[type="submit"]').contains('Salvar Posto').click();

    cy.url({ timeout: 15000 }).should('include', '/postos');

    // 4. Criar Funcionário
    cy.visit('/funcionarios/novo');
    const funcNome = `João Consistencia ${Date.now()}`;
    cy.get('input[formControlName="nome"]').type(funcNome);
    cy.get('input[formControlName="cpf"]').type('11122233344');
    cy.get('input[formControlName="email"]').type(`joao${Date.now()}@teste.com`);
    cy.get('input[formControlName="celular"]').type('11999998888');
    cy.get('select[formControlName="clienteId"]').select(testCliente.nome);
    
    // Aguardar o dropdown de contrato atualizar após selecionar cliente
    cy.get('select[formControlName="contratoId"]').should('contain', contratoDesc);
    cy.get('select[formControlName="contratoId"]').select(contratoDesc);
    
    cy.get('select[formControlName="tipoFuncionario"]').select('CLT');
    cy.get('select[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS');
    cy.get('button[type="submit"]').contains('Salvar').click();

    cy.url({ timeout: 15000 }).should('include', '/funcionarios');

    // ==========================================
    // Validação 1: Consistência de Contrato
    // ==========================================
    cy.visit('/contratos');
    
    // Encontrar o contrato na lista e ler o faturamento
    cy.contains('.contract-card', contratoDesc).within(() => {
      cy.contains('.metric-label', 'Faturamento')
        .next('.metric-value')
        .invoke('text')
        .as('faturamentoLista');
        
      cy.contains('.metric-label', 'Custo Real')
        .next('.metric-value')
        .invoke('text')
        .as('custoLista');

      // Clicar para visualizar
      cy.get('.btn-view').click();
    });

    cy.url().should('include', '/contratos/');

    // Validar no detalhe
    cy.get('@faturamentoLista').then((faturamentoLista) => {
      // O detalhe tem vários cards, vamos achar o que diz "Faturamento Projetado" ou equivalente
      // Precisamos ajustar o seletor baseado no HTML real
      cy.contains('.metric-label', 'Faturamento Projetado')
        .next('.metric-value')
        .invoke('text')
        .should('eq', faturamentoLista);
    });

    cy.get('@custoLista').then((custoLista) => {
      cy.contains('.metric-label', 'Custo Total')
        .next('.metric-value')
        .invoke('text')
        .should('eq', custoLista);
    });

    // ==========================================
    // Validação 2: Consistência de Funcionário
    // ==========================================
    cy.visit('/funcionarios');

    cy.contains('.employee-card', funcNome).within(() => {
      cy.contains('.detail-label', 'Salário Est. Mensal')
        .next('.detail-value')
        .invoke('text')
        .as('salarioLista');

      // Clicar para visualizar
      cy.get('.btn-view').click();
    });

    cy.url().should('include', '/funcionarios/');

    // Validar no detalhe
    cy.get('@salarioLista').then((salarioLista) => {
      // No detalhe tem "Projeção Mês Completo" ou "Salário Simulado"
      // De acordo com o HTML do funcionario-detail
      cy.contains('.metric-label', 'Projeção Mês Completo')
        .next('.metric-value')
        .invoke('text')
        .should('eq', salarioLista);
    });
  });
});
