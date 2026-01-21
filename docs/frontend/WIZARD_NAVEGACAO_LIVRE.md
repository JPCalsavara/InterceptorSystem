# ✅ WIZARD - NAVEGAÇÃO LIVRE COM VALIDAÇÃO
**Data:** 18/01/2026  
**Status:** ✅ IMPLEMENTADO
---
## 🎯 **Problema Resolvido**
### **ANTES (❌)**
- Steps só podiam ser clicados se o anterior fosse válido
- Ao voltar do STEP 2 para STEP 1, ficava com círculo verde (completed)
- Não mostrava erros ao tentar avançar com campos inválidos
### **DEPOIS (✅)**
- ✅ Todos os steps são **SEMPRE CLICÁVEIS**
- ✅ Step ativo fica **AZUL** (primary color)
- ✅ Steps inativos ficam **CINZA** (border-color)
- ✅ **Hover** mostra que é clicável (escala 1.1x)
- ✅ **Mensagem de erro** aparece quando tenta avançar sem preencher campos obrigatórios
---
## 📋 **Mudanças Implementadas**
### **1. TypeScript - Lógica de Navegação**
#### **Método `goToStep()` - ANTES**
```typescript
goToStep(step: number): void {
  if (step >= 1 && step <= this.totalSteps) {
    // ❌ Bloqueava navegação se anterior inválido
    if (step > this.currentStep()) {
      if (step === 2 && !this.formCondominio.valid) return;
      if (step === 3 && !this.formCondominio.valid) return;
    }
    this.currentStep.set(step);
    this.error.set(null);
  }
}
```
#### **Método `goToStep()` - DEPOIS**
```typescript
goToStep(step: number): void {
  if (step >= 1 && step <= this.totalSteps) {
    const currentStepNum = this.currentStep();
    // ✅ Valida apenas ao AVANÇAR, não ao clicar
    if (step > currentStepNum) {
      // Validar STEP 1
      if (currentStepNum === 1 && !this.formCondominio.valid) {
        this.markFormGroupTouched(this.formCondominio);
        this.error.set('⚠️ Preencha todos os campos obrigatórios do condomínio antes de avançar');
        return;
      }
      // Validar STEP 2
      if (currentStepNum === 2) {
        const criarContrato = this.formContrato?.get('criarContrato')?.value;
        if (criarContrato && !this.isContratoFormValid()) {
          this.markFormGroupTouched(this.formContrato);
          this.error.set('⚠️ Preencha todos os campos obrigatórios do contrato antes de avançar');
          return;
        }
      }
    }
    // ✅ Sempre permite mudar de step (navegação livre)
    this.currentStep.set(step);
    this.error.set(null);
  }
}
// ✅ Método auxiliar para validar contrato
private isContratoFormValid(): boolean {
  const valorDiaria = this.formContrato?.get('valorDiariaCobrada');
  const dataInicio = this.formContrato?.get('dataInicio');
  const mesesDuracao = this.formContrato?.get('mesesDuracao');
  return (valorDiaria?.valid && dataInicio?.valid && mesesDuracao?.valid) || false;
}
```
---
### **2. HTML - Indicadores Visuais**
#### **ANTES (❌ Com ícone de check verde)**
```html
<div class="step-item"
     [class.active]="currentStep() === step.number"
     [class.completed]="currentStep() > step.number">
  <div class="step-circle">
    @if (currentStep() > step.number) {
      <!-- ❌ Ícone de check verde -->
      <svg>...</svg>
    } @else if (currentStep() === step.number) {
      <div class="step-circle-filled"></div>
    } @else {
      <span class="step-number">{{ step.number }}</span>
    }
  </div>
</div>
```
#### **DEPOIS (✅ Sem ícone verde)**
```html
<div class="step-item"
     [class.active]="currentStep() === step.number"
     [class.clickable]="true"
     (click)="goToStep(step.number)">
  <div class="step-circle">
    @if (currentStep() === step.number) {
      <!-- ✅ Apenas círculo preenchido azul -->
      <div class="step-circle-filled"></div>
    } @else {
      <!-- ✅ Número do step sempre visível -->
      <span class="step-number">{{ step.number }}</span>
    }
  </div>
</div>
```
---
### **3. SCSS - Estilos Atualizados**
#### **ANTES (❌ Verde para completed)**
```scss
.step-item {
  cursor: pointer;
  &:hover:not(.completed) {
    .step-circle {
      transform: scale(1.1);
    }
  }
  &.completed {
    .step-circle {
      background: #4caf50; // ❌ Verde
      color: white;
    }
    .step-label {
      color: #4caf50;
    }
  }
}
.step-connector {
  &.completed {
    background: #4caf50; // ❌ Verde
  }
}
```
#### **DEPOIS (✅ Azul para ativo)**
```scss
.step-item {
  cursor: pointer;
  &:hover {
    .step-circle {
      transform: scale(1.1);
      border-color: var(--primary-color); // ✅ Azul no hover
    }
    .step-label {
      color: var(--primary-color);
    }
  }
  &.active {
    .step-circle {
      background: var(--primary-color); // ✅ Azul ativo
      color: white;
      transform: scale(1.15);
      .step-number {
        color: white;
      }
    }
    .step-label {
      color: var(--primary-color);
      font-weight: 700;
    }
  }
}
.step-connector {
  &.active {
    background: var(--primary-color); // ✅ Azul
  }
}
```
---
## 🎨 **Estados Visuais dos Steps**
### **Step Inativo (não selecionado)**
```
┌────────┐
│   1    │  ← Número cinza
└────────┘
  🏢
Condomínio ← Texto cinza
```
### **Step Ativo (selecionado atualmente)**
```
┌────────┐
│   ●    │  ← Círculo azul preenchido
└────────┘
  🏢
Condomínio ← Texto azul NEGRITO
```
### **Step com Hover**
```
┌────────┐
│   2    │  ← Borda azul + escala 1.1x
└────────┘
  📄
Contrato ← Texto azul
```
---
## 🔍 **Fluxo de Validação**
### **Cenário 1: Avançar sem preencher campos**
```
STEP 1 (campos vazios)
↓
Usuário clica em "2" ou "Próximo →"
↓
✅ Campos marcados como "touched"
✅ Mensagem de erro aparece no topo:
   "⚠️ Preencha todos os campos obrigatórios do condomínio antes de avançar"
✅ Permanece no STEP 1
✅ Erros visíveis embaixo de cada campo
```
### **Cenário 2: Voltar de um step posterior**
```
STEP 1 → STEP 2 → STEP 3
↓
Usuário clica em "1"
↓
✅ Volta para STEP 1 imediatamente
✅ SEM validação (pode voltar livremente)
✅ STEP 1 fica azul (ativo)
✅ STEP 2 e 3 ficam cinza (inativos)
```
### **Cenário 3: Pular steps (navegação livre)**
```
STEP 1 (campos preenchidos)
↓
Usuário clica em "3" (pula o 2)
↓
✅ STEP 2 é validado primeiro
✅ Se contrato habilitado e inválido → erro
✅ Se contrato desabilitado → permite pular
✅ Vai direto para STEP 3
```
---
## ✅ **Mensagens de Erro**
### **STEP 1 - Condomínio Inválido**
```
⚠️ Preencha todos os campos obrigatórios do condomínio antes de avançar
```
**Campos obrigatórios:**
- Nome (min 3 caracteres)
- CNPJ (formato válido)
- Endereço (min 5 caracteres)
- Número de Postos (1-10)
- Funcionários por Posto (1-5)
- Horário Troca Turno
### **STEP 2 - Contrato Inválido (se habilitado)**
```
⚠️ Preencha todos os campos obrigatórios do contrato antes de avançar
```
**Campos obrigatórios (quando checkbox marcado):**
- Valor Diária Cobrada
- Data Início
- Meses de Duração
---
## 🧪 **Como Testar**
### **Teste 1: Navegação Livre**
1. Abra wizard
2. Clique em "2" sem preencher STEP 1
3. ✅ Mensagem de erro aparece
4. ✅ Permanece no STEP 1
5. Preencha os campos obrigatórios
6. Clique em "2"
7. ✅ Avança para STEP 2
### **Teste 2: Voltar sem Validação**
1. Preencha STEP 1
2. Vá para STEP 2
3. Clique em "1"
4. ✅ Volta imediatamente (sem validar)
5. ✅ STEP 1 fica azul
6. ✅ STEP 2 fica cinza
### **Teste 3: Hover nos Steps**
1. Passe o mouse sobre qualquer step
2. ✅ Círculo aumenta (escala 1.1x)
3. ✅ Borda fica azul
4. ✅ Texto fica azul
5. ✅ Cursor vira pointer (mãozinha)
---
## 📊 **Comparação Visual**
### **ANTES (❌)**
```
Estado após voltar do STEP 2:
┌────────┐      ┌────────┐      ┌────────┐
│   ✓    │ ──── │   ●    │ ──── │   3    │
└────────┘      └────────┘      └────────┘
   🏢              📄              👥
Verde          Azul (ativo)     Cinza
(completed)
```
### **DEPOIS (✅)**
```
Estado após voltar do STEP 2:
┌────────┐      ┌────────┐      ┌────────┐
│   ●    │ ──── │   2    │ ──── │   3    │
└────────┘      └────────┘      └────────┘
   🏢              📄              👥
Azul (ativo)     Cinza          Cinza
```
---
## ✅ **Benefícios da Mudança**
1. ✅ **UX Melhorada:** Usuário pode navegar livremente
2. ✅ **Feedback Claro:** Mensagens de erro mostram o que falta
3. ✅ **Consistência Visual:** Apenas azul (ativo) e cinza (inativo)
4. ✅ **Campos Touched:** Erros aparecem ao tentar avançar
5. ✅ **Navegação Intuitiva:** Qualquer step sempre clicável
---
## 🎯 **Regras de Navegação**
| Ação | Validação | Resultado |
|------|-----------|-----------|
| Clicar em step anterior | ❌ NÃO | Volta imediatamente |
| Clicar em step posterior | ✅ SIM | Valida atual antes de avançar |
| Botão "Próximo →" | ✅ SIM | Valida atual |
| Botão "← Anterior" | ❌ NÃO | Volta imediatamente |
---
**Documentação atualizada:** 18/01/2026  
**Versão:** 3.0 (Navegação Livre)
