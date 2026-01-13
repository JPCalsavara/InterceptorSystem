# 🧪 TESTES MANUAIS - FASE 5 FRONTEND

**Data:** 2026-01-09  
**Objetivo:** Validar melhorias no formulário de condomínio

---

## ✅ CHECKLIST DE TESTES

### **1. Cálculo Automático de Quantidade Total**

#### **Teste 1.1: Cálculo em tempo real**
1. ✅ Abrir: http://localhost/condominios/novo
2. ✅ Preencher "Número de Postos": **2**
3. ✅ Observar: Quantidade Total = **2** (2 × 1)
4. ✅ Preencher "Funcionários por Posto": **3**
5. ✅ Observar: Quantidade Total = **6** (2 × 3)

**Resultado Esperado:**
```
┌─────────────────────────────────────┐
│ Quantidade Total de Funcionários    │
│                                     │
│         6                           │
│   = 2 postos × 3 funcionários      │
└─────────────────────────────────────┘
```

---

#### **Teste 1.2: Validação de ranges**
1. ✅ Tentar digitar "Número de Postos": **0**
   - **Esperado:** Não permite (mínimo 1)
2. ✅ Tentar digitar "Número de Postos": **15**
   - **Esperado:** Permite digitar, mas validação impede submit
3. ✅ Tentar digitar "Funcionários por Posto": **10**
   - **Esperado:** Permite digitar, mas validação impede submit

**Resultado Esperado:**
- ✅ Range válido: 1-10 postos, 1-5 funcionários/posto
- ✅ Mensagens de erro aparecem ao tentar enviar

---

### **2. Formatação de Telefone**

#### **Teste 2.1: Input com máscara**
1. ✅ Preencher "Telefone de Emergência": **(11) 98765-4321**
2. ✅ Clicar em "Cadastrar"
3. ✅ Verificar no backend (logs ou banco):
   - **Esperado:** `telefoneEmergencia: "11987654321"` (sem parênteses/hífen)

**Comando para verificar no banco:**
```bash
docker exec -it interceptor_db psql -U postgres -d interceptor_db \
  -c "SELECT \"TelefoneEmergencia\" FROM \"Condominios\" ORDER BY \"CreatedAt\" DESC LIMIT 1;"
```

**Resultado Esperado:**
```
 TelefoneEmergencia
--------------------
 11987654321
```

---

#### **Teste 2.2: Telefone vazio**
1. ✅ Deixar "Telefone de Emergência" em branco
2. ✅ Preencher outros campos obrigatórios
3. ✅ Clicar em "Cadastrar"
4. ✅ Verificar: **Deve criar normalmente** (campo opcional)

**Resultado Esperado:**
- ✅ Criação bem-sucedida
- ✅ Redirecionamento para lista

---

### **3. Input de Horário**

#### **Teste 3.1: Picker de horário**
1. ✅ Clicar no campo "Horário de Troca de Turno"
2. ✅ Verificar: **Deve aparecer picker visual**
   - Relógio analógico ou dropdown (depende do navegador)
3. ✅ Selecionar: **06:00**
4. ✅ Verificar no campo: **06:00** (formato HH:mm)

**Resultado Esperado:**
- ✅ Picker nativo do navegador aparece
- ✅ Formato HH:mm exibido no campo

---

#### **Teste 3.2: Conversão para backend**
1. ✅ Preencher horário: **06:00**
2. ✅ Clicar em "Cadastrar"
3. ✅ Verificar no backend (logs ou banco):
   - **Esperado:** `horarioTrocaTurno: "06:00:00"` (com segundos)

**Comando para verificar no banco:**
```bash
docker exec -it interceptor_db psql -U postgres -d interceptor_db \
  -c "SELECT \"HorarioTrocaTurno\" FROM \"Condominios\" ORDER BY \"CreatedAt\" DESC LIMIT 1;"
```

**Resultado Esperado:**
```
 HorarioTrocaTurno
-------------------
 06:00:00
```

---

### **4. Modo Edição**

#### **Teste 4.1: Carregamento de dados existentes**
1. ✅ Criar condomínio com:
   - Quantidade Ideal: **12**
2. ✅ Abrir em modo edição
3. ✅ Verificar campos:
   - **Número de Postos:** 6 (12 / 2 arredondado)
   - **Funcionários por Posto:** 2 (12 / 6)
   - **Quantidade Total:** 12 (6 × 2)

**Resultado Esperado:**
- ✅ Conversão correta de quantidadeIdeal → postos/funcionários
- ✅ Cálculo total correto

---

#### **Teste 4.2: Atualização**
1. ✅ Editar "Número de Postos": **3**
2. ✅ Observar: Quantidade Total = **6** (3 × 2)
3. ✅ Editar "Funcionários por Posto": **4**
4. ✅ Observar: Quantidade Total = **12** (3 × 4)
5. ✅ Clicar em "Atualizar"
6. ✅ Verificar no banco: `quantidadeFuncionariosIdeal = 12`

