# Análise Detalhada: Ponto 5 — API (Criação Automática de Postos + Alocações)

## 1. Problema Atual

### 1.1 Backend Ignora Configurações de Postos

Quando o frontend chama `POST /api/clientes-completos` com:

```json
{
  "cliente": { ... },
  "contrato": { ... },
  "criarPostosAutomaticamente": true,
  "numeroDePostos": 2
}
```

O backend faz:

```csharp
if (input.CriarPostosAutomaticamente) {
  // ❌ Cria 2 postos GENÉRICOS (sem respeitar tipo/alocações/horários)
  for (int i = 0; i < input.NumeroDePostos; i++) {
    var posto = new Posto {
      Nome = $"Posto {i+1}",
      TipoPosto = "PERSONALIZADO",  // default!
      Ativo = true
      // Sem alocações! Sem horários!
    };
    await _postoService.CreateAsync(posto);
  }
}
```

**Problema**:

- Postos são criados **sem alocações** (turnos vazios)
- Tipo padrão é "PERSONALIZADO" (genérico)
- Horários não são inicializados
- Usuário precisa editar cada um manualmente

### 1.2 Alocações Criadas Manualmente (Ineficiente)

Não há endpoint que crie alocações automaticamente baseado em tipo de posto. Usuário precisa:

1. Entrar em cada posto
2. Criar manualmente Alocação 1 (turno da manhã)
3. Criar manualmente Alocação 2 (turno da noite)
4. Definir horários para cada
5. Repetir 2 vezes (se 2 postos)

**Total**: 6 cliques + edições para 2 postos simples.

### 1.3 Ausência de Horários Padrão

Cada tipo de posto deveria ter horários default:

```
12×36:  Manhã 06:00-18:00, Noite 18:00-06:00
8h×3:   Manhã 06:00-14:00, Tarde 14:00-22:00, Noite 22:00-06:00
5×2:    Manhã 06:00-14:00
24h:    00:00-24:00
```

Mas ordem backend não conhece isso, precisa vir do frontend via DTO.

---

## 2. Análise da Regra de Negócio

### 2.1 O que é um "Posto"?

Um **Posto** é:

- Um "grupo de escalas" (ex: vigilância diurna/noturna)
- Com múltiplas **Alocações** (turnos específicos)
- Cada alocação tem horários
- Cada alocação pode ter N pessoas

Exemplo para `12×36`:

```
Posto 1:
├─ Alocação 1: Diurno 06:00-18:00 (1 pessoa)
└─ Alocação 2: Noturno 18:00-06:00 (1 pessoa)
```

### 2.2 Tipo de Posto Define Estrutura

| TipoPosto | Alocações | Horários                              | Pessoas/Aloc |
| --------- | --------- | ------------------------------------- | ------------ |
| **12×36** | 2         | 06:00-18:00, 18:00-06:00              | 1 cada       |
| **8h×3**  | 3         | 06:00-14:00, 14:00-22:00, 22:00-06:00 | 1 cada       |
| **5×2**   | 1         | 06:00-14:00                           | 1            |
| **24h**   | 1         | 00:00-24:00                           | 1            |

### 2.3 Vinculação com `quantidadeIdealPorTurno`

```
Cliente.quantidadeIdealPorTurno = 3 (pessoas por turno)

Para tipo 12×36:
  Alocação 1 (Diurno): 3 pessoas
  Alocação 2 (Noturno): 3 pessoas

Para tipo 5×2:
  Alocação 1 (Diurno): 3 pessoas  (precisa de 3 postos5×2!)
```

Backend **já conhece** `Cliente.QuantidadeIdealPorTurno` via EF Core eager loading. Usa para calcular pessoal.

---

## 3. Solução: Expansão de DTO + Backend Inteligente

### 3.1 Novo DTO: `CreatePostoConfigInput`

Representar estrutura de um tipo de posto:

```csharp
public record CreatePostoConfigInput(
    string TipoPosto,  // "ESCALA_12X36", "ESCALA_5X2_DIURNO", etc
    int QuantidadeAlocacoes,  // 2 para 12×36, 1 para 5×2
    int QuantidadeFuncionariosPorAlocacao,  // 1 ou 2
    int AlocacoesNoturnas,  // 1 para 12×36, 0 para 5×2
    IReadOnlyList<CreateAlocacaoInput>? Horarios = null  // opcional
);

public record CreateAlocacaoInput(
    string Nome,  // "Diurno", "Noturno", "Manhã", etc
    TimeOnly HorarioInicio,  // 06:00
    TimeOnly HorarioFim,     // 18:00
    bool IsNoturna           // true se 18:00-06:00
);
```

