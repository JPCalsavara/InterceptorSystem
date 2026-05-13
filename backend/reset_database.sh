#!/bin/bash

# Script para resetar completamente o banco de dados PostgreSQL RDS
# Usa EF Core para fazer drop e recrear com todas as migrations do zero
# 
# Uso (local):
#   bash reset_database.sh
#
# Uso (remoto via SSH):
#   ssh -i ~/.ssh/ec2_key.pem user@host "cd /path/to/repo && bash reset_database.sh"

set -e

echo "🚨 AVISO: Este script vai APAGAR todos os dados do banco de dados!"
echo "⏸️  Pressione Ctrl+C para cancelar (5 segundos)..."
sleep 5

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ ERRO: .env não encontrado em $(pwd)"
    exit 1
fi

# Carregar variáveis
set -a
source .env
set +a

# Verificar variáveis críticas
if [ -z "$ConnectionStrings__DefaultConnection" ]; then
    echo "❌ ERRO: ConnectionStrings__DefaultConnection não está definida em .env"
    exit 1
fi

echo "✅ Arquivo .env carregado"
echo "🗄️ Conectando ao banco de dados..."

# Testar conexão
if ! psql "$ConnectionStrings__DefaultConnection" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ ERRO: Não conseguiu conectar ao banco de dados"
    echo "Connection string: $ConnectionStrings__DefaultConnection"
    exit 1
fi

echo "✅ Conexão com banco funcionando"

# Contar tabelas existentes antes
echo "🔍 Verificando schema atual..."
TABLE_COUNT=$(psql "$ConnectionStrings__DefaultConnection" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
echo "📊 Tabelas encontradas: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    # Listar tabelas
    echo "📋 Tabelas:"
    psql "$ConnectionStrings__DefaultConnection" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>/dev/null || true
    
    # Confirmar delete
    echo ""
    echo "🚨 CONFIRMAÇÃO FINAL: Você tem certeza que quer deletar TUDO?"
    echo "   Digite 'SIM' em maiúsculas para confirmar:"
    read -r CONFIRM
    
    if [ "$CONFIRM" != "SIM" ]; then
        echo "❌ Operação cancelada pelo usuário"
        exit 1
    fi
    
    echo "🔥 Deletando todas as tabelas e schema..."
    
    # Drop all tables
    psql "$ConnectionStrings__DefaultConnection" << 'SQL'
DO $$ DECLARE
    r RECORD;
BEGIN
    -- Drop all foreign keys first
    FOR r IN (SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT ' || r.constraint_name || ' CASCADE';
    END LOOP;
    
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '__EFMigrationsHistory') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || r.tablename || ' CASCADE';
    END LOOP;
    
    -- Drop __EFMigrationsHistory to reset migration history
    EXECUTE 'DROP TABLE IF EXISTS "__EFMigrationsHistory" CASCADE';
    
    -- Drop all sequences
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || r.sequencename || ' CASCADE';
    END LOOP;
    
    RAISE NOTICE 'Schema limpo com sucesso!';
END $$;
SQL
    
    echo "✅ Schema deletado"
else
    echo "⚠️  Nenhuma tabela encontrada - schema já está vazio"
fi

# Agora rodar migrations para recriar schema do zero
echo ""
echo "🔨 Aplicando migrations para recriar schema do zero..."
echo "(Isso pode levar alguns minutos...)"

cd "$(dirname "$0")/.."

# Se estiver dentro de um container Docker
if [ -f /.dockerenv ]; then
    echo "🐳 Executando dentro de container Docker"
    dotnet ef database update \
        --assembly InterceptorSystem.Infrastructure.dll \
        --startup-assembly InterceptorSystem.Api.dll \
        --project src/InterceptorSystem.Infrastructure \
        --startup-project src/InterceptorSystem.Api \
        --verbose
else
    echo "🖥️  Executando no ambiente local"
    # Se estiver no Linux/Mac, pode rodara direto
    if command -v dotnet &> /dev/null; then
        dotnet ef database update \
            --assembly InterceptorSystem.Infrastructure.dll \
            --startup-assembly InterceptorSystem.Api.dll \
            --project src/InterceptorSystem.Infrastructure \
            --startup-project src/InterceptorSystem.Api \
            --verbose
    else
        echo "❌ dotnet não encontrado. Use dentro do container:"
        echo "docker exec -it <container-id> bash /app/reset_database.sh"
        exit 1
    fi
fi

echo ""
echo "✅ Migrations aplicadas com sucesso!"

# Verificar tabelas criadas
echo ""
echo "🔍 Verificando novo schema..."
TABLE_COUNT=$(psql "$ConnectionStrings__DefaultConnection" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
echo "📊 Tabelas criadas: $TABLE_COUNT"

# Verificar migration history
echo ""
echo "📋 Histórico de migrations aplicadas:"
psql "$ConnectionStrings__DefaultConnection" -t -c "SELECT MigrationId, ProductVersion FROM \"__EFMigrationsHistory\" ORDER BY MigrationId;" 2>/dev/null || echo "⚠️  Tabela de histórico não encontrada"

echo ""
echo "🎉 Reset do banco de dados concluído com sucesso!"
echo "⚠️  IMPORTANTE: Re-ative WhatsApp service no .env: Whatsapp__EnableCleanup=true"
