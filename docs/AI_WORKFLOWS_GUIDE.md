# Guia de IA e Workflows Automatizados

Este repositório está fortemente orquestrado para ser desenvolvido em parceria com Agentes de Inteligência Artificial. Foram criadas *Skills* (habilidades) customizadas para garantir que a IA não gere código "espaguete" ou destrua as diretrizes arquiteturais.

Abaixo estão os fluxos de trabalho (Workflows) disponíveis e como invocá-los.

---

## 1. Os 3 Grandes Orquestradores (Workflows)

Sempre que iniciar uma tarefa, comece pedindo para a IA executar um destes três workflows. Eles gerenciam sozinhos o planejamento, execução e versionamento.

### 🚀 `full-workflow`
- **Para que serve:** Criar novas features de ponta a ponta (ex: "Criar módulo de faturamento").
- **O que ele faz:** 
  1. Cria plano de ação (`task_plan.md`);
  2. Executa Backend e Frontend iterativamente;
  3. Gera testes;
  4. Redireciona logs para arquivos temporários economizando tokens;
  5. Cria Pull Request via `git-flow`.
- **Como pedir:** *"Inicie a full-workflow para construir a funcionalidade de exclusão de clientes."*

### 🐞 `bug-workflow`
- **Para que serve:** Investigação e correção cirúrgica de bugs.
- **O que ele faz:**
  1. Root Cause Analysis (Investiga logs e anota o erro no `findings.md`);
  2. **Test-First:** Tenta criar um teste que reproduza a falha *antes* de corrigir o código;
  3. Aplica a correção;
  4. Valida se não causou regressão no projeto e abre PR.
- **Como pedir:** *"Use a bug-workflow para achar o erro de null reference que ocorre ao salvar o Posto."*

### 📄 `docs-workflow`
- **Para que serve:** Gestão de Documentos Acadêmicos, PMI, PMP e Arquitetura.
- **O que ele faz:**
  1. Usa a pasta `docs/docs-pmi-base` estritamente como *Template* (somente leitura);
  2. Edita ou cria os artefatos reais dentro de `docs/docs-pmp-uml`;
  3. Preza pela formatação impecável de Markdown, coerência de escopo e tom de voz executivo.
- **Como pedir:** *"Utilize a docs-workflow para atualizar o cronograma na nossa EAP baseada nas novas datas."*

---

## 2. Skills de Validação e Qualidade (Injetadas)

Durante a execução dos orquestradores acima, a IA invoca automaticamente as skills abaixo para garantir a qualidade de cada bloco.

- **`create-endpoint`**: Obriga a geração do *Vertical Slice* no C# (DTO, AppService, Repositório, DbContext) sem uso excessivo de CQRS. Proíbe *try-catch* e validações gigantes nos Controllers (Thin Controllers).
- **`angular-component`**: Exige a criação de **Single-File Components** (`.ts` apenas) dentro de subpastas `components/`. Proíbe layouts baseados em frameworks engessados e cobra responsividade Mobile feita matematicamente via `Flexbox/Grid`.
- **`generate-tests`**: Força o padrão da Pirâmide de Testes. Usa Cypress Component Tests para validar visualmente flexbox no mobile e Desktop, E2E para jornada do usuário, e xUnit para regras sólidas de domínio.

---

## 3. A Estratégia de "Token Efficiency"
A regra suprema deste projeto é **não poluir o contexto da IA**.
A IA está proibida de jogar logs de builds ou testes inteiros no chat. Ela utiliza redirecionamento de bash (`> temp.log`), lê apenas a linha da falha, anota e apaga o log. Além disso, ela utiliza `task_plan.md`, `findings.md` e `progress.md` como memória de disco, "lembrando" onde parou sem precisar que você repita comandos.
