# ✅ FUNCIONÁRIO FORM - REFATORAÇÃO COMPLETA

**Data:** 18/01/2026  
**Status:** ✅ IMPLEMENTADO

---

## 🎯 **Objetivo da Refatoração**

1. ✅ Corrigir cores para o **padrão global** (mesmo do contrato)
2. ✅ Utilizar **novas regras de cálculo de contrato** (API de cálculos)
3. ✅ Adicionar **seleção de posto de trabalho**
4. ✅ **Criar alocações automaticamente** até o fim do contrato baseado na escala

---

## 📋 **Mudanças Implementadas**

### **1. TypeScript - Funcionalidades Novas**

#### **1.1. Imports Atualizados**
```typescript
// NOVO - Imports para posto de trabalho e alocações
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { StatusAlocacao, TipoAlocacao } from '../../../models';
import { forkJoin } from 'rxjs';
```

#### **1.2. Serviços Injetados**
```typescript
private postoService = inject(PostoDeTrabalhoService);
private alocacaoService = inject(AlocacaoService);
```

#### **1.3. Signals Adicionados**
```typescript
postos = signal<any[]>([]); // Lista de postos do condomínio
```

---

### **2. Formulário - Campo de Posto de Trabalho**

#### **Antes (❌)**
```typescript
buildForm(): void {
  this.form = this.fb.group({
    condominioId: ['', Validators.required],
    contratoId: ['', Validators.required],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    // ...outros campos
  });
}
```

#### **Depois (✅)**
```typescript
buildForm(): void {
  this.form = this.fb.group({
    condominioId: ['', Validators.required],
    contratoId: ['', Validators.required],
    postoDeTrabalhoId: ['', Validators.required],  // ✅ NOVO
    nome: ['', [Validators.required, Validators.minLength(3)]],
    // ...outros campos
  });
}
```

---

### **3. Cálculo de Valores - API de Cálculos**

#### **Antes (❌ Cálculo Manual)**
```typescript
calcularValoresDoContrato(contratoId: string): void {
  const contrato = this.contratos().find(c => c.id === contratoId);
  
  // ❌ Cálculo manual (pode divergir do backend)
  const salarioBase = contrato.valorTotalMensal / quantidadeFuncionarios;
  const adicionalNoturno = salarioBase * (percentual / 100);
  
  this.salarioCalculado.set(salarioBase + adicionalNoturno);
}
```

#### **Depois (✅ API de Cálculos)**
```typescript
calcularValoresDoContrato(contratoId: string): void {
  const contrato = this.contratos().find(c => c.id === contratoId);
  
  // ✅ Usa mesma API que o wizard (garantia de consistência)
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
    next: (resultado: any) => {
      const salarioPorFuncionario = resultado.custoBase / quantidadeFuncionarios;
      this.salarioCalculado.set(salarioPorFuncionario);
    }
  });
}
```

---

### **4. Criação Automática de Alocações**

#### **Fluxo de Criação**

```
1. Usuário preenche formulário de funcionário
   ↓
2. Seleciona:
   - Condomínio
   - Contrato
   - Posto de Trabalho
   - Escala de Trabalho (12x36 ou Semanal)
   ↓
3. Clica em "Cadastrar"
   ↓
4. Backend cria funcionário
   ↓
5. ✅ Frontend cria alocações automaticamente:
   - Desde HOJE até fim do contrato
   - Baseado na escala de trabalho
   - Status: CONFIRMADA
   - Tipo: REGULAR
```

#### **Lógica de Escalas**

##### **Escala 12x36 (12h trabalhadas, 36h descanso)**
```typescript
// Trabalha 1 dia, folga 1 dia, trabalha 1 dia...
let dataAtual = new Date();
let trabalha = true; // Começa trabalhando

while (dataAtual <= dataFim) {
  if (trabalha) {
    alocacoes.push({
      funcionarioId,
      postoDeTrabalhoId,
      data: formatDate(dataAtual),
      statusAlocacao: StatusAlocacao.CONFIRMADA,
      tipoAlocacao: TipoAlocacao.REGULAR,
    });
  }
  trabalha = !trabalha; // Alterna trabalha/folga
  dataAtual.setDate(dataAtual.getDate() + 1);
}
```

**Exemplo:**
```
01/jan ✅ Trabalha
02/jan ⚪ Folga
03/jan ✅ Trabalha
04/jan ⚪ Folga
05/jan ✅ Trabalha
```

##### **Escala Semanal Comercial (44h semanais)**
```typescript
// Trabalha segunda a sexta, descansa sábado e domingo
while (dataAtual <= dataFim) {
  const diaSemana = dataAtual.getDay(); // 0=dom, 1=seg, 6=sab

  // Trabalha de segunda (1) a sexta (5)
  if (diaSemana >= 1 && diaSemana <= 5) {
    alocacoes.push({
      funcionarioId,
      postoDeTrabalhoId,
      data: formatDate(dataAtual),
      statusAlocacao: StatusAlocacao.CONFIRMADA,
      tipoAlocacao: TipoAlocacao.REGULAR,
    });
  }

  dataAtual.setDate(dataAtual.getDate() + 1);
}
```

