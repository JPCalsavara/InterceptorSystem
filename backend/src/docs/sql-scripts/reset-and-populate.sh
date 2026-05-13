#!/bin/bash

# ========================================
# Script de Atalho para Popular Banco de Dados
# Uso: ./reset-and-populate.sh
# ========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-admin}"
DB_NAME="${DB_NAME:-interceptor_db}"

echo "========================================="
echo "🔄 RESETANDO E POPULANDO BANCO DE DADOS"
echo "========================================="
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""
echo "📋 Fases implementadas:"
echo "  ✅ FASE 2: Vínculo Funcionário ↔ Contrato"
echo "  ✅ FASE 3: Salários calculados automaticamente"
echo "  ✅ FASE 4: QuantidadeIdeal calculada do Cliente"
echo ""

# Verificar se psql está disponível
if ! command -v psql &> /dev/null; then
    echo "❌ Erro: psql não encontrado. Tentando via Docker..."
    DOCKER_MODE=true
else
    DOCKER_MODE=false
fi

# Função para executar SQL
execute_sql() {
    local sql_file=$1
    echo "📄 Executando: $(basename $sql_file)"
    
    if [ "$DOCKER_MODE" = true ]; then
        docker exec -i interceptor_db psql -U $DB_USER -d $DB_NAME < "$sql_file"
    else
        psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$sql_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ $(basename $sql_file) executado com sucesso!"
    else
        echo "❌ Erro ao executar $(basename $sql_file)"
        exit 1
    fi
}

# Perguntar confirmação
read -p "⚠️  Isso vai APAGAR todos os dados. Continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "❌ Operação cancelada."
    exit 0
fi

# Executar scripts
execute_sql "$SCRIPT_DIR/00-reset-database.sql"
echo ""
execute_sql "$SCRIPT_DIR/01-popular-dados-teste.sql"

echo ""
echo "========================================="
echo "✅ BANCO POPULADO COM SUCESSO!"
echo "========================================="
echo "📊 Dados inseridos:"
echo "   - 3 Clientes"
echo "   - 3 Contratos vigentes"
echo "   - 6 Postos de Trabalho"
echo "   - 35 Funcionários (FASE 2: vinculados a contratos)"
echo "   - 12 Diárias"
echo ""
echo "🚀 Pronto para testar no frontend!"
echo "========================================="