### 3.2 Expandir `CreateClienteCompletoDtoInput`

```csharp
public record CreateClienteCompletoDtoInput(
    CreateClienteDtoInput Cliente,
    CreateContratoCompletoDtoInput Contrato,
    bool CriarPostosAutomaticamente = true,
    int NumeroDePostos = 2,
    IReadOnlyList<CreatePostoConfigInput>? PostoConfigs = null  // ← NOVO
);
```

**Frontend envia**:

```json
{
  "cliente": { "nome": "...", "quantidadeIdealPorTurno": 3, ... },
  "contrato": { ... },
  "criarPostosAutomaticamente": true,
  "numeroDePostos": 2,
  "postoConfigs": [
    {
      "tipoPosto": "ESCALA_12X36",
      "quantidadeAlocacoes": 2,
      "quantidadeFuncionariosPorAlocacao": 1,
      "alocacoesNoturnas": 1,
      "horarios": [
        { "nome": "Diurno", "horarioInicio": "06:00", "horarioFim": "18:00", "isNoturna": false },
        { "nome": "Noturno", "horarioInicio": "18:00", "horarioFim": "06:00", "isNoturna": true }
      ]
    },
    { ... }
  ]
}
```

### 3.3 Backend Respeta Configs

```csharp
public async Task<ClienteCompletoDtoOutput> CriarClienteCompletoAsync(
    CreateClienteCompletoDtoInput input)
{
    // 1. Criar cliente
    var cliente = await _clienteService.CreateAsync(input.Cliente);

    // 2. Criar contrato
    var contrato = await _contratoService.CreateAsync(
        input.Contrato with { ClienteId = cliente.Id }
    );

    // 3. Criar postos + alocações
    var postos = new List<Posto>();

    if (input.CriarPostosAutomaticamente && input.PostoConfigs != null)
    {
        foreach (var postoConfig in input.PostoConfigs)
        {
            // a) Criar posto
            var posto = new Posto
            {
                ContratoId = contrato.Id,
                Nome = $"{postoConfig.TipoPosto}",
                TipoPosto = postoConfig.TipoPosto,
                Ativo = true
            };
            await _postoService.CreateAsync(posto);

            // b) Criar alocações baseado em config
            var alocacoes = new List<Alocacao>();

            for (int i = 0; i < postoConfig.QuantidadeAlocacoes; i++)
            {
                var horario = postoConfig.Horarios?[i]
                    ?? _gerarHorarioPadrao(postoConfig.TipoPosto, i);

                var alocacao = new Alocacao
                {
                    PostoId = posto.Id,
                    Nome = horario.Nome,
                    HorarioInicio = horario.HorarioInicio,
                    HorarioFim = horario.HorarioFim,
                    IsNoturna = horario.IsNoturna,
                    QuantidadeFuncionarios = cliente.QuantidadeIdealPorTurno,
                    // ↑ CRÍTICO: usa valor do cliente!
                    Pessoal = new Funcionario[cliente.QuantidadeIdealPorTurno]
                };

                alocacoes.Add(alocacao);
                await _alocacaoService.CreateAsync(alocacao);
            }

            postos.Add(posto);
        }
    }
    else if (input.CriarPostosAutomaticamente)
    {
        // Fallback: criar genéricos (comportamento atual)
        // ...
    }

    return new ClienteCompletoDtoOutput(cliente, contrato, postos);
}

private CreateAlocacaoInput _gerarHorarioPadrao(string tipoPosto, int index)
{
    return tipoPosto switch
    {
        "ESCALA_12X36" => index == 0
            ? new("Diurno", new(06, 00), new(18, 00), false)
            : new("Noturno", new(18, 00), new(06, 00), true),

        "ESCALA_8H_3TURNOS" => index switch
        {
            0 => new("Manhã", new(06, 00), new(14, 00), false),
            1 => new("Tarde", new(14, 00), new(22, 00), false),
            _ => new("Noite", new(22, 00), new(06, 00), true)
        },

        "ESCALA_5X2_DIURNO" => new("Diurno", new(06, 00), new(14, 00), false),

        "ESCALA_24H_UNICO" => new("24h", new(00, 00), new(00, 00), true),

        _ => new("Padrão", new(06, 00), new(18, 00), false)
    };
}
```

---

## 4. Fluxo Frontend → Backend

### 4.1 Modo Automático (usuário escolhe tipos)

**Frontend** (Ponto 4: Wizard):

