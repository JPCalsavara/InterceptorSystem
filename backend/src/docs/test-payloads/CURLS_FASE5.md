# 🧪 CURLs de Teste - FASE 5: Criação em Cascata

## 1. Criar Condomínio Completo (Sucesso)

```bash
curl -X POST http://localhost/api/condominios-completos \
  -H "Content-Type: application/json" \
  -d '{
    "condominio": {
      "nome": "Residencial Estrela",
      "cnpj": "12.345.678/0001-90",
      "endereco": "Rua das Flores, 123 - Jardim América, São Paulo/SP",
      "quantidadeFuncionariosIdeal": 12,
      "horarioTrocaTurno": "06:00:00",
      "emailGestor": "gestor@residencialestrela.com.br",
      "telefoneEmergencia": "+5511999887766"
    },
    "contrato": {
      "descricao": "Contrato de Portaria e Segurança 2026",
      "valorTotalMensal": 36000.00,
      "valorDiariaCobrada": 120.00,
      "percentualAdicionalNoturno": 0.30,
      "valorBeneficiosExtrasMensal": 3600.00,
      "percentualImpostos": 0.15,
      "quantidadeFuncionarios": 12,
      "margemLucroPercentual": 0.20,
      "margemCoberturaFaltasPercentual": 0.10,
      "dataInicio": "2026-01-10",
      "dataFim": "2026-12-31",
      "status": "PAGO"
    },
    "criarPostosAutomaticamente": true,
    "numeroDePostos": 2
  }'
```

**Resultado Esperado:** 201 Created

---

## 2. Validar Dados (Dry-Run)

```bash
curl -X POST http://localhost/api/condominios-completos/validar \
  -H "Content-Type: application/json" \
  -d '{
    "condominio": {
      "nome": "Residencial Teste Validação",
      "cnpj": "98.765.432/0001-10",
      "endereco": "Av. Teste, 456",
      "quantidadeFuncionariosIdeal": 12,
      "horarioTrocaTurno": "06:00:00",
      "emailGestor": "teste@validacao.com",
      "telefoneEmergencia": "+5511988776655"
    },
    "contrato": {
      "descricao": "Contrato Teste",
      "valorTotalMensal": 36000.00,
      "valorDiariaCobrada": 120.00,
      "percentualAdicionalNoturno": 0.30,
      "valorBeneficiosExtrasMensal": 3600.00,
      "percentualImpostos": 0.15,
      "quantidadeFuncionarios": 12,
      "margemLucroPercentual": 0.20,
      "margemCoberturaFaltasPercentual": 0.10,
      "dataInicio": "2026-01-15",
      "dataFim": "2026-12-31",
      "status": "PAGO"
    },
    "criarPostosAutomaticamente": true,
    "numeroDePostos": 2
  }'
```

**Resultado Esperado:** 200 OK
```json
{
  "valido": true,
  "mensagem": "Dados válidos para criação."
}
```

---

## 3. Erro: Quantidade de Funcionários Diferente

```bash
curl -X POST http://localhost/api/condominios-completos \
  -H "Content-Type: application/json" \
  -d '{
    "condominio": {
      "nome": "Residencial Erro",
      "cnpj": "11.222.333/0001-44",
      "endereco": "Rua Erro, 666",
      "quantidadeFuncionariosIdeal": 12,
      "horarioTrocaTurno": "06:00:00"
    },
    "contrato": {
      "descricao": "Contrato Erro",
      "valorTotalMensal": 36000.00,
      "valorDiariaCobrada": 120.00,
      "percentualAdicionalNoturno": 0.30,
      "valorBeneficiosExtrasMensal": 3600.00,
      "percentualImpostos": 0.15,
      "quantidadeFuncionarios": 10,
      "margemLucroPercentual": 0.20,
      "margemCoberturaFaltasPercentual": 0.10,
      "dataInicio": "2026-01-10",
      "dataFim": "2026-12-31",
      "status": "PAGO"
    },
    "criarPostosAutomaticamente": true,
    "numeroDePostos": 2
  }'
```

**Resultado Esperado:** 400 Bad Request
```json
{
  "error": "Quantidade de funcionários do contrato (10) deve ser igual à quantidade ideal do condomínio (12)."
}
```

---

## 4. Erro: Funcionários Não Divisíveis por Postos