**Resultado Esperado:**
- ✅ Atualização bem-sucedida
- ✅ Backend recebe quantidadeIdeal correta

---

### **5. Visual e Responsividade**

#### **Teste 5.1: Dark mode**
1. ✅ Clicar no botão de dark mode (navbar)
2. ✅ Verificar campo "Quantidade Total":
   - **Light Mode:** Fundo azul claro, borda azul vibrante
   - **Dark Mode:** Fundo azul escuro, borda azul claro

**Resultado Esperado:**
- ✅ Cores ajustadas automaticamente
- ✅ Contraste adequado em ambos os modos

---

#### **Teste 5.2: Responsividade**
1. ✅ Redimensionar janela para mobile (< 768px)
2. ✅ Verificar:
   - Campos empilhados verticalmente
   - Cálculo total visível
   - Botões acessíveis

**Resultado Esperado:**
- ✅ Layout adaptado para mobile
- ✅ Usabilidade mantida

---

### **6. Validações de Formulário**

#### **Teste 6.1: Campos obrigatórios vazios**
1. ✅ Clicar em "Cadastrar" sem preencher nada
2. ✅ Verificar mensagens:
   - "Nome do Condomínio: Este campo é obrigatório"
   - "CNPJ: Este campo é obrigatório"
   - "Endereço: Este campo é obrigatório"
   - "Horário de Troca de Turno: Este campo é obrigatório"

**Resultado Esperado:**
- ✅ Formulário não é enviado
- ✅ Mensagens de erro aparecem
- ✅ Campos marcados com borda vermelha

---

#### **Teste 6.2: CNPJ inválido**
1. ✅ Preencher "CNPJ": **123**
2. ✅ Tentar enviar
3. ✅ Verificar mensagem: **"CNPJ inválido (ex: 12.345.678/0001-90)"**

**Resultado Esperado:**
- ✅ Validação de formato CNPJ funcionando

---

#### **Teste 6.3: Email inválido**
1. ✅ Preencher "E-mail do Gestor": **gestor@**
2. ✅ Tentar enviar
3. ✅ Verificar mensagem: **"Email inválido"**

**Resultado Esperado:**
- ✅ Validação de formato email funcionando

---

### **7. Integração com Backend**

#### **Teste 7.1: Criação bem-sucedida**
1. ✅ Preencher todos os campos obrigatórios:
   - Nome: **Condomínio Teste FASE 5**
   - CNPJ: **12.345.678/0001-99**
   - Endereço: **Rua Teste, 123**
   - Número de Postos: **2**
   - Funcionários por Posto: **3**
   - Horário: **06:00**
2. ✅ Clicar em "Cadastrar"
3. ✅ Verificar:
   - ✅ Loading aparece no botão
   - ✅ Redirecionamento para lista
   - ✅ Novo condomínio aparece na lista

**Resultado Esperado:**
- ✅ Status 201 Created
- ✅ Condomínio criado com `quantidadeFuncionariosIdeal = 6`

---

#### **Teste 7.2: CNPJ duplicado**
1. ✅ Tentar criar condomínio com CNPJ já existente
2. ✅ Verificar mensagem: **"⚠️ Este CNPJ já está cadastrado..."**
3. ✅ Verificar: Formulário não é limpo (dados preservados)

**Resultado Esperado:**
- ✅ Status 409 Conflict
- ✅ Mensagem de erro clara
- ✅ Usuário pode corrigir sem perder dados

---

## 📊 RESUMO DOS TESTES

| Categoria | Testes | Status |
|-----------|--------|--------|
| **Cálculo Automático** | 2 | ⏳ Pendente |
| **Formatação Telefone** | 2 | ⏳ Pendente |
| **Input Horário** | 2 | ⏳ Pendente |
| **Modo Edição** | 2 | ⏳ Pendente |
| **Visual/Responsividade** | 2 | ⏳ Pendente |
| **Validações** | 3 | ⏳ Pendente |
| **Integração Backend** | 2 | ⏳ Pendente |
| **TOTAL** | **15** | **0/15** |

---

## 🚀 COMANDOS ÚTEIS

### **Iniciar ambiente:**
```bash
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem/src
docker compose up -d
```

### **Acessar aplicação:**
- Frontend: http://localhost
- Backend API: http://localhost/api
- Swagger: http://localhost/swagger

### **Verificar logs:**
```bash
# Logs da API
docker logs -f interceptor_api

# Logs do banco
docker logs -f interceptor_db
```

### **Limpar banco (para testes limpos):**
```bash
docker exec -it interceptor_db psql -U postgres -d interceptor_db \
  -c "TRUNCATE \"Condominios\" RESTART IDENTITY CASCADE;"
```

---

## ✅ APROVAÇÃO

**Responsável:** _______________________  
**Data:** ___/___/______  
**Resultado:**
- [ ] ✅ Todos os testes passaram
- [ ] ⚠️ Alguns testes falharam (detalhar abaixo)
- [ ] ❌ Muitos problemas encontrados

**Observações:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**Última atualização:** 2026-01-09  
**Versão:** 1.0

