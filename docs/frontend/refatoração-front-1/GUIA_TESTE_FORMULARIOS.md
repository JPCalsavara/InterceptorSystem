# 🎯 GUIA DE TESTE: Formulários do InterceptorSystem

**Data:** 09/01/2026  
**Versão:** 2.0

---

## ✅ PROBLEMA RESOLVIDO

O formulário está **FUNCIONANDO CORRETAMENTE**! ✅

O erro que você viu é porque **o CNPJ já existe no banco**.

---

## 🚀 COMO TESTAR AGORA

### Opção 1: Teste Manual no Navegador (RECOMENDADO)

1. **Recarregue a página** (Ctrl+F5 ou Cmd+Shift+R)

2. **Use um dos CNPJs únicos abaixo:**
   ```
   11.222.333/0001-44
   99.888.777/0001-66
   55.444.333/0001-22
   88.777.666/0001-99
   77.666.555/0001-33
   ```

3. **Preencha o formulário:**
   ```
   Nome: Residencial Teste
   CNPJ: [ESCOLHA UM DA LISTA ACIMA]
   Endereço: Rua das Flores, 123
   Quantidade de Funcionários: 6
   Horário de Troca de Turno: 06:00
   Email do Gestor: gestor@teste.com
   Telefone de Emergência: (11)99999-9999
   ```

4. **Clique em "Cadastrar"**

5. **✅ Deve criar com sucesso e redirecionar para a lista!**

---

### Opção 2: Teste Automático via Script

Execute o script que criamos:

```bash
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem

# Teste completo (gera CNPJ único automaticamente)
./src/docs/scripts/test-formularios-completo.sh
```

---

## 📋 O QUE FOI CORRIGIDO

### 1. ✅ Conversão de Horários (FASE 3)

**Antes:** Input enviava "06:00" → Backend rejeitava  
**Depois:** Input envia "06:00:00" → Backend aceita ✅

**Arquivos modificados:**
- `condominio-form.component.ts` - Conversão automática
- `posto-form.component.ts` - Conversão automática

### 2. ✅ Mensagens de Erro Melhoradas

**Antes:** "Erro ao criar condomínio. Tente novamente."  
**Depois:** 
- "⚠️ Este CNPJ já está cadastrado. Por favor, use um CNPJ diferente."
- "❌ Dados inválidos. Verifique os campos obrigatórios."

### 3. ✅ Scripts de Teste Criados

**Arquivos criados:**
- `test-formularios.sh` - Teste básico de endpoints
- `test-formularios-completo.sh` - Teste completo com dados únicos

---

## 🧪 TESTES DISPONÍVEIS

### Teste 1: Criação de Condomínio

```bash
# Gerar CNPJ único e testar
CNPJ="99.888.777/0001-$(date +%S)"

curl -X POST http://localhost/api/condominios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Automático",
    "cnpj": "'"$CNPJ"'",
    "endereco": "Rua Teste, 123",
    "quantidadeFuncionariosIdeal": 6,
    "horarioTrocaTurno": "06:00:00",
    "emailGestor": "teste@test.com"
  }'
```

**Resultado esperado:** HTTP 201 Created ✅

### Teste 2: CNPJ Duplicado

```bash
# Tentar criar novamente com mesmo CNPJ
curl -X POST http://localhost/api/condominios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Outro Nome",
    "cnpj": "12.345.678/0001-90",
    ...
  }'
```

**Resultado esperado:** HTTP 500 com mensagem de CNPJ duplicado ⚠️

### Teste 3: Posto de Trabalho

```bash
# Após criar condomínio, pegar o ID e criar posto
curl -X POST http://localhost/api/postos-de-trabalho \
  -H "Content-Type: application/json" \
  -d '{
    "condominioId": "[ID_DO_CONDOMINIO]",
    "horarioInicio": "06:00:00",
    "horarioFim": "18:00:00",
    "permiteDobrarEscala": true
  }'
```

**Resultado esperado:** HTTP 201 Created ✅

---

## ❌ ERROS COMUNS

### Erro 1: "CNPJ já cadastrado"

**Causa:** CNPJ já existe no banco  
**Solução:** Use um CNPJ diferente da lista acima

### Erro 2: "Dados inválidos"

