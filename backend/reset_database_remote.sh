#!/bin/bash

# Script para resetar RDS da AWS via SSH no EC2
# 
# O RDS está em um servidor separado (AWS gerenciado)
# Este script se conecta remotamente via connection string
#
# Uso:
#   ssh -i ~/.ssh/ec2_key.pem ubuntu@<ec2-host>
#   bash reset_database_remote.sh

set -e

echo "🗄️ Script de Reset de RDS (via SSH para EC2)"
echo "🌐 RDS será acessado remotamente via connection string"
echo ""

# Verificar se .env existe no diretório de trabalho
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado em $(pwd)"
    echo "ℹ️  Este script deve estar no diretório raiz do projeto"
    exit 1
fi

# Carregar .env
set -a
source .env
set +a

echo "✅ Arquivo .env carregado"

# Verificar se connection string foi carregada
if [ -z "$ConnectionStrings__DefaultConnection" ]; then
    if [ -n "$RDS_CONNECTION_STRING" ]; then
        ConnectionStrings__DefaultConnection="$RDS_CONNECTION_STRING"
    else
        echo "❌ ConnectionStrings__DefaultConnection ou RDS_CONNECTION_STRING não definida em .env"
        exit 1
    fi
fi

# Tentar usar psql do EC2 ou container postgres
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client (psql) encontrado no EC2"
    echo "🟢 Usando psql local para conectar remotamente ao RDS..."
    bash "$(dirname "$0")/reset_database_rds.sh"
else
    echo "⚠️  psql não encontrado no EC2"
    echo "🐳 Usando container postgres:15 para conectar ao RDS..."
    
    # Usar Docker para executar o reset
    docker run --rm \
        --network host \
        --env-file .env \
        -v "$(pwd)/backend:/app" \
        postgres:15 \
        bash /app/reset_database_rds.sh
fi

echo ""
echo "✅ Reset do RDS concluído"
echo "⚠️  Próximos passos:"
echo "   1. Re-ativar WhatsApp: Whatsapp__EnableCleanup=true"
echo "   2. Fazer redeploy: gh workflow run ... --ref main"

