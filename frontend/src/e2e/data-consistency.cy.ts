describe('Data Consistency Between List and Detail Views', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://localhost:4200';
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
  };

  const testCliente = {
    nome: `Empresa Consistencia E2E ${Date.now()}`,
    cnpj: '', // será gerado dinamicamente no support.ts
  };

  function generateCpf(): string {
    const rnd = (n: number) => Math.round(Math.random() * n);
    const base = Array.from({ length: 9 }, () => rnd(9));
    
    const calcDigit = (b: number[], weights: number[]) => {
      const sum = b.reduce((acc, val, i) => acc + val * weights[i], 0);
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };
    
    const d1 = calcDigit(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    const d2 = calcDigit([...base, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    
    return [...base, d1, d2].join('');
  }

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
    cy.get('textarea[formControlName="descricao"]').type(contratoDesc);
    cy.get('select[formControlName="clienteId"]').select(testCliente.nome);
    cy.get('input[formControlName="dataInicio"]').clear().type('2026-01-01');
    cy.get('input[formControlName="dataFim"]').clear().type('2026-12-31');
    cy.get('input[formControlName="valorDiariaCobrada"]').first().clear().type('250');
    
    // Aguardar o debouce e cálculo retornarem
    cy.intercept('POST', '**/api/contratos/calculos/calcular-valor-total').as('calcular');
    // Adicionar um type na descrição para forçar trigger do valueChanges
    const descricaoAtualizada = contratoDesc + ' atualizado';
    cy.get('textarea[formControlName="descricao"]').clear().type(descricaoAtualizada);
    
    cy.wait('@calcular');
    
    // Aguardar que a resposta da API seja processada pelo Angular e o signal breakdown seja atualizado
    cy.contains('.bk-group-total', 'R$').should('exist');
    
    cy.intercept('POST', '**/api/contratos').as('createContrato');
    cy.get('[data-testid="btn-save-contrato"]').click();
    
    cy.wait('@createContrato');

    cy.url({ timeout: 15000 }).should('not.include', '/novo');
    cy.url({ timeout: 15000 }).should('include', '/contratos');
    cy.contains(contratoDesc).should('exist');

    // 3. Criar Posto
    cy.visit('/postos/novo');
    const postoNome = `Posto Consistencia ${Date.now()}`;
    cy.get('input[formControlName="nome"]').type(postoNome);
    cy.get('select[formControlName="clienteId"]').select(testCliente.nome);
    cy.get('select[formControlName="contratoId"]', { timeout: 10000 })
      .should('contain', descricaoAtualizada)
      .select(descricaoAtualizada);
    cy.get('input[formControlName="cep"]').type('01001000');
    cy.get('input[formControlName="endereco"]').type('Rua da Consistencia');
    cy.get('input[formControlName="numero"]').type('123');
    cy.get('input[formControlName="cidade"]').clear().type('São Paulo');
    cy.get('input[formControlName="estado"]').clear().type('SP');
    cy.get('[data-testid="btn-save-posto"]').click();

    cy.url({ timeout: 15000 }).should('include', '/postos');

    // 4. Criar Funcionário
    cy.visit('/funcionarios/novo');
    const funcNome = `João Consistencia ${Date.now()}`;
    cy.get('input[formControlName="nome"]').type(funcNome);
    cy.get('input[formControlName="cpf"]').type(generateCpf());
    cy.get('input[formControlName="celular"]').type('11999998888');
    cy.get('select[formControlName="clienteId"]').select(testCliente.nome);
    
    // Aguardar o dropdown de contrato atualizar após selecionar cliente
    cy.get('select[formControlName="contratoId"]').should('contain', contratoDesc);
    cy.get('select[formControlName="contratoId"]').select(descricaoAtualizada);
    
    cy.get('select[formControlName="tipoFuncionario"]').select('CLT');
    cy.get('select[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS');
    cy.get('[data-testid="btn-save-funcionario"]').click();

    cy.url({ timeout: 15000 }).should('include', '/funcionarios');

    // ==========================================
    // Validação 1: Consistência de Contrato
    // ==========================================
    cy.intercept('POST', '**/api/contratos/calculos/calcular-valor-total').as('calcularLista');
    cy.visit('/contratos');
    cy.get('app-contrato-list').should('be.visible');
    cy.wait('@calcularLista');
    cy.get('.loading-indicator', { timeout: 15000 }).should('not.exist');
    cy.wait(1000); // Dar um respiro final de renderização
    // Encontrar o contrato na lista e ler o faturamento
    cy.contains('.contract-card', descricaoAtualizada).within(() => {
      cy.contains('.metric-label', 'Faturamento').then(($el) => {
        const text = $el.siblings('.metric-value').text();
        cy.wrap(text).as('faturamentoLista');
      });
        
      cy.contains('.metric-label', 'Custo Real').then(($el) => {
        const text = $el.siblings('.metric-value').text();
        cy.wrap(text).as('custoLista');
      });

      // Clicar para visualizar
      cy.get('.btn-view').click();
    });

    cy.url().should('include', '/contratos/');
    cy.wait(2000); // Aguardar cálculo estabilizar

    // Validar no detalhe
    cy.get('body').invoke('text').then((text) => {
      cy.log('BODY TEXT:', text.substring(0, 500));
    });

    cy.get('.alert-error').should('not.exist');

    cy.get('@faturamentoLista').then((faturamentoLista) => {
      cy.contains('.bk-group-total', (faturamentoLista as string).trim()).should('exist');
    });

    cy.get('@custoLista').then((custoLista) => {
      const cleanCusto = (custoLista as string).trim().replace('- ', '');
      cy.contains('.bk-group-total', cleanCusto).should('exist');
    });

    // ==========================================
    // Validação 2: Consistência de Funcionário
    // ==========================================
    cy.visit('/funcionarios');
    cy.wait(2000); // Aguardar renderização estabilizar

    cy.contains('.employee-card', funcNome).within(() => {
      cy.contains('.detail-label', 'Salário Simulado (Mês)').then(($el) => {
        const text = $el.siblings('.detail-value').text();
        cy.wrap(text).as('salarioLista');
      });

      // Clicar para visualizar
      cy.get('.btn-view').click();
    });

    cy.url().should('include', '/funcionarios/');
    cy.wait(2000); // Aguardar renderização estabilizar

    // Validar no detalhe comparando apenas os números
    cy.get('@salarioLista').then((salarioLista) => {
      cy.contains('.metric-label', 'Salário Simulado')
        .siblings('.metric-value')
        .invoke('text')
        .then((salarioDetalhe) => {
          const numLista = (salarioLista as string).replace(/[^\d]/g, '');
          const numDetalhe = salarioDetalhe.replace(/[^\d]/g, '');
          expect(numLista).to.eq(numDetalhe);
        });
    });
  });
});
