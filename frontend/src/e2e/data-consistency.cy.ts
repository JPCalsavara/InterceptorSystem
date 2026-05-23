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
    cy.get('input[formControlName="numeroPostosFisicos"]').clear().type('1');
    cy.get('select[data-cy="contrato-tipo-posto"]').first().select('ESCALA_12X36');
    cy.get('input[formControlName="valorDiariaCobrada"]').first().clear().type('250');
    
    // Aguardar o debouce e cálculo retornarem
    cy.intercept('POST', '**/api/contratos/calculos/calcular-valor-total').as('calcular');
    // Adicionar um type na descrição para forçar trigger do valueChanges
    const descricaoAtualizada = contratoDesc + ' atualizado';
    cy.get('textarea[formControlName="descricao"]').clear().type(descricaoAtualizada);
    
    cy.wait('@calcular');
    
    // Aguardar que o valor total não seja zero (ou seja, cálculo com 250 de diária)
    cy.get('[data-cy="valor-total-mensal"]', { timeout: 10000 }).should('not.contain', '0,00');
    
    cy.intercept('POST', '**/api/contratos').as('createContrato');
    cy.get('[data-cy="btn-save-contrato"]').click();
    
    cy.wait('@createContrato');

    cy.url({ timeout: 15000 }).should('not.include', '/novo');
    cy.url({ timeout: 15000 }).should('include', '/contratos');
    cy.contains(descricaoAtualizada).should('exist');

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
    cy.get('select[formControlName="contratoId"]').should('contain', descricaoAtualizada);
    cy.get('select[formControlName="contratoId"]').select(descricaoAtualizada);
    
    cy.get('select[formControlName="tipoFuncionario"]').select('CLT');
    cy.get('select[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS');
    cy.get('[data-cy="btn-save-funcionario"]').click();

    cy.url({ timeout: 15000 }).should('include', '/funcionarios');

    // ==========================================
    // Validação 1: Consistência de Contrato
    // ==========================================
    cy.visit('/contratos');
    cy.get('app-contrato-list').should('be.visible');
    
    // Garantir que a lista carregou os contratos
    cy.get('.contract-card').should('have.length.gt', 0);

    // Encontrar o contrato na lista e ler o faturamento
    cy.contains('.contract-card', descricaoAtualizada).within(() => {
      // Ignorar o 0 inicial enquanto os cálculos assíncronos não terminam
      cy.contains('.metric-label', 'Faturamento')
        .siblings('.metric-value')
        .should('not.have.text', 'R$ 0,00')
        .and('not.have.text', 'R$0.00');

      cy.contains('.metric-label', 'Faturamento').then(($el) => {
        const text = $el.siblings('.metric-value').text().trim();
        cy.log('FATURAMENTO LISTA: ' + text);
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

    cy.contains('.employee-card', funcNome).within(() => {
      cy.contains('.detail-label', 'Salário Simulado (Mês)').then(($el) => {
        const text = $el.siblings('.detail-value').text();
        cy.wrap(text).as('salarioLista');
      });

      // Clicar para visualizar
      cy.get('.btn-view').click();
    });

    cy.url().should('include', '/funcionarios/');

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