**Causa:** Campo obrigatório vazio ou formato incorreto  
**Solução:** 
- CNPJ deve estar no formato: `XX.XXX.XXX/XXXX-XX`
- Quantidade de funcionários deve ser > 0
- Horário será convertido automaticamente

### Erro 3: "Erro ao criar condomínio"

**Causa:** Erro genérico do servidor  
**Solução:** Verifique os logs do backend

---

## 📊 VALIDAÇÕES IMPLEMENTADAS

| Campo | Validação | Mensagem de Erro |
|-------|-----------|------------------|
| Nome | Obrigatório, 3-200 caracteres | "Este campo é obrigatório" |
| CNPJ | Obrigatório, formato válido, único | "CNPJ inválido" ou "CNPJ já cadastrado" |
| Endereço | Obrigatório, 5-300 caracteres | "Este campo é obrigatório" |
| Quantidade Funcionários | Obrigatório, ≥ 1 | "Mínimo de 1" |
| Horário Troca | Obrigatório, formato HH:mm | "Este campo é obrigatório" |
| Email | Formato válido (opcional) | "Email inválido" |
| Telefone | Formato (XX)XXXXX-XXXX (opcional) | "Telefone inválido" |

---

## 🎯 EXEMPLOS DE DADOS VÁLIDOS

### Condomínio 1
```json
{
  "nome": "Residencial Estrela",
  "cnpj": "11.222.333/0001-44",
  "endereco": "Av. Principal, 1000",
  "quantidadeFuncionariosIdeal": 12,
  "horarioTrocaTurno": "06:00",
  "emailGestor": "gestor@estrela.com",
  "telefoneEmergencia": "(11)91234-5678"
}
```

### Condomínio 2
```json
{
  "nome": "Condomínio Solar",
  "cnpj": "99.888.777/0001-66",
  "endereco": "Rua do Sol, 500",
  "quantidadeFuncionariosIdeal": 8,
  "horarioTrocaTurno": "07:00"
}
```

### Posto de Trabalho
```json
{
  "condominioId": "[ID_GERADO_PELO_BACKEND]",
  "horarioInicio": "06:00",
  "horarioFim": "18:00",
  "permiteDobrarEscala": true,
  "capacidadeMaximaExtraPorTerceiros": 2
}
```

---

## 🔧 TROUBLESHOOTING

### Se o formulário não funcionar após recarregar

1. **Limpe o cache do navegador:**
   - Chrome: Ctrl+Shift+Delete → Limpar cache
   - Firefox: Ctrl+Shift+Delete → Limpar cache

2. **Verifique se a API está rodando:**
   ```bash
   curl http://localhost/api/condominios
   ```

3. **Veja os logs do backend:**
   ```bash
   docker logs interceptor_api
   ```

4. **Recompile o frontend:**
   ```bash
   cd frontend
   npm run build
   ```

---

## 📁 ARQUIVOS DE REFERÊNCIA

- **Correção:** `/docs/frontend/CORRECAO_FORMULARIO_CONDOMINIO.md`
- **Diagnóstico:** `/docs/frontend/DIAGNOSTICO_FORMULARIO.md`
- **Scripts:** `/src/docs/scripts/test-formularios-*.sh`
- **Payloads:** `/src/docs/test-payloads/*.json`

---

## ✅ CHECKLIST DE TESTE

- [ ] Recarreguei a página (Ctrl+F5)
- [ ] Usei um CNPJ diferente da lista
- [ ] Preenchi todos os campos obrigatórios
- [ ] Horário está no formato HH:mm (será convertido automaticamente)
- [ ] Cliquei em "Cadastrar"
- [ ] Aguardei o redirecionamento
- [ ] ✅ Condomínio aparece na lista!

---

## 💡 DICA PROFISSIONAL

**Para desenvolvimento/testes, use CNPJs sequenciais:**

```
Teste 1: 11.111.111/0001-11
Teste 2: 22.222.222/0001-22
Teste 3: 33.333.333/0001-33
Teste 4: 44.444.444/0001-44
...
```

Isso facilita identificar quais são de teste vs. reais.

---

**Status:** ✅ FORMULÁRIOS FUNCIONAIS  
**Última atualização:** 09/01/2026 11:20  
**Responsável:** Arquiteto .NET Sênior