```bash
curl -X POST http://localhost/api/condominios-completos/validar \
  -H "Content-Type: application/json" \
  -d '{
    "condominio": {
      "nome": "Residencial Divisibilidade",
      "cnpj": "22.333.444/0001-55",
      "endereco": "Rua Divisão, 777",
      "quantidadeFuncionariosIdeal": 10,
      "horarioTrocaTurno": "06:00:00"
    },
    "contrato": {
      "descricao": "Contrato Divisão",
      "valorTotalMensal": 30000.00,
      "valorDiariaCobrada": 100.00,
      "percentualAdicionalNoturno": 0.30,
      "valorBeneficiosExtrasMensal": 3000.00,
      "percentualImpostos": 0.15,
      "quantidadeFuncionarios": 10,
      "margemLucroPercentual": 0.20,
      "margemCoberturaFaltasPercentual": 0.10,
      "dataInicio": "2026-01-10",
      "dataFim": "2026-12-31",
      "status": "PAGO"
    },
    "criarPostosAutomaticamente": true,
    "numeroDePostos": 3
  }'
```

**Resultado Esperado:** 400 Bad Request
```json
{
  "valido": false,
  "erro": "Quantidade de funcionários (10) deve ser divisível pelo número de postos (3)."
}
```

---

## 5. Criar com 3 Postos (Turnos de 8 horas)

```bash
curl -X POST http://localhost/api/condominios-completos \
  -H "Content-Type: application/json" \
  -d '{
    "condominio": {
      "nome": "Residencial Três Turnos",
      "cnpj": "33.444.555/0001-66",
      "endereco": "Av. Três Turnos, 888",
      "quantidadeFuncionariosIdeal": 15,
      "horarioTrocaTurno": "00:00:00",
      "emailGestor": "gestao@tresturnos.com",
      "telefoneEmergencia": "+5511977665544"
    },
    "contrato": {
      "descricao": "Contrato 3 Turnos 24/7",
      "valorTotalMensal": 45000.00,
      "valorDiariaCobrada": 150.00,
      "percentualAdicionalNoturno": 0.35,
      "valorBeneficiosExtrasMensal": 4500.00,
      "percentualImpostos": 0.15,
      "quantidadeFuncionarios": 15,
      "margemLucroPercentual": 0.20,
      "margemCoberturaFaltasPercentual": 0.10,
      "dataInicio": "2026-01-10",
      "dataFim": "2026-12-31",
      "status": "PAGO"
    },
    "criarPostosAutomaticamente": true,
    "numeroDePostos": 3
  }'
```

**Resultado Esperado:** 201 Created
- Posto 1: 00:00 - 08:00
- Posto 2: 08:00 - 16:00
- Posto 3: 16:00 - 00:00

---

## 6. Criar Sem Postos Automáticos

```bash
curl -X POST http://localhost/api/condominios-completos \
  -H "Content-Type: application/json" \
  -d '{
    "condominio": {
      "nome": "Residencial Manual",
      "cnpj": "44.555.666/0001-77",
      "endereco": "Rua Manual, 999",
      "quantidadeFuncionariosIdeal": 8,
      "horarioTrocaTurno": "07:00:00",
      "emailGestor": "manual@test.com",
      "telefoneEmergencia": "+5511966554433"
    },
    "contrato": {
      "descricao": "Contrato Manual",
      "valorTotalMensal": 24000.00,
      "valorDiariaCobrada": 100.00,
      "percentualAdicionalNoturno": 0.25,
      "valorBeneficiosExtrasMensal": 2400.00,
      "percentualImpostos": 0.15,
      "quantidadeFuncionarios": 8,
      "margemLucroPercentual": 0.18,
      "margemCoberturaFaltasPercentual": 0.08,
      "dataInicio": "2026-01-10",
      "dataFim": "2026-12-31",
      "status": "PAGO"
    },
    "criarPostosAutomaticamente": false,
    "numeroDePostos": 0
  }'
```

**Resultado Esperado:** 201 Created (sem postos criados)

---

## 🔍 Como Testar no Swagger

1. Acesse: `http://localhost/swagger`
2. Localize: `POST /api/condominios-completos`
3. Clique em **Try it out**
4. Cole o JSON de teste
5. Execute
6. Verifique o response 201 com todas as entidades criadas

---

## 📊 Validar Criação

Após criar um condomínio completo, valide:

```bash
# 1. Listar condomínios
curl http://localhost/api/condominios

# 2. Listar contratos
curl http://localhost/api/contratos

# 3. Listar postos
curl http://localhost/api/postos-de-trabalho
```

---

**Todos os CURLs de teste da FASE 5!** 🎉

