# 🗄️ Guia de Reset do Banco de Dados

## Situação Atual

- ✅ WhatsApp service desativado (via `Whatsapp:EnableCleanup` em `.env`)
- ⚠️ Banco de dados com histórico de migrations desincronizado
- ✅ Workflow atualizado para tratar erros "already exists" gracefully

## Como Resetar o Banco de Dados

Existem 2 opções:

### ✅ Opção 1: Via SSH no EC2 (Recomendado)

```bash
# No seu computador local:
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem

# Fazer push dos scripts atualizados (se não estiverem em prod ainda)
git add backend/reset_database*.sh
git commit -m "chore: add database reset scripts"
git push

# Executar reset remoto via SSH
bash backend/reset_database_remote.sh
```

**O que acontece:**
1. Conecta via SSH ao EC2
2. Dentro do container Docker, deleta TODAS as tabelas
3. Executa `dotnet ef database update` para recriar schema do zero
4. Valida que tudo foi criado corretamente

**Tempo estimado:** 2-5 minutos

---

### ✅ Opção 2: Direto via SSH (Manual)

Se preferir fazer passo a passo:

```bash
# Conectar ao EC2
ssh -i ~/.ssh/ec2_key.pem ubuntu@<seu-ec2-host>

# Ir para o diretório
cd ~/interceptor-system

# Entrar no container Docker
docker ps  # Pegar o ID da API

docker exec -it <container-id> bash

# Dentro do container, rodar:
cd /app
bash reset_database.sh
```

---

### ✅ Opção 3: SQL Direto (Para debug)

Se precisar inspecionar ou fazer de forma manual:

```bash
# Conectar ao banco
psql "postgresql://user:password@rds-host:5432/database"

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