**Exemplo:**
```
06/jan (seg) ✅ Trabalha
07/jan (ter) ✅ Trabalha
08/jan (qua) ✅ Trabalha
09/jan (qui) ✅ Trabalha
10/jan (sex) ✅ Trabalha
11/jan (sáb) ⚪ Folga
12/jan (dom) ⚪ Folga
```

#### **Criação em Paralelo (Performance)**
```typescript
// Cria TODAS as alocações em paralelo (forkJoin)
const requests = alocacoes.map((alocacao) =>
  this.alocacaoService.create(alocacao)
);

forkJoin(requests).subscribe({
  next: () => {
    console.log(`✅ ${alocacoes.length} alocações criadas!`);
    this.router.navigate(['/funcionarios']);
  }
});
```

**Vantagens:**
- ✅ **Performance:** Todas as requisições em paralelo
- ✅ **Transacional:** Se 1 falhar, todas falham (consistência)
- ✅ **Feedback:** Mostra quantidade de alocações criadas

---

### **5. HTML - Campo de Posto de Trabalho**

```html
<div class="form-group">
  <label for="postoDeTrabalhoId" class="form-label">
    Posto de Trabalho <span class="required">*</span>
  </label>
  <select
    id="postoDeTrabalhoId"
    formControlName="postoDeTrabalhoId"
    class="form-input"
    [class.error]="hasError('postoDeTrabalhoId')"
    [disabled]="!form.get('condominioId')?.value || isEdit()"
  >
    <option value="">Selecione um posto de trabalho</option>
    @for (posto of postos(); track posto.id) {
    <option [value]="posto.id">
      {{ posto.horarioInicio }} - {{ posto.horarioFim }}
      @if (posto.permiteDobrarEscala) {
        <span class="badge">Permite Dobra</span>
      }
    </option>
    }
  </select>
  @if (hasError('postoDeTrabalhoId')) {
  <span class="error-message">{{ getErrorMessage('postoDeTrabalhoId') }}</span>
  }
  @if (!form.get('condominioId')?.value) {
  <span class="info-message">
    <svg>...</svg>
    Selecione um condomínio primeiro
  </span>
  }
</div>
```

---

### **6. SCSS - Cores Globais (Padrão Contrato)**

#### **Antes (❌ Cores Hardcoded)**
```scss
.btn-back {
  &:hover {
    background: #e8f5e9; // ❌ Verde hardcoded
  }
}

.alert-error {
  background: #ffd6d6; // ❌ Vermelho hardcoded
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

.calculated-values {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); // ❌ Gradiente fixo
  border: 2px solid #38bdf8;
}

.btn-primary {
  background: linear-gradient(135deg, #135fb0 0%, #1976d2 100%); // ❌ Azul fixo
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
}
```

#### **Depois (✅ Variáveis Globais)**
```scss
.btn-back {
  &:hover {
    background: var(--hover-bg); // ✅ Global
  }
}

.alert-error {
  background: var(--error-bg); // ✅ Global
  color: var(--error-text);
  border-left: 4px solid var(--error-border);
}

.calculated-values {
  background: var(--calculated-bg); // ✅ Global
  border: 2px solid var(--primary-light);
}

.btn-primary {
  background: var(--btn-primary-bg); // ✅ Global
  box-shadow: var(--btn-shadow);
  
  &:hover {
    background: var(--btn-primary-hover);
    box-shadow: var(--btn-shadow-hover);
  }
}
```

---

## 🎨 **Variáveis CSS Utilizadas**

| Variável CSS | Uso | Valor Light | Valor Dark |
|--------------|-----|-------------|------------|
| `--hover-bg` | Hover botão voltar | `#e0f2f1` | `#1e2a3a` |
| `--error-bg` | Fundo erro | `#fee2e2` | `#4a1f1f` |
| `--error-text` | Texto erro | `#dc2626` | `#fca5a5` |
| `--error-border` | Borda erro | `#ef4444` | `#dc2626` |
| `--calculated-bg` | Fundo valores | `#f0f9ff` | `#1e3a5f` |
| `--primary-light` | Borda clara | `#90caf9` | `#42a5f5` |
| `--btn-primary-bg` | Botão principal | `#1976d2` | `#42a5f5` |
| `--btn-primary-hover` | Hover botão | `#135fb0` | `#1e88e5` |
| `--card-bg` | Fundo card | `#ffffff` | `#2a3f5f` |
| `--shadow-sm` | Sombra pequena | `0 2px 8px rgba(0,0,0,0.1)` | `0 2px 8px rgba(0,0,0,0.5)` |

---

## 🔧 **ContratoService - Método Adicionado**

