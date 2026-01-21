# 🔧 CORREÇÃO - CÁLCULO DE SALÁRIO DO FUNCIONÁRIO

**Data:** 18/01/2026  
**Tipo:** Bug Fix - Fórmula de Cálculo  
**Status:** ✅ CORRIGIDO

---

## 🐛 **Problema Identificado**

O cálculo de salário do funcionário estava **incorreto** e não seguia a regra de negócio especificada.

### **Antes (❌ INCORRETO)**

```typescript
next: (resultado) => {
  // ❌ ERRADO: Usava custoBase da API dividido por quantidade
  const salarioPorFuncionario = resultado.custoBase / quantidadeFuncionarios;
  const beneficiosPorFuncionario = contrato.valorBeneficiosExtrasMensal / quantidadeFuncionarios;

  this.salarioCalculado.set(salarioPorFuncionario);
  this.beneficiosCalculados.set(beneficiosPorFuncionario);
}
```

**Problemas:**
1. ❌ Dependia da resposta da API (campo `resultado.custoBase`)
2. ❌ Não aplicava a fórmula correta
3. ❌ Não considerava o adicional noturno de forma adequada

---

## ✅ **Solução Implementada**

### **Fórmula Correta**

```
Salário Base = (custoBaseMensal + benefícios)

Se escala for 12x36 (noturna):
  Salário Final = Salário Base × (1 + percentualAdicionalNoturno)
Senão:
  Salário Final = Salário Base
```

### **Onde:**
- `custoBaseMensal = valorDiariaCobrada × 30 dias`
- `benefícios = valorBeneficiosExtrasMensal ÷ quantidadeFuncionarios`
- `percentualAdicionalNoturno` = Ex: 20% → 0.20

---

## 📊 **Exemplo de Cálculo**

### **Dados do Contrato**
```
Valor Diária: R$ 100,00
Benefícios Extras Mensal: R$ 350,00
Quantidade de Funcionários: 4
Adicional Noturno: 20%
Escala: 12x36
```

### **Passo a Passo**

#### **1. Custo Base Mensal (30 dias)**
```
custoBaseMensal = R$ 100,00 × 30 dias
custoBaseMensal = R$ 3.000,00
```

#### **2. Benefícios por Funcionário**
```
beneficiosPorFuncionario = R$ 350,00 ÷ 4 funcionários
beneficiosPorFuncionario = R$ 87,50
```

#### **3. Salário Base (sem adicional)**
```
salarioBase = R$ 3.000,00 + R$ 87,50
salarioBase = R$ 3.087,50
```

#### **4. Aplicar Adicional Noturno (escala 12x36)**
```
adicionalNoturno = 20% = 0.20
salarioFinal = R$ 3.087,50 × (1 + 0.20)
salarioFinal = R$ 3.087,50 × 1.20
salarioFinal = R$ 3.705,00
```

### **Resultado Final**
```
💵 Salário Mensal: R$ 3.705,00
🎁 Benefícios: R$ 87,50
📅 Valor Diária: R$ 100,00
```

---

## 💻 **Código Corrigido**

