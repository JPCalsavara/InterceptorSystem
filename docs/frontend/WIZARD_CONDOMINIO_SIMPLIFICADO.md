# ✅ WIZARD DE CONDOMÍNIO SIMPLIFICADO

## 📋 **Modificações Realizadas**

### **1. Arquivo HTML (`condominio-wizard.component.html`)**

**REMOVIDO:**
- ❌ Campo "Horário de Troca de Turno"
- ❌ Campo "Número de Postos de Trabalho"
- ❌ Campo "Funcionários por Posto"
- ❌ Seção "Postos de Trabalho Configurados" (com cards de postos)
- ❌ Info Box com totais de postos e funcionários

**MANTIDO:**
- ✅ Nome do Condomínio
- ✅ CNPJ
- ✅ Endereço Completo
- ✅ E-mail do Gestor (opcional)
- ✅ Telefone de Emergência (opcional)

---

### **2. Arquivo TypeScript (`condominio-wizard.component.ts`)**

#### **A. Formulário de Condomínio Simplificado**
```typescript
// ANTES (8 campos + FormArray de postos)
this.formCondominio = this.fb.group({
  nome: ['', [...]],
  cnpj: ['', [...]],
  endereco: ['', [...]],
  horarioTrocaTurno: ['06:00', [...]],        // ❌ REMOVIDO
  emailGestor: ['', [...]],
  telefoneEmergencia: ['', [...]],
  numeroPostos: [1, [...]],                   // ❌ REMOVIDO
  funcionariosPorPosto: [2, [...]],           // ❌ REMOVIDO
  postos: this.fb.array([]),                  // ❌ REMOVIDO
});

// DEPOIS (5 campos apenas)
this.formCondominio = this.fb.group({
  nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
  cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)]],
  endereco: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
  emailGestor: ['', [Validators.email]],
  telefoneEmergencia: ['', [Validators.pattern(/^\d{10,11}$/)]],
});
```

#### **B. Computed Properties Removidas**
```typescript
// ❌ REMOVIDO
totalPostos = computed(() => this.postos?.length || 0);

// ❌ REMOVIDO
totalFuncionariosPorPostos = computed(() => {
  const postos = this.postos?.value || [];
  return postos.reduce((sum: number, posto: any) => sum + (posto.quantidadeFuncionarios || 0), 0);
});
```

#### **C. Getter de Postos Removido**
```typescript
// ❌ REMOVIDO
get postos(): FormArray {
  return this.formCondominio.get('postos') as FormArray;
}
```

#### **D. Métodos Relacionados a Postos Removidos**
```typescript
// ❌ REMOVIDOS
atualizarPostos(): void { ... }
calcularHorarioInicioPosto(...): string { ... }
calcularHorarioFim(...): string { ... }
addPosto(): void { ... }
removePosto(index: number): void { ... }
```

#### **E. Listeners de Mudanças Removidos**
```typescript
// ❌ REMOVIDO
this.formCondominio.get('numeroPostos')?.valueChanges.subscribe(() => {
  this.atualizarPostos();
});

this.formCondominio.get('funcionariosPorPosto')?.valueChanges.subscribe(() => {
  this.atualizarPostos();
});
```

#### **F. Payload de Criação Simplificado**
```typescript
// Valores padrão adicionados para campos obrigatórios do backend
const payload = {
  nome: formValue.nome,
  cnpj: formValue.cnpj,
  endereco: formValue.endereco,
  quantidadeFuncionariosIdeal: 2,      // 🆕 Valor padrão
  horarioTrocaTurno: '06:00:00',       // 🆕 Valor padrão
  emailGestor: formValue.emailGestor || null,
  telefoneEmergencia: telefone || null,
};
```

**NOTA:** Os campos `quantidadeFuncionariosIdeal` e `horarioTrocaTurno` continuam sendo enviados ao backend com valores padrão, pois o backend ainda os exige (conforme comentários "FASE 1 backend" no DTO).

#### **G. Custo Operacional Atualizado**
```typescript
// ANTES
custoOperacional = computed(() => {
  const qtdFuncionarios = this.totalFuncionariosPorPostos();  // ❌ Dependia de postos
  // ...
});

// DEPOIS
custoOperacional = computed(() => {
  const qtdFuncionarios = this.formFuncionarios?.get('funcionarios')?.value?.length || 0;  // ✅ Funcionários cadastrados
  // ...
});
```

---

## 🎯 **Resultado Final**

### **Step 1 - Condomínio (Simplificado)**
Agora possui apenas **5 campos básicos**:
1. Nome do Condomínio *
2. CNPJ *
3. Endereço Completo *
4. E-mail do Gestor
5. Telefone de Emergência

### **Step 2 - Contrato (Inalterado)**
Mantém todos os campos financeiros e de período.

### **Step 3 - Funcionários (Inalterado)**
Mantém formulário de cadastro de funcionários.

---

## 📦 **Arquivos Modificados**

1. **condominio-wizard.component.html**
   - Removidas ~100 linhas (postos, inputs de configuração, info boxes)

2. **condominio-wizard.component.ts**
   - Removidas ~80 linhas (computed properties, getters, métodos)
   - Adicionados valores padrão no payload
   - **Corrigido:** `styleUrl` → `styleUrls` (propriedade correta do Angular)

---

## 🔍 **Compatibilidade com Backend**

O wizard continua compatível com o backend porque:
- ✅ Envia todos os campos obrigatórios do `CreateCondominioDto`
- ✅ `quantidadeFuncionariosIdeal` = 2 (padrão)
- ✅ `horarioTrocaTurno` = "06:00:00" (padrão)
- ✅ Postos de trabalho podem ser criados posteriormente via tela específica

---

## 🚀 **Próximos Passos**

1. ✅ Testar formulário no navegador
2. ✅ Validar que criação de condomínio funciona
3. ✅ Confirmar que steps 2 e 3 ainda funcionam
4. 🔄 (Opcional) Remover campos `quantidadeFuncionariosIdeal` e `horarioTrocaTurno` do backend se não forem mais necessários

---

## 💡 **Vantagens da Simplificação**

1. **UX mais simples:** Foco nos dados essenciais do condomínio
2. **Menos código:** ~180 linhas removidas
3. **Menos complexidade:** Sem cálculos automáticos de postos
4. **Flexibilidade:** Postos podem ser configurados depois com mais opções
5. **Manutenibilidade:** Código mais fácil de entender e manter