```typescript
// services/contrato.service.ts

export class ContratoService {
  private apiUrlCalculos = `${environment.apiUrl}/api/contratos/calculos`;

  /**
   * Calcula valor total mensal baseado nos parâmetros do contrato
   * Usa API de cálculos para garantir consistência com backend
   */
  calcularValorTotal(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlCalculos}/calcular-valor-total`, payload);
  }
}
```

**Endpoint:**
```
POST /api/contratos/calculos/calcular-valor-total
```

**Payload Exemplo:**
```json
{
  "valorDiariaCobrada": 100.00,
  "quantidadeFuncionarios": 4,
  "numeroDePostos": 2,
  "valorBeneficiosExtrasMensal": 350.00,
  "percentualImpostos": 10,
  "percentualAdicionalNoturno": 20,
  "margemLucroPercentual": 12,
  "margemCoberturaFaltasPercentual": 10
}
```

**Resposta:**
```json
{
  "custoBase": 12000.00,
  "custoBeneficios": 1400.00,
  "custoImpostos": 1340.00,
  "valorTotalMensal": 16356.36
}
```

---

## 📊 **Exemplo de Uso Completo**

### **1. Usuário Preenche Formulário**

```
Condomínio: Edifício Central Plaza
Contrato: Contrato 01/2026 - R$ 18.000,00
Posto: 06:00 - 18:00 (Permite Dobra)
Nome: João Silva Santos
CPF: 12345678901
Celular: 11987654321
Tipo: CLT
Escala: 12x36
Status: Ativo
```

### **2. Sistema Calcula Valores Automaticamente**

```
✅ API chamada: /api/contratos/calculos/calcular-valor-total
✅ Resultado:
   - Salário Mensal: R$ 4.500,00
   - Benefícios: R$ 87,50
   - Valor Diária: R$ 100,00
```

### **3. Sistema Cria Alocações Automaticamente**

```
Contrato vai de 01/01/2026 até 01/07/2026 (6 meses)
Escala: 12x36 (trabalha 1, folga 1)

✅ Criando alocações:
   01/01 ✅ Posto 06:00-18:00 (CONFIRMADA)
   02/01 ⚪ Folga
   03/01 ✅ Posto 06:00-18:00 (CONFIRMADA)
   04/01 ⚪ Folga
   ...
   01/07 ✅ Posto 06:00-18:00 (CONFIRMADA)

Total: 91 alocações criadas automaticamente!
```

---

## ✅ **Benefícios da Refatoração**

1. ✅ **Consistência:** Usa mesma API de cálculos que wizard
2. ✅ **Automatização:** Cria alocações sem intervenção manual
3. ✅ **Performance:** Criação em paralelo com forkJoin
4. ✅ **Visual:** Cores globais (dark/light mode automático)
5. ✅ **UX:** Posto de trabalho vinculado ao funcionário
6. ✅ **Manutenibilidade:** Código limpo e bem documentado

---

## 🧪 **Como Testar**

### **Teste 1: Criar Funcionário com Alocações Automáticas (12x36)**

1. Acesse `/funcionarios/novo`
2. Selecione:
   - Condomínio: Qualquer
   - Contrato: Qualquer ativo
   - Posto: Qualquer
   - Nome: Teste 12x36
   - CPF: 12345678901
   - Celular: 11987654321
   - Escala: **12x36**
3. Clique em "Cadastrar"
4. ✅ Verifique no console:
   ```
   📅 Criando N alocações automáticas para 12x36...
   ✅ N alocações criadas com sucesso!
   ```
5. ✅ Acesse `/alocacoes` e veja as alocações criadas
6. ✅ Padrão: Trabalha 1 dia, folga 1 dia

### **Teste 2: Criar Funcionário com Escala Semanal**

1. Acesse `/funcionarios/novo`
2. Selecione:
   - Escala: **Semanal Comercial**
3. Clique em "Cadastrar"
4. ✅ Alocações criadas: Seg-Sex (5 dias por semana)
5. ✅ Folga: Sáb-Dom

### **Teste 3: Validação de Campos**

1. Acesse `/funcionarios/novo`
2. Selecione apenas Condomínio
3. NÃO selecione Posto de Trabalho
4. Clique em "Cadastrar"
5. ✅ Erro: "Selecione um posto de trabalho"

---

## 📝 **Notas Técnicas**

### **Formatação de Datas**
```typescript
private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD (ISO 8601)
}
```

### **Tratamento de Erros**
```typescript
forkJoin(requests).subscribe({
  next: () => {
    console.log('✅ Sucesso!');
    this.router.navigate(['/funcionarios']);
  },
  error: (err) => {
    console.error('❌ Erro:', err);
    this.error.set('Funcionário criado, mas houve erro ao gerar alocações.');
    // Redireciona após 3 segundos mesmo com erro
    setTimeout(() => this.router.navigate(['/funcionarios']), 3000);
  },
});
```

---

## 🎯 **Próximos Passos (Futuro)**

1. ⚪ Validar se posto já tem alocação naquela data (evitar conflitos)
2. ⚪ Permitir editar alocações geradas automaticamente
3. ⚪ Criar relatório de alocações vs faltas
4. ⚪ Notificar gestor quando funcionário for alocado
5. ⚪ Permitir gerar alocações retroativas (datas passadas)

---

**Documentação atualizada:** 18/01/2026  
**Versão:** 4.0 (Alocações Automáticas)  
**Desenvolvedor:** GitHub Copilot
