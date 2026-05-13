# 🗄️ Guia de Reset do Banco de Dados

## Situação Atual

- ✅ WhatsApp service desativado (via `Whatsapp:EnableCleanup` em `.env`)
- ⚠️ Banco de dados com histórico de migrations desincronizado
- ✅ Workflow atualizado para tratar erros "already exists" gracefully

## Como Resetar o Banco de Dados

Existem 2 opções:

### ✅ Opção 1: Via SSH no EC2 → RDS (Recomendado)

```bash
# No seu computador local
ssh -i ~/.ssh/ec2_key.pem ubuntu@<seu-ec2-host>

# No EC2 (ubuntu@host)
cd ~/interceptor-system

# Opção 1a: Se tiver psql instalado no EC2
bash backend/reset_database_rds.sh

# Opção 1b: Usar Docker do EC2 (sem precisar de psql)
docker run --rm \
  --network host \
  --env-file .env \
  -v $(pwd)/backend:/app \
  postgres:15 \
  bash /app/reset_database_rds.sh

# Depois desconecta
exit
```

**O que acontece:**
1. SSH conecta ao EC2
2. Script local (`psql` ou container `postgres:15`) se conecta REMOTAMENTE ao RDS via connection string
3. Deleta todas as tabelas do RDS
4. Aplica migrations EF Core no RDS
5. Valida resultado

**Tempo estimado:** 2-5 minutos

---

### ✅ Opção 2: Dentro do Container da API (Alternativa)

Se o container da API estiver rodando:

```bash
# No seu computador local
ssh -i ~/.ssh/ec2_key.pem ubuntu@<seu-ec2-host>

# No EC2
cd ~/interceptor-system
docker ps  # Pegar o container ID da API

# Entrar no container da API
docker exec -it <api-container-id> bash

# Dentro do container (tem psql + dotnet)
cd /app
bash reset_database_rds.sh

# Sair
exit
```

**Vantagem:** Container da API já tem `psql` + `dotnet ef` instalados
**Desvantagem:** Precisa do container rodando

---

### ✅ Opção 3: SSH Direto no RDS (Para debug apenas)

Se precisar fazer query direto no RDS sem migrations:

```bash
# De qualquer lugar que tenha psql
psql "postgresql://user:password@rds-endpoint:5432/database"

# Ver todas as tabelas
\dt

# Ver histórico de migrations
SELECT * FROM "__EFMigrationsHistory" ORDER BY MigrationId;

# Deletar tudo (CUIDADO!)
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT ' || r.constraint_name || ' CASCADE';
    END LOOP;
    
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || r.tablename || ' CASCADE';
    END LOOP;
END $$;
```

---

## Próximos Passos Depois do Reset

1. **Verificar que tudo foi deletado:**
   ```bash
   psql <connection-string> -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
   ```
   Deve retornar um número pequeno (apenas tabelas do sistema)

2. **Verificar que migrations foram aplicadas:**
   ```bash
   psql <connection-string> -c "SELECT COUNT(*) FROM \"__EFMigrationsHistory\";"
   ```
   Deve retornar ~15+ (todas as migrations aplicadas)

3. **Re-ativar WhatsApp Service** (no `.env` do EC2):
   ```bash
   # SSH no EC2
   ssh ubuntu@<host>
   cd ~/interceptor-system
   
   # Editar ou criar .env com:
   Whatsapp__EnableCleanup=true
   ```

4. **Fazer redeploy da API:**
   ```bash
   # Via GitHub Actions (recomendado)
   gh workflow run "CD — Deploy API (Docker Compose)" --ref main
   
   # Ou manual no EC2:
   docker-compose down && docker-compose up -d
   ```

---

## ⚠️ Considerações Importantes

- **Backup:** Antes de deletar, considere fazer um backup do RDS:
  ```bash
  pg_dump "postgresql://user:password@rds-host/database" > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- **Dados Perdidos:** Este reset **DELETA TODOS OS DADOS** do banco. Não há undo.

- **Migrations:** Depois do reset, todas as migrations serão re-aplicadas do zero. Isso garante que o histórico esteja correto.

- **Aplicação:** A aplicação pode ter erros enquanto migrations estão sendo aplicadas. Isso é normal, espere completar.

---

## Se Algo Der Errado

1. **Erro de conexão:** Verificar que `.env` tem a connection string correta
2. **Permission denied:** Verificar permissões no EC2 e Docker
3. **Migrations ainda falhando:** Rodar diagnostics:
   ```bash
   docker exec -it <api-container> bash -c "
     dotnet ef migrations list --assembly InterceptorSystem.Infrastructure.dll
     dotnet ef database info --assembly InterceptorSystem.Infrastructure.dll
   "
   ```

---

## Status Atual da Aplicação

- ✅ **Frontend:** Deployando normalmente
- ✅ **Backend:** Deployando com tratamento de erros de migrations
- ⚠️ **WhatsApp Service:** Desativado (seguro, retomará quando banco estiver saudável)
- 🔄 **Banco de Dados:** Pronto para reset e sincronização

**Próximo passo:** Execute `bash backend/reset_database_remote.sh` para resetar o banco
