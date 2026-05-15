# Findings: Fix Deploy Script

## Bug 1 — Bash syntax error `}` ímpar (linha 169 do deploy-api.yml)

O bloco `if/else/fi` da seção de migrations termina corretamente com `fi` e `rm -f "$MIGRATION_LOG"`, mas há uma chave `}` órfã logo depois:
```bash
fi
rm -f "$MIGRATION_LOG"
}    ← linha 169 — não existe nenhum { correspondente
```
Isso quebra o heredoc `<< 'DEPLOY_SCRIPT'` inteiro — **todo o script no EC2 falha na linha 33**, o que explica o erro `-bash: line 33: syntax error near unexpected token }`.

## Bug 2 — `dotnet ef database update` dentro do container (causa raiz do "Host can't be null")

O script tentava rodar `dotnet ef database update` dentro da imagem Docker de produção. Isso falha por dois motivos:
1. A imagem de produção **não tem a CLI do EF** instalada (só o runtime).
2. O formato de `--env-file` do Docker envia variáveis com possíveis aspas literais se o `.env` usar `KEY="value"`, corrompendo a connection string.

**Boa notícia:** O `Program.cs` já possui auto-migrate no startup (linha 126–143):
```csharp
if (!builder.Environment.IsEnvironment("Testing") && context.Database.GetPendingMigrations().Any())
    context.Database.Migrate();
```
Portanto, **não é necessário rodar `dotnet ef` manualmente** no script de deploy — as migrations serão aplicadas automaticamente quando o container subir.

## Solução

1. Remover o bloco inteiro de migration manual do script de deploy (a lógica no `docker run ... dotnet ef ...`).
2. Remover a `}` órfã (linha 169).
3. Manter apenas as validações de `.env` e prosseguir direto para o `docker compose up`.