```typescript
const tiposEscolhidos = ['ESCALA_12X36', 'ESCALA_5X2_DIURNO'];
const postoConfigs = computePostosBuilderConfigs(
  tiposEscolhidos,
  quantidadeIdealPorTurno
);

// postoConfigs = [
//   { tipoPosto: 'ESCALA_12X36', quantidadeAlocacoes: 2, funcPorAloc: 1, ... },
//   { tipoPosto: 'ESCALA_12X36', quantidadeAlocacoes: 2, funcPorAloc: 1, ... },
//   { tipoPosto: 'ESCALA_12X36', quantidadeAlocacoes: 2, funcPorAloc: 1, ... },
//   { tipoPosto: 'ESCALA_5X2_DIURNO', quantidadeAlocacoes: 1, funcPorAloc: 1, ... }
// ]

// NÃO enviar horarios aqui - backend gera padrão
const payload = {
  cliente: { ... },
  contrato: { ... },
  criarPostosAutomaticamente: true,
  postoConfigs: postoConfigs.map(pc => ({
    tipoPosto: pc.tipoPosto,
    quantidadeAlocacoes: pc.quantidadeAlocacoes,
    quantidadeFuncionariosPorAlocacao: pc.quantidadeFuncionariosPorAlocacao,
    alocacoesNoturnas: pc.alocacoesNoturnas
    // ← SEM horarios, deixa backend gerar
  }))
};

this.clienteCompletoService.createCompleto(payload);
```

**Backend**:

- Recebe 4 `PostoConfigs`
- Cria 4 postos
- Cria alocações com horários padrão
- Cada alocação tem `QuantidadeFuncionarios = 3` (do cliente)

**Resultado**:

- 4 postos estruturados
- 7 alocações (2+2+2+1)
- 21 pessoas totais (7 turnos × 3 pessoas)
- Todos com horários corretos

### 4.2 Modo Personalizado (edição avançada)

**Caso Raro**: Usuário quer horários customizados:

```typescript
// Frontend envia horarios customizados
const postoConfigs = [
  {
    tipoPosto: "ESCALA_12X36",
    quantidadeAlocacoes: 2,
    quantidadeFuncionariosPorAlocacao: 2,
    alocacoesNoturnas: 1,
    horarios: [
      {
        nome: "06:00-16:00",
        horarioInicio: "06:00",
        horarioFim: "16:00",
        isNoturna: false,
      },
      {
        nome: "16:00-02:00",
        horarioInicio: "16:00",
        horarioFim: "02:00",
        isNoturna: true,
      },
    ],
  },
];

const payload = { ...postoConfigs };
```

**Backend**: Usa `horarios` se fornecido, senão gera padrão.

---

## 5. Implementação Passo-a-Passo

### 5.1 Backend (C#)

#### 5.1.1 Criar DTOs

- [ ] `CreatePostoConfigInput` record
- [ ] `CreateAlocacaoInput` record
- [ ] Expandir `CreateClienteCompletoDtoInput`

#### 5.1.2 Implementar Gerador de Horários

- [ ] `_gerarHorarioPadrao(tipoPosto, index)` em `ClienteOrquestradorService`
- [ ] Cobre todos 6 tipos de posto

#### 5.1.3 Atualizar `CriarClienteCompletoAsync()`

- [ ] Verificar se `PostoConfigs != null`
- [ ] Loop: Criar posto + alocações
- [ ] Usar `cliente.QuantidadeIdealPorTurno` para pessoal

#### 5.1.4 Validar Input

- [ ] `QuantidadeAlocacoes` vs `PostoConfigs.Length` coerentes?
- [ ] Horários válidos (início < fim)?
- [ ] TipoPosto válido?

#### 5.1.5 Testes de Integração

- [ ] Criar cliente completo com 2 configs → verifica 2 postos + 3 alocações
- [ ] Horários padrão gerados para tipo 12×36
- [ ] Horários customizados respeitados se fornecidos
- [ ] QuantidadeFuncionarios = cliente.QuantidadeIdealPorTurno

### 5.2 Frontend (TypeScript)

#### 5.2.1 Helper para Builder de Configs

- [ ] `computePostosBuilderConfigs(tipos, quantidadeIdeal)` (Ponto 4)
- [ ] Já feito! Usado pelo wizard

#### 5.2.2 Atualizar `cliente-wizard.component.ts`

- [ ] `montarPayloadCompleto()` envia `postoConfigs` array
- [ ] SEM horarios (deixa backend gerar)

#### 5.2.3 Validação de Payload

- [ ] Verificar se `postoConfigs` é enviado corretamente
- [ ] Limpar valores null/undefined

#### 5.2.4 Testes E2E

- [ ] Wizard: criar cliente → contrato → postos criados automaticamente
- [ ] Verificar em dashboard: postos aparecem com alocações

### 5.3 Data Migrations (EF Core)

#### 5.3.1 Nenhuma necessária!

