# ✅ REFATORAÇÃO DO WIZARD DE CRIAÇÃO COMPLETA

## 📋 **Objetivo**

Simplificar o formulário de condomínio removendo responsabilidades de configuração de equipe e movendo-as para o contrato, alinhando com o padrão do `condominio-form`.

---

## 🔄 **Mudanças Realizadas**

### **1. STEP 1 - Condomínio (Simplificado)**

#### ❌ **Campos Removidos:**
- `quantidadeFuncionariosIdeal` - Movido para o contrato
- `horarioTrocaTurno` - Movido para o contrato

#### ✅ **Campos Mantidos:**
- Nome do Condomínio *
- CNPJ *
- Endereço *
- Email do Gestor (opcional)
- Telefone de Emergência (opcional)

**Resultado:** Formulário mais limpo, focado apenas nos dados básicos do condomínio.

---

### **2. STEP 2 - Contrato (Expandido)**

#### ✅ **Nova Seção: Configuração de Equipe**
```
👥 Configuração de Equipe
├── Número de Postos de Trabalho (1-10) *
├── Funcionários por Posto (1-5) *
├── Total de Funcionários (calculado automaticamente)
└── Horário de Troca de Turno (HH:mm) *
```

#### ✅ **Cálculo Automático:**
```typescript
Total Funcionários = NumeroDePostos × FuncionariosPorPosto
```

**Exemplo:**
- 2 postos × 2 funcionários = **4 funcionários totais**

#### ✅ **Valores Atualizados:**
Agora os percentuais são em formato **0-100** (mais intuitivo):
- **Antes:** `0.30` (decimal)
- **Depois:** `30` (percentual)

**Campos afetados:**
- Adicional Noturno: 0-100%
- Percentual Impostos: 0-100%
- Margem de Lucro: 0-100%
- Margem Cobertura Faltas: 0-100%

#### ✅ **Valores Padrão Ajustados:**
```typescript
valorDiariaCobrada: 100 (antes: 120)
percentualAdicionalNoturno: 30% (antes: 0.30)
valorBeneficiosExtrasMensal: 350 (antes: 3600)
percentualImpostos: 15% (antes: 0.15)
margemLucroPercentual: 15% (antes: 0.20)
margemCoberturaFaltasPercentual: 10% (antes: 0.10)
```

#### ✅ **Datas Padrão:**
- **Data Início:** Data atual
- **Data Fim:** 6 meses à frente (padrão)

---

### **3. STEP 4 - Revisão (Atualizada)**

#### ✅ **Seção Condomínio:**
- Removido: Funcionários Ideal
- Removido: Horário Troca
- Mantido: Nome, CNPJ, Endereço, Email, Telefone

#### ✅ **Seção Contrato (Nova Informação):**
```
👥 Equipe:
2 postos × 2 funcionários = 4 total

Horário Troca: 06:00
```

---

## 🔧 **Mudanças Técnicas**

### **TypeScript (condominio-completo-wizard.component.ts)**

#### ✅ **Novo Signal:**
```typescript
quantidadeTotalFuncionarios = signal<number>(0);
```

#### ✅ **Formulário de Condomínio (Simplificado):**
```typescript
this.condominioForm = this.fb.group({
  nome: ['', [Validators.required, Validators.minLength(3)]],
  cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
  endereco: ['', [Validators.required]],
  emailGestor: ['', [Validators.email]],
  telefoneEmergencia: ['']
});
```

#### ✅ **Formulário de Contrato (Expandido):**
```typescript
this.contratoForm = this.fb.group({
  contratoDescricao: ['', [Validators.required]],
  numeroDePostos: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
  funcionariosPorPosto: [2, [Validators.required, Validators.min(1), Validators.max(5)]],
  horarioTrocaTurno: ['06:00', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
  // ... demais campos
});
```

#### ✅ **Novos Métodos:**
```typescript
calcularQuantidadeFuncionarios(): void {
  const numeroPostos = this.contratoForm.get('numeroDePostos')?.value || 0;
  const funcionariosPorPosto = this.contratoForm.get('funcionariosPorPosto')?.value || 0;
  this.quantidadeTotalFuncionarios.set(numeroPostos * funcionariosPorPosto);
}

calcularValorTotal(): void {
  // Usa funcionariosPorPosto e numeroDePostos do contratoForm
}
```

#### ✅ **Métodos de Data Padrão:**
```typescript
private getDefaultDataInicio(): string {
  return new Date().toISOString().split('T')[0]; // Hoje
}

private getDefaultDataFim(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 6); // +6 meses
  return date.toISOString().split('T')[0];
}
```

---

## 📊 **Validação Atualizada**

### **Step 2 (Contrato):**
```typescript
// Antes: soma >= 1 (decimal)
// Depois: soma >= 100 (percentual)
const somaMargens = 
  valores.percentualImpostos + 
  valores.margemLucroPercentual + 
  valores.margemCoberturaFaltasPercentual;

if (somaMargens >= 100) {
  this.errorMessage.set('A soma das margens deve ser menor que 100%.');
  return false;
}
```

---

## ✨ **Benefícios**

### **1. Separação de Responsabilidades**
- ✅ **Condomínio:** Apenas dados cadastrais básicos
- ✅ **Contrato:** Configuração operacional (equipe, valores, datas)

### **2. Melhor UX**
- ✅ Percentuais mais intuitivos (0-100 ao invés de 0-1)
- ✅ Valores padrão mais realistas
- ✅ Datas preenchidas automaticamente
- ✅ Cálculo automático de funcionários totais

### **3. Alinhamento com Padrões**
- ✅ Formulário de condomínio igual ao `condominio-form` existente
- ✅ Lógica de cálculo consistente com o backend

### **4. Manutenibilidade**
- ✅ Código mais limpo e organizado
- ✅ Validações mais claras
- ✅ Menos campos duplicados entre formulários

---

## 🎯 **Impacto na API**

O backend já espera os dados corretos:
```typescript
{
  condominio: {
    nome: string,
    cnpj: string,
    endereco: string,
    emailGestor?: string,
    telefoneEmergencia?: string
  },
  contrato: {
    numeroDePostos: number,
    funcionariosPorPosto: number,
    horarioTrocaTurno: string,
    // ... demais campos
  }
}
```

✅ **Nenhuma mudança necessária no backend!**

---

## 📝 **Próximos Passos Sugeridos**

1. ✅ Testar o wizard completo end-to-end
2. ✅ Validar cálculo de valores com dados reais
3. ✅ Confirmar criação de postos automáticos
4. 🔄 Ajustar CSS se necessário (espaçamento, cores)
5. 🔄 Adicionar tooltips explicativos nos campos

---

## 🎉 **Status: REFATORAÇÃO COMPLETA**

Todos os arquivos foram atualizados:
- ✅ `condominio-completo-wizard.component.html`
- ✅ `condominio-completo-wizard.component.ts`
- ✅ Sem erros de compilação
- ✅ Lógica de cálculo preservada
- ✅ Validações ajustadas
