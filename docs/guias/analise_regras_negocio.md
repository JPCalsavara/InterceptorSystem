# Análise e Engenharia de Prompts para Modificação de Regras de Negócio

Este documento descreve as anotações feitas pelo Product Owner, como elas impactam/desviam do sistema atual (descrito no README.md), e fornece um roteiro estruturado sob a forma de **Engenharia de Prompt para Agentes IA**, organizando a implementação e testes passo a passo.

---

## 1. Análise Comparativa: Anotações vs. Implementação Atual (README.md)

| Anotação | Implementação Atual | Impacto / Modificação Necessária |
| :--- | :--- | :--- |
| `06 as 18 diurno`, `18 as 06 noturno`, `12 h` | Hoje existe a regra estrita em `PostoDeTrabalho`: *Diferença de HorarioInicio e Fim deve ser exatemente 12h*. | Manter suporte a 12h, mas este deixará de ser o único padrão. |
| `Comercial de seg a quinta 07 as 17 e sexta feira 07 as 16` | Barreiras no backend evitam horas flexíveis ou diferentes de 12h. | **Mudança Crítica:** Remover a validação de 12h cravadas no `PostoDeTrabalho`. Permitir dias da semana com horas distintas. |
| `alcalá 06 as 14 / 14 as 22 / 22 as 06 folguista` | Não suportado (a API retorna Erro 400). | Permitir turnos de 8h (padrão 6x1 / "Escala Alcalá"). Adicionar suporte ao papel "Folguista" (alocação dinâmica para cobrir folgas). |
| `mudar condominio para clientes` | O sistema inteiro usa o Domínio `Condominio`. | **Refatoração Global:** Renomear `Condominio` para `Cliente` no Backend (DbSets, Entidades, DTOs, Controllers) e no Frontend (Rotas, Telas, Variáveis). |
| `Posto de trabalho espaço do... Guerini pode ter em Porto feliz, boituva, Tatui` | `PostoDeTrabalho` atual é praticamente uma "vaga de turno" de um Condomínio. | **Reestruturação Estrutural:** Alterar o conceito para que o `Cliente` (ex-Guerini) tenha múltiplos `Locais de Trabalho` (ex: Maquinas Boituva, Loteamento Girassol). |
| `Alocação são o meu posto... e Alocação vai ser diárias` | A base atual prevê alocações por dias (não sequenciais na mesma pessoa), ligado ao salário do contrato. | **Modelo Financeiro:** Passar a tratar e calcular as alocações como "Diárias" isoladas. |
| `pm 350,00` e `vigia avulso 150,00` / `Adicionar tag a funcionário`  | Salário base é puramente tirado do Contrato pelo número de Vagas. Não há suporte a preço fixo por diária do funcionário. | **Nova Funcionalidade:** Adicionar entidade/campo de `Tags` (ex: `[PM]`, `[Vigia Avulso]`) ao `Funcionário` com impacto no cálculo da sua diária (R$ 350 ou R$ 150). |
| `Nome do sidebar vai ser cronograma` | Provavelmente "Alocações" na sidebar do Angular. | Modificar a interface de navegação no Angular (Label e possivelmente ícone). |

---

## 2. Roteiro Direcional para o Agente (Prompts)

Para executar esta refatoração maciça com sucesso e de forma orquestrada, copie e cole os prompts a seguir em sequência. Eles orientam o agente a focar num sub-módulo de cada vez de forma iterativa, mitigando quebra sistemática do código.

### Prompt de Fase 1: Refatoração de Domínio (Condominio -> Cliente)
> "Inicie o Modo de Execução (EXECUTION) para a Fase 1: Refatoração de Domínio. Você deve renomear todas as referências da entidade `Condominio` para `Cliente` na aplicação .NET. Comece mapeando as entidades em `InterceptorSystem.Domain`. Altere o `DbContext`, arquivos de migration (gere um novo se necessário para `RenameTable`), os DTOs em `Application` e os Controllers. Depois, vá para o Frontend Angular Angular e altere pastas, services, rotas de `condominios` para `clientes`. Certifique-se de que `dotnet build`, `dotnet test` e `ng build` não apresentem erros apóes essa refatoração estrutural."

### Prompt de Fase 2: Flexibilização de Turnos e Postos
> "Inicie o Modo de Execução. Modifique a lógica do `PostoDeTrabalho`. Primeiro, remova a validação que exige exatamente 12h de intervalo. Segundo, expanda a modelagem do Posto para suportar 'Local Físico/Unidade' (dado que um Cliente engloba múltiplos locais, como diferentes cidades). O PostoDeTrabalho deve permitir: (1) Turnos de 12h, (2) Horário Comercial (Seg-Qui padrão e Sexta diferenciado) e (3) Escalas de 8h (como 06-14, 14-22, 22-06). Ajuste os testes unitários da camada de Domain na API para contemplar a aceitação desses diferentes turnos sem falhar."

### Prompt de Fase 3: Tags, Valores e Folguistas
> "Inicie o Modo de Execução. Adicione a funcionalidade de `Tags` ao modelo de `Funcionário`. Um funcionário pode ter tags específicas (ex: 'PM' ou 'Vigia Avulso') que alteram diretamente o valor do seu dia (R$ 350,00 ou R$ 150,00). Altere o `ContratoCalculosController` e a lógica financeira para utilizar o modelo de 'Diárias' e consultar o valor definido na Tag do funcionário ao invés de usar divisão genérica base do contrato. Modifique o Frontend para permitir a inserção de Tags multi-select na tela de Cadastro de Funcionário."

### Prompt de Fase 4: Frontend "Cronograma" e UX de Alocações
> "Inicie o Modo de Execução. Acesse o projeto Angular. Renomeie a seção de 'Alocações' na Sidebar (no componente Sidebar correspondente) para aparecer 'Cronograma'. Revise os componentes da tela de Cronograma para deixar claro que a alocação agora representa uma 'Diária' no posto de trabalho atual. Garanta que o tipo de funcionário 'Folguista' possa ser alocado perfeitamente para preencher furos de outras escalas de 12x36, 8h ou Comercial. Crie testes unitários usando Jasmine no frontend para garantir que a label do layout da sidebar atualizou."

### Prompt de Fase 5: QA e Testes E2E (Verificação)
> "Inicie o Modo de Verificação (VERIFICATION). Execute todos os testes unitários (`dotnet test`) de Domain e Application para garantir que as reestruturações não quebraram as regras subjacentes. Revise os formulários de locação da API e dispare validações de Dry-Run contra o `condominios-completos` (agora `clientes-completos`) para testar o contrato sendo criado com um Cliente e Locais diferentes espalhados usando as tags com valores novos de PM R$ 350. Escreva um Walkthrough resumindo os resultados."
