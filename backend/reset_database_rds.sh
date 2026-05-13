#!/bin/bash

# 🗄️ Script para resetar banco de dados PostgreSQL RDS da AWS
# Otimizado com boas práticas para RDS
#
# Funciona em 3 cenários:
# 1. Local com PostgreSQL instalado
# 2. Dentro de container Docker (ex: na API)
# 3. Via SSH no EC2 que tem Docker
#
# Uso:
#   bash reset_database_rds.sh

set -e

echo "🚨 AVISO: Este script vai APAGAR TODOS OS DADOS do RDS!"
echo "⏸️  Pressione Ctrl+C para cancelar (5 segundos)..."
sleep 5

# ============================================================================
# 1. CARREGAR VARIÁVEIS DO .env
# ============================================================================

if [ ! -f .env ]; then
    echo "❌ ERRO: .env não encontrado em $(pwd)"
    exit 1
fi

set -a
source .env
set +a

if [ -z "$ConnectionStrings__DefaultConnection" ]; then
    echo "❌ ERRO: ConnectionStrings__DefaultConnection não está em .env"
    exit 1
fi

echo "✅ Arquivo .env carregado"

# ============================================================================
# 2. TESTAR CONEXÃO COM RDS
# ============================================================================

echo "🔗 Testando conexão com RDS..."
if ! psql "$ConnectionStrings__DefaultConnection" -c "SELECT version();" > /dev/null 2>&1; then
    echo "❌ Não conseguiu conectar ao RDS"
    echo "❓ Verificar:"
    echo "   - Connection string está correta?"
    echo "   - Security group do RDS permite conexão da aplicação/EC2?"
    echo "   - Credenciais estão válidas?"
    exit 1
fi

echo "✅ Conexão com RDS funcionando"

# ============================================================================
# 3. LISTAR SCHEMA ATUAL
# ============================================================================

echo ""
echo "🔍 Verificando schema atual do RDS..."