```typescript
calcularValoresDoContrato(contratoId: string): void {
  const contrato = this.contratos().find(c => c.id === contratoId);

  if (!contrato) {
    return;
  }

  this.contratoSelecionado.set(contrato);

  const payload = {
    valorDiariaCobrada: contrato.valorDiariaCobrada,
    quantidadeFuncionarios: contrato.quantidadeFuncionarios,
    numeroDePostos: contrato.numeroDePostos,
    valorBeneficiosExtrasMensal: contrato.valorBeneficiosExtrasMensal,
    percentualImpostos: contrato.percentualImpostos,
    percentualAdicionalNoturno: contrato.percentualAdicionalNoturno,
    margemLucroPercentual: contrato.margemLucroPercentual,
    margemCoberturaFaltasPercentual: contrato.margemCoberturaFaltasPercentual,
  };

  this.contratoService.calcularValorTotal(payload).subscribe({
    next: () => {
      // Valores por funcionário
      const quantidadeFuncionarios = contrato.quantidadeFuncionarios || 1;
      const tipoEscala = this.form.get('tipoEscala')?.value;
      
      // ✅ PASSO 1: Custo base mensal (diária * 30 dias)
      const custoBaseMensal = contrato.valorDiariaCobrada * 30;
      
      // ✅ PASSO 2: Benefícios por funcionário
      const beneficiosPorFuncionario = contrato.valorBeneficiosExtrasMensal / quantidadeFuncionarios;
      
      // ✅ PASSO 3: Salário base (custoBaseMensal + benefícios)
      let salarioBase = custoBaseMensal + beneficiosPorFuncionario;
      
      // ✅ PASSO 4: Se for escala noturna (12x36), aplica adicional
      if (tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) {
        const adicionalNoturno = contrato.percentualAdicionalNoturno / 100;
        salarioBase = salarioBase * (1 + adicionalNoturno);
      }

      this.salarioCalculado.set(salarioBase);
      this.beneficiosCalculados.set(beneficiosPorFuncionario);
      this.valorDiariaCalculado.set(contrato.valorDiariaCobrada);
    },
    error: (err) => {
      console.error('Erro ao calcular valores:', err);
      
      // ✅ FALLBACK: Mesmo cálculo se API falhar
      const quantidadeFuncionarios = contrato.quantidadeFuncionarios || 1;
      const tipoEscala = this.form.get('tipoEscala')?.value;
      
      const custoBaseMensal = contrato.valorDiariaCobrada * 30;
      const beneficiosPorFuncionario = contrato.valorBeneficiosExtrasMensal / quantidadeFuncionarios;
      
      let salarioBase = custoBaseMensal + beneficiosPorFuncionario;
      
      if (tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) {
        const adicionalNoturno = contrato.percentualAdicionalNoturno / 100;
        salarioBase = salarioBase * (1 + adicionalNoturno);
      }
      
      this.salarioCalculado.set(salarioBase);
      this.beneficiosCalculados.set(beneficiosPorFuncionario);
      this.valorDiariaCalculado.set(contrato.valorDiariaCobrada);
    }
  });
}
```

---

## 🔍 **Diferenças Entre Escalas**

### **Escala 12x36 (Noturno)**
```
Base: R$ 3.087,50
Adicional 20%: R$ 617,50
Total: R$ 3.705,00 ✅
```

**Características:**
- ✅ Recebe adicional noturno (20%)
- ✅ Trabalha 12h, descansa 36h (1 dia sim, 1 dia não)
- ✅ Horário típico: 18h - 06h ou 06h - 18h

### **Escala Semanal Comercial**
```
Base: R$ 3.087,50
Adicional: R$ 0,00 (não tem)
Total: R$ 3.087,50 ✅
```

**Características:**
- ⚪ NÃO recebe adicional noturno
- ✅ Trabalha 44h semanais (Seg-Sex)
- ✅ Descansa Sáb-Dom
- ✅ Horário típico: 08h - 17h

---

## 📋 **Tabela Comparativa**

| Item | Escala 12x36 | Escala Semanal |
|------|--------------|----------------|
| **Custo Base** | R$ 3.000,00 | R$ 3.000,00 |
| **Benefícios** | R$ 87,50 | R$ 87,50 |
| **Subtotal** | R$ 3.087,50 | R$ 3.087,50 |
| **Adicional Noturno (20%)** | **+ R$ 617,50** | R$ 0,00 |
| **TOTAL** | **R$ 3.705,00** | **R$ 3.087,50** |
| **Dias trabalhados/mês** | ~15 dias | ~22 dias |
| **Horas trabalhadas/mês** | ~180h | ~176h |

---

## ✅ **Validação**

### **Teste 1: Funcionário 12x36**
```
Input:
  - Diária: R$ 100,00
  - Benefícios Total: R$ 350,00
  - Funcionários: 4
  - Adicional Noturno: 20%
  - Escala: 12x36

Output:
  ✅ Salário: R$ 3.705,00
  ✅ Benefícios: R$ 87,50
  ✅ Diária: R$ 100,00
```

