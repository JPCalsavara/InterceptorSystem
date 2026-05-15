# Task Plan: Fix Deploy Script — Host can't be null + Bash Syntax Error

**Objetivo:** Corrigir dois bugs no script de deploy EC2 que causam falha na aplicação de migrations EF Core.
**Branch:** chore/docs-cleanup-and-reorg
**Data de início:** 2026-05-15

---

## Análise dos Erros

### Bug 1 — Bash syntax error near unexpected token `}`
**Linha 169** do `deploy-api.yml`:
```bash
fi
rm -f "$MIGRATION_LOG"
}          # ← } órfã, sem abertura correspondente
```
O bloco `if/else/fi` está correto, mas há um `}` sobrando logo depois do `rm`. Isso quebra o heredoc inteiro.

### Bug 2 — System.ArgumentException: Host can't be null
O comando docker run tenta usar `dotnet ef database update` com flags de assembly que não funcionam dentro de um container publicado:
```bash
dotnet ef database update --assembly ... --startup-assembly ...
```
A imagem Docker **não tem a CLI do EF** instalada (`dotnet ef`). Precisa usar `dotnet InterceptorSystem.Api.dll` com migration automática no startup, ou rodar via `dotnet ef` com a ferramenta instalada.

**Causa real:** A `ConnectionString` é encontrada no `.env` (✅ grep passou), mas o container não consegue parsear o formato da variável. O mais provável é que a env var no `.env` tenha formato `KEY="value"` com aspas, que o `--env-file` do Docker **não strippa** — gerando `Host=host;` correto mas às vezes a var toda como string vazia se houver newline/encoding errado.

---

## Fases

| # | Fase | Arquivos Afetados | Status |
|---|------|-------------------|--------|
| 1 | Corrigir `}` órfão (syntax error) | `.github/workflows/deploy-api.yml` | ⏳ Pendente |
| 2 | Corrigir comando de migration (substituir `dotnet ef` por startup migration) | `.github/workflows/deploy-api.yml` | ⏳ Pendente |
| 3 | Adicionar debug de env vars para diagnóstico futuro | `.github/workflows/deploy-api.yml` | ⏳ Pendente |
| 4 | Commit e push | — | ⏳ Pendente |

---

## Decisões Técnicas

- Substituir `dotnet ef database update` por chamada ao próprio binário da API com env var `APPLY_MIGRATIONS_ONLY=true`, OU usar o padrão mais simples de aplicar migrations no startup da API via `app.MigrateDatabase()`.
- Verificar se a API já aplica migrations no startup antes de escolher a abordagem.

## Bloqueios e Riscos
- Ver findings.md