- Estrutura `Posto` + `Alocacao` já existem
- Apenas novo DTO → não é entity

---

## 6. Testes de Validação

### 6.1 Unit: Gerador de Horários

```csharp
[TestMethod]
public void GerarHorarioPadrao_12x36_Indice0_RetornaDiurno()
{
    var result = service._gerarHorarioPadrao("ESCALA_12X36", 0);

    Assert.AreEqual("Diurno", result.Nome);
    Assert.AreEqual(new(06, 0), result.HorarioInicio);
    Assert.AreEqual(new(18, 0), result.HorarioFim);
    Assert.IsFalse(result.IsNoturna);
}

[TestMethod]
public void GerarHorarioPadrao_8h3_Indice2_RetornaNoite()
{
    var result = service._gerarHorarioPadrao("ESCALA_8H_3TURNOS", 2);

    Assert.AreEqual("Noite", result.Nome);
    Assert.IsTrue(result.IsNoturna);
}
```

### 6.2 Integration: Criação Completa

```csharp
[TestMethod]
public async Task CriarClienteCompleto_ComPostoConfigs_CriaPostosComAlocacoes()
{
    // Arrange
    var input = new CreateClienteCompletoDtoInput(
        cliente: new(..., quantidadeIdealPorTurno: 3),
        contrato: new(...),
        criarPostosAutomaticamente: true,
        postoConfigs: new[]
        {
            new CreatePostoConfigInput(
                "ESCALA_12X36", 2, 1, 1, horarios: null
            ),
            new CreatePostoConfigInput(
                "ESCALA_5X2_DIURNO", 1, 1, 0, horarios: null
            )
        }
    );

    // Act
    var result = await service.CriarClienteCompletoAsync(input);

    // Assert
    Assert.AreEqual(2, result.Postos.Count());
    Assert.AreEqual(3, result.Postos[0].Alocacoes.Count);  // 2+1
    Assert.AreEqual(3, result.Postos[0].Alocacoes[0].QuantidadeFuncionarios);
}
```

### 6.3 E2E: Wizard → Postos Criados

```typescript
it('should create client with automatic postos when completing wizard', async () => {
  // Arrange: complete wizard with tipos=['12×36', '5×2']
  await page.fillForm(...wizard data...);

  // Act
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Assert
  const postos = await kontratoDetailPage.getPostos();
  expect(postos.length).toBe(3);  // 3 x 12×36 + 3 x 5×2 (se quantidadeIdeal=3)
  expect(postos[0].alocacoes.length).toBe(2);  // 12×36 tem 2 alocações
});
```

---

## 7. Critérios de Aceite (Ponto 5)

| Critério                   | Verificação                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| **DTO Expandido**          | `CreatePostoConfigInput` com tipoPosto, alocacoes, horários          |
| **Criação Automática**     | Backend cria N postos com M alocações cada                           |
| **Horários Padrão**        | Cada tipo de posto tem horários corretos (12×36: 06-18, 18-06, etc)  |
| **Respeita Quantidade**    | Alocações.QuantidadeFuncionarios = Cliente.QuantidadeIdealPorTurno   |
| **Frontend Setup Correto** | Wizard envia `postoConfigs` array sem horarios (deixa backend gerar) |
| **Fallback**               | Se `PostoConfigs = null`, cria genéricos (comportamento atual)       |
| **Testes**                 | 4 unit + 2 integration + 1 E2E                                       |

---

## 8. Impacto em Ponto 4 (Wizard)

Ponto 4 e 5 são **interdependentes**:

```
Ponto 4 (Wizard):
  • Helper: computePostosByQuantidadeIdeal()
  • Output: postoConfigs array

         ↓ ENVIA PARA

Ponto 5 (Backend):
  • Recebe: postoConfigs array
  • Cria: postos + alocações automáticas
```

**Ordem de Implementação**:

1. Ponto 4: Helper + wizard logic
2. Ponto 5: Backend receptivo + criação

---

## 9. Próximas Ações (Ponto 5)

- [ ] Etapa B.1: Criar DTOs `CreatePostoConfigInput`, `CreateAlocacaoInput`
- [ ] Etapa B.2: Expandir `CreateClienteCompletoDtoInput`
- [ ] Etapa B.3: Implementar `_gerarHorarioPadrao()` (6 tipos)
- [ ] Etapa B.4: Atualizar `CriarClienteCompletoAsync()` para usar `PostoConfigs`
- [ ] Etapa B.5: Validar input DTOs
- [ ] Etapa T.1: Unit tests (horários padrão)
- [ ] Etapa T.2: Integration tests (criação completa)
- [ ] Etapa T.3: E2E test (wizard → postos criados)
- [ ] Documentação: API swagger comments