### **Teste 2: Funcionário Semanal**
```
Input:
  - Diária: R$ 100,00
  - Benefícios Total: R$ 350,00
  - Funcionários: 4
  - Adicional Noturno: 20% (não aplicado)
  - Escala: Semanal

Output:
  ✅ Salário: R$ 3.087,50
  ✅ Benefícios: R$ 87,50
  ✅ Diária: R$ 100,00
```

---

## 🧪 **Como Testar no Sistema**

1. Acesse `/funcionarios/novo`
2. Selecione:
   - Condomínio: Qualquer
   - Contrato: Qualquer ativo com:
     - Diária: R$ 100,00
     - Benefícios: R$ 350,00
     - Funcionários: 4
     - Adicional Noturno: 20%
3. Selecione Escala: **12x36**
4. ✅ Verifique na seção "Valores Calculados":
   - Salário Mensal: **R$ 3.705,00**
5. Altere para Escala: **Semanal**
6. ✅ Verifique:
   - Salário Mensal: **R$ 3.087,50**

---

## 📝 **Notas Importantes**

### **Por que multiplicar por (1 + adicional)?**

```typescript
// ❌ ERRADO: Adiciona apenas o percentual
salarioFinal = salarioBase + (salarioBase * adicionalNoturno);
// Ex: 3000 + (3000 * 0.20) = 3000 + 600 = 3600

// ✅ CORRETO: Multiplica por (1 + percentual)
salarioFinal = salarioBase * (1 + adicionalNoturno);
// Ex: 3000 * (1 + 0.20) = 3000 * 1.20 = 3600
```

**Ambas as formas dão o mesmo resultado**, mas `(1 + adicional)` é mais comum em cálculos financeiros.

### **Por que 30 dias?**

```typescript
custoBaseMensal = valorDiariaCobrada * 30;
```

**Convenção comercial:**
- ✅ Contratos mensais usam 30 dias como base
- ✅ Facilita cálculo (independente de fevereiro ter 28/29 dias)
- ✅ Padronização com mercado de trabalho

---

## 🎯 **Impacto da Correção**

### **Antes (Bug)**
- ❌ Salário variava dependendo da resposta da API
- ❌ Não aplicava adicional noturno corretamente
- ❌ Cálculo inconsistente entre frontend e backend

### **Depois (Corrigido)**
- ✅ Fórmula clara e documentada
- ✅ Adicional noturno aplicado apenas em escala 12x36
- ✅ Cálculo consistente e previsível
- ✅ Mesmo resultado no sucesso ou fallback (se API falhar)

---

## 📊 **Fórmula Visual**

```
┌─────────────────────────────────────────────────────┐
│  CÁLCULO DE SALÁRIO DO FUNCIONÁRIO                  │
└─────────────────────────────────────────────────────┘

📌 ETAPA 1: Custo Base Mensal
   valorDiariaCobrada × 30 dias = custoBaseMensal
   R$ 100,00 × 30 = R$ 3.000,00

📌 ETAPA 2: Benefícios por Funcionário
   valorBeneficiosExtrasMensal ÷ quantidadeFuncionarios
   R$ 350,00 ÷ 4 = R$ 87,50

📌 ETAPA 3: Salário Base
   custoBaseMensal + beneficiosPorFuncionario
   R$ 3.000,00 + R$ 87,50 = R$ 3.087,50

📌 ETAPA 4: Adicional Noturno (SE escala 12x36)
   salarioBase × (1 + percentualAdicionalNoturno)
   R$ 3.087,50 × (1 + 0.20) = R$ 3.705,00

┌─────────────────────────────────────────────────────┐
│  RESULTADO FINAL: R$ 3.705,00                       │
└─────────────────────────────────────────────────────┘
```

---

**Documentação atualizada:** 18/01/2026  
**Versão:** 4.1 (Correção Cálculo Salário)  
**Desenvolvedor:** GitHub Copilot