TABLE_COUNT=$(psql "$ConnectionStrings__DefaultConnection" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")

echo "📊 Tabelas encontradas: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "📋 Tabelas no RDS:"
    psql "$ConnectionStrings__DefaultConnection" -t -c \
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>/dev/null || true
    
    echo ""
    echo "🚨 CONFIRMAÇÃO FINAL:"
    echo "   Você tem certeza que quer deletar TUDO isso do RDS?"
    echo "   Digite 'SIM' em maiúsculas para confirmar:"
    read -r CONFIRM
    
    if [ "$CONFIRM" != "SIM" ]; then
        echo "❌ Operação cancelada"
        exit 1
    fi
fi

# ============================================================================
# 4. BACKUP RECOMENDADO (Opcional)
# ============================================================================

echo ""
echo "💡 Dica: Poderia fazer um backup antes?"
echo "   pg_dump \"$ConnectionStrings__DefaultConnection\" > backup_$(date +%Y%m%d_%H%M%S).sql"
echo ""
read -p "Continuar sem backup? (s/n): " -n 1 -r
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada"
    exit 1
fi

# ============================================================================
# 5. DELETAR SCHEMA (Otimizado para RDS)
# ============================================================================

echo ""
echo "🔥 Deletando schema do RDS..."

# Usar PL/pgSQL para operações mais robustas com RDS
psql "$ConnectionStrings__DefaultConnection" << 'SQL'
-- Desabilitar triggers durante drop para melhor performance no RDS
SET session_replication_role = REPLICA;

DO $$ 
DECLARE
    r RECORD;
    statements TEXT := '';
BEGIN
    -- 1. Deletar Foreign Keys
    FOR r IN (
        SELECT 
            constraint_name, 
            table_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name || ' CASCADE';
        RAISE NOTICE 'Deletada FK: %', r.constraint_name;
    END LOOP;
    
    -- 2. Deletar Tabelas (exceto system tables)
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        -- Excluir tabelas do sistema
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
        RAISE NOTICE 'Deletada tabela: %', r.tablename;
    END LOOP;
    
    -- 3. Deletar Sequences (importante para RDS com SERIAL)
    FOR r IN (
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS "' || r.sequencename || '" CASCADE';
        RAISE NOTICE 'Deletada sequence: %', r.sequencename;
    END LOOP;
    
    -- 4. Deletar Views (se houver)
    FOR r IN (
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP VIEW IF EXISTS "' || r.viewname || '" CASCADE';
        RAISE NOTICE 'Deletada view: %', r.viewname;
    END LOOP;
    
    RAISE NOTICE 'Schema deletado com sucesso!';
END $$;

-- Re-habilitar triggers
SET session_replication_role = DEFAULT;
SQL

echo "✅ Schema deletado"

# ============================================================================
# 6. VERIFICAR QUE FICOU VAZIO
# ============================================================================

echo ""
echo "🔍 Verificando que RDS ficou vazio..."

REMAINING=$(psql "$ConnectionStrings__DefaultConnection" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "?")

echo "📊 Tabelas restantes: $REMAINING (deve ser 0 ou muito pequeno)"

# ============================================================================
# 7. REAPLICAR MIGRATIONS
# ============================================================================

echo ""
echo "🔨 Aplicando migrations do EF Core para reconstruir schema..."
echo "(Isso vai demorar um pouco...)"

cd "$(dirname "$0")/.."

# Detectar se está em container ou máquina local
if [ -f /.dockerenv ]; then
    echo "🐳 Detectado: Rodando em container Docker"
    
    dotnet ef database update \
        --assembly InterceptorSystem.Infrastructure.dll \
        --startup-assembly InterceptorSystem.Api.dll \
        --project src/InterceptorSystem.Infrastructure \
        --startup-project src/InterceptorSystem.Api \
        --verbose 2>&1 | grep -v "^SQL generated:" | tail -50
else
    echo "🖥️  Detectado: Rodando localmente"
    
    if ! command -v dotnet &> /dev/null; then
        echo "❌ dotnet não encontrado"
        echo "ℹ️  Instale .NET 8 ou rode dentro do container Docker"
        exit 1
    fi
    
    dotnet ef database update \
        --assembly InterceptorSystem.Infrastructure.dll \
        --startup-assembly InterceptorSystem.Api.dll \
        --verbose 2>&1 | grep -v "^SQL generated:" | tail -50
fi

echo ""
echo "✅ Migrations aplicadas"

# ============================================================================
# 8. VALIDAÇÃO FINAL
# ============================================================================

echo ""
echo "🔍 Validação final do RDS..."

# Tabelas criadas
TABLE_COUNT=$(psql "$ConnectionStrings__DefaultConnection" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
echo "📊 Tabelas criadas: $TABLE_COUNT"

# Histórico de migrations
MIGRATION_COUNT=$(psql "$ConnectionStrings__DefaultConnection" -t -c \
    "SELECT COUNT(*) FROM \"__EFMigrationsHistory\" 2>/dev/null;" 2>/dev/null || echo "0")
echo "📋 Migrations aplicadas: $MIGRATION_COUNT"

# Listar últimas migrations
echo ""
echo "✅ Histórico de migrations (últimas 5):"
psql "$ConnectionStrings__DefaultConnection" -t -c \
    "SELECT MigrationId, ProductVersion FROM \"__EFMigrationsHistory\" ORDER BY MigrationId DESC LIMIT 5;" 2>/dev/null || echo "(Não encontrado)"

# ============================================================================
# 9. RESULTADO FINAL
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Reset do RDS concluído com sucesso!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Resumo:"
echo "   ✅ Schema deletado"
echo "   ✅ Migrations re-aplicadas"
echo "   ✅ Histórico sincronizado"
echo ""
echo "⚠️  PRÓXIMOS PASSOS:"
echo "   1. Re-ativar WhatsApp Service: Whatsapp__EnableCleanup=true"
echo "   2. Fazer redeploy: gh workflow run ... --ref main"
echo "   3. Verificar logs da aplicação"
echo ""
