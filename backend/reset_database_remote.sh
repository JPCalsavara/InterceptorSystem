#!/bin/bash

# Script para resetar banco de dados via SSH no EC2
# Executa reset_database.sh dentro do container Docker da API

set -e

echo "📌 Script de Reset de Banco de Dados (via SSH para EC2)"
echo ""

# Variáveis de conexão (usar secrets do GitHub ou argumentos)
EC2_KEY="${EC2_KEY:-.ssh/ec2_key.pem}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_HOST="${EC2_HOST:-localhost}"
WORK_DIR="/home/ubuntu/interceptor-system"

echo "🔗 Conectando ao EC2: $EC2_USER@$EC2_HOST"

# SSH para EC2 e rodar o reset dentro do container
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'REMOTE_SCRIPT'

echo "📍 Chegou no EC2"

if [ ! -d /home/ubuntu/interceptor-system ]; then
    echo "❌ Diretório /home/ubuntu/interceptor-system não encontrado"
    exit 1
fi

cd /home/ubuntu/interceptor-system

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado"
    exit 1
fi

# Carregar .env
set -a
source .env
set +a

echo "✅ Arquivo .env carregado"

# Executar reset dentro do container (que já tem dotnet)
echo ""
echo "🐳 Executando reset dentro do container Docker..."
echo ""

docker run --rm \
    --network host \
    --env-file .env \
    -e "ASPNETCORE_ENVIRONMENT=Production" \
    -v "$(pwd)/backend:/app" \
    interceptor-api:latest \
    bash -c "
        cd /app
        
        echo '🚨 AVISO: Deletando TODAS as tabelas do banco de dados'
        sleep 3
        
        # Listar tabelas antes
        echo '📊 Tabelas antes:'
        psql \"\$ConnectionStrings__DefaultConnection\" -t -c \"SELECT table_name FROM information_schema.tables WHERE table_schema='public' LIMIT 20;\" 2>/dev/null || echo '(sem conexão)'
        
        # Deletar schema
        echo '🔥 Deletando schema...'
        psql \"\$ConnectionStrings__DefaultConnection\" << 'SQL'
DO \$\$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT ' || r.constraint_name || ' CASCADE';
    END LOOP;
    
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || r.tablename || ' CASCADE';
    END LOOP;
    
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || r.sequencename || ' CASCADE';
    END LOOP;
    
    RAISE NOTICE 'Schema limpo!';
END \$\$;
SQL
        
        echo '✅ Schema deletado'
        
        # Recriar via migrations
        echo ''
        echo '🔨 Aplicando migrations do zero...'
        dotnet ef database update \
            --assembly InterceptorSystem.Infrastructure.dll \
            --startup-assembly InterceptorSystem.Api.dll \
            --verbose 2>&1 | grep -v '^SQL generated'
        
        echo ''
        echo '✅ Migrations aplicadas'
        
        # Mostrar resultado
        echo ''
        echo '📊 Tabelas criadas:'
        psql \"\$ConnectionStrings__DefaultConnection\" -t -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';\"
        
        echo ''
        echo '✅ Reset concluído com sucesso!'
    "

REMOTE_SCRIPT

echo ""
echo "🎉 Reset finalizado no EC2"
echo "⚠️  Próximo passo: Re-ativar WhatsApp em .env (Whatsapp__EnableCleanup=true) e fazer redeploy"
