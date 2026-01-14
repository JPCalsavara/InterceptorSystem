#!/bin/bash

# Script de Limpeza e Teste de Formulários
# Limpa dados de teste e testa criação com dados únicos

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🧹 LIMPEZA E TESTE DE FORMULÁRIOS                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost/api"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Gerar CNPJ único baseado em timestamp
generate_unique_cnpj() {
    local timestamp=$(date +%s)
    local last8=$(echo $timestamp | tail -c 9)
    echo "12.345.${last8:0:3}/${last8:3:4}-90"
}

# Gerar CPF único
generate_unique_cpf() {
    local timestamp=$(date +%s)
    local last11=$(echo $timestamp | tail -c 12)
    echo "${last11:0:3}.${last11:3:3}.${last11:6:3}-${last11:9:2}"
}

echo -e "${BLUE}📋 ETAPA 1: Listar dados existentes${NC}"
echo "─────────────────────────────────────────────"

# Listar condomínios existentes
echo -n "Condomínios cadastrados: "
COND_COUNT=$(curl -s "$BASE_URL/condominios" | grep -o '"id"' | wc -l)
echo "$COND_COUNT"

echo ""
echo -e "${BLUE}🧪 ETAPA 2: Testar criação com dados ÚNICOS${NC}"
echo "─────────────────────────────────────────────"

# Gerar dados únicos
UNIQUE_CNPJ=$(generate_unique_cnpj)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "   CNPJ gerado: $UNIQUE_CNPJ"
echo "   Timestamp: $TIMESTAMP"
echo ""

# Payload com dados únicos
cat > /tmp/test_condominio_unique.json << EOF
{
  "nome": "Teste Automático $TIMESTAMP",
  "cnpj": "$UNIQUE_CNPJ",
  "endereco": "Rua de Teste, 123 - $TIMESTAMP",
  "quantidadeFuncionariosIdeal": 8,
  "horarioTrocaTurno": "06:00:00",
  "emailGestor": "teste_$TIMESTAMP@example.com",
  "telefoneEmergencia": "(11)99999-9999"
}
EOF

echo -e "${YELLOW}🔍 Testando criação de condomínio...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d @/tmp/test_condominio_unique.json \
    "$BASE_URL/condominios")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ SUCESSO!${NC} Condomínio criado (HTTP $HTTP_CODE)"
    echo ""
    echo "Dados retornados:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    
    # Extrair ID do condomínio criado
    COND_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$COND_ID" ]; then
        echo ""
        echo -e "${BLUE}🧪 ETAPA 3: Testar criação de Posto de Trabalho${NC}"
        echo "─────────────────────────────────────────────"
        echo "   Usando condomínio ID: $COND_ID"
        
        cat > /tmp/test_posto.json << EOFPOSTO
{
  "condominioId": "$COND_ID",
  "horarioInicio": "06:00:00",
  "horarioFim": "18:00:00",
  "permiteDobrarEscala": true,
  "capacidadeMaximaExtraPorTerceiros": 2
}
EOFPOSTO
        
        echo ""
        echo -e "${YELLOW}🔍 Testando criação de posto...${NC}"
        
        POSTO_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d @/tmp/test_posto.json \
            "$BASE_URL/postos-de-trabalho")
        
        POSTO_HTTP_CODE=$(echo "$POSTO_RESPONSE" | tail -n1)
        POSTO_BODY=$(echo "$POSTO_RESPONSE" | sed '$d')
        
        if [ "$POSTO_HTTP_CODE" = "201" ]; then
            echo -e "${GREEN}✅ SUCESSO!${NC} Posto criado (HTTP $POSTO_HTTP_CODE)"
            echo ""
            echo "Dados retornados:"
            echo "$POSTO_BODY" | python3 -m json.tool 2>/dev/null || echo "$POSTO_BODY"
        else
            echo -e "${RED}❌ ERRO!${NC} HTTP $POSTO_HTTP_CODE"
            echo "Resposta:"
            echo "$POSTO_BODY" | head -c 500
        fi
    fi
    
elif [ "$HTTP_CODE" = "409" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "${RED}❌ ERRO!${NC} HTTP $HTTP_CODE"
    echo ""
    echo "Este erro indica validação ou duplicação."
    echo "Mensagem do servidor:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | grep -E "(message|Message|erro|error)" | head -5
    
else
    echo -e "${RED}❌ ERRO INESPERADO!${NC} HTTP $HTTP_CODE"
    echo "Resposta completa (primeiros 500 caracteres):"
    echo "$BODY" | head -c 500
fi

echo ""
echo "─────────────────────────────────────────────"
echo -e "${BLUE}📊 RESUMO DO TESTE${NC}"
echo "─────────────────────────────────────────────"
echo "Data/Hora: $(date)"
echo "CNPJ usado: $UNIQUE_CNPJ"
echo "Timestamp: $TIMESTAMP"
echo ""

# Verificar novamente quantos condomínios existem
NEW_COND_COUNT=$(curl -s "$BASE_URL/condominios" | grep -o '"id"' | wc -l)
echo "Condomínios antes: $COND_COUNT"
echo "Condomínios depois: $NEW_COND_COUNT"

if [ $NEW_COND_COUNT -gt $COND_COUNT ]; then
    echo -e "${GREEN}✅ Novo condomínio foi criado com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum novo condomínio foi adicionado${NC}"
fi

echo ""
echo "💡 DICA: Para testar manualmente no navegador, use um CNPJ diferente:"
echo "   Sugestão: $(generate_unique_cnpj)"

