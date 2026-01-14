#!/bin/bash

# Script de Teste de Formulários - InterceptorSystem
# Data: 2026-01-09

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🧪 TESTE AUTOMÁTICO DE FORMULÁRIOS - FRONTEND            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:4200/api"
RESULTS_FILE="/tmp/test_results.txt"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Limpar resultados anteriores
> $RESULTS_FILE

echo "📋 Testando endpoints da API..."
echo ""

# Função para testar endpoint
test_endpoint() {
    local METHOD=$1
    local ENDPOINT=$2
    local DATA=$3
    local DESCRIPTION=$4
    
    echo -n "🔍 $DESCRIPTION... "
    
    if [ "$METHOD" = "POST" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$DATA" \
            "$BASE_URL$ENDPOINT" 2>&1)
    elif [ "$METHOD" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$ENDPOINT" 2>&1)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ PASSOU${NC} (HTTP $HTTP_CODE)"
        echo "✅ $DESCRIPTION - HTTP $HTTP_CODE" >> $RESULTS_FILE
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC} (HTTP $HTTP_CODE)"
        echo "❌ $DESCRIPTION - HTTP $HTTP_CODE" >> $RESULTS_FILE
        echo "   Resposta: $BODY" | head -c 200
        echo ""
        return 1
    fi
}

# =======================
# TESTES DE CONDOMÍNIO
# =======================
echo "📁 TESTE 1: Condomínios"
echo "─────────────────────────────────────"

# Payload de teste para condomínio
CONDOMINIO_PAYLOAD='{
  "nome": "João Pedro Leite Calsavara",
  "cnpj": "12.345.678/0001-90",
  "endereco": "Av. Sr. Libertino Pizani, 137 13484-666",
  "quantidadeFuncionariosIdeal": 7,
  "horarioTrocaTurno": "06:00:00",
  "emailGestor": "jpcalsavara@gmail.com",
  "telefoneEmergencia": "(15)996690551"
}'

test_endpoint "POST" "/condominios" "$CONDOMINIO_PAYLOAD" "Criar condomínio com horário 06:00:00"

# Testar GET
test_endpoint "GET" "/condominios" "" "Listar condomínios"

echo ""

# =======================
# TESTES DE POSTO
# =======================
echo "📍 TESTE 2: Postos de Trabalho"
echo "─────────────────────────────────────"

# Primeiro, pegar ID do condomínio criado
CONDOMINIO_ID=$(curl -s "$BASE_URL/condominios" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CONDOMINIO_ID" ]; then
    echo "   Usando condomínio: $CONDOMINIO_ID"
    
    POSTO_PAYLOAD="{
      \"condominioId\": \"$CONDOMINIO_ID\",
      \"horarioInicio\": \"06:00:00\",
      \"horarioFim\": \"18:00:00\",
      \"permiteDobrarEscala\": true,
      \"capacidadeMaximaExtraPorTerceiros\": 2
    }"
    
    test_endpoint "POST" "/postos-de-trabalho" "$POSTO_PAYLOAD" "Criar posto 06:00-18:00"
    
    POSTO_PAYLOAD2="{
      \"condominioId\": \"$CONDOMINIO_ID\",
      \"horarioInicio\": \"18:00:00\",
      \"horarioFim\": \"06:00:00\",
      \"permiteDobrarEscala\": true,
      \"capacidadeMaximaExtraPorTerceiros\": 2
    }"
    
    test_endpoint "POST" "/postos-de-trabalho" "$POSTO_PAYLOAD2" "Criar posto 18:00-06:00"
else
    echo -e "${YELLOW}⚠️  Pulando testes de posto - nenhum condomínio encontrado${NC}"
fi

echo ""

# =======================
# TESTE DE FORMATO INVÁLIDO
# =======================
echo "🔍 TESTE 3: Validações de Formato"
echo "─────────────────────────────────────"

# Tentar criar condomínio com horário no formato errado (HH:mm)
CONDOMINIO_INVALIDO='{
  "nome": "Teste Formato Errado",
  "cnpj": "98.765.432/0001-10",
  "endereco": "Rua Teste, 123",
  "quantidadeFuncionariosIdeal": 5,
  "horarioTrocaTurno": "06:00",
  "emailGestor": "teste@teste.com"
}'

echo -n "🔍 Criar condomínio com horário HH:mm (deve falhar)... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$CONDOMINIO_INVALIDO" \
    "$BASE_URL/condominios" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ PASSOU${NC} (Rejeitou formato inválido)"
    echo "✅ Validação de formato - HTTP 400" >> $RESULTS_FILE
else
    echo -e "${RED}❌ FALHOU${NC} (Deveria rejeitar com 400, mas retornou $HTTP_CODE)"
    echo "❌ Validação de formato - HTTP $HTTP_CODE" >> $RESULTS_FILE
fi

echo ""

# =======================
# RESUMO
# =======================
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  📊 RESUMO DOS TESTES                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$(cat $RESULTS_FILE | wc -l)
PASSED=$(grep -c "✅" $RESULTS_FILE)
FAILED=$(grep -c "❌" $RESULTS_FILE)

echo "Total de testes: $TOTAL"
echo -e "${GREEN}Passou: $PASSED${NC}"
echo -e "${RED}Falhou: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ALGUNS TESTES FALHARAM${NC}"
    echo ""
    echo "Detalhes dos erros:"
    grep "❌" $RESULTS_FILE
    exit 1
fi

