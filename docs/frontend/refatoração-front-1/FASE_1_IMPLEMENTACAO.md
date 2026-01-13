# 🚀 FASE 1 - IMPLEMENTAÇÃO RÁPIDA (1-2h)

**Objetivo:** Usar endpoint de cálculo que JÁ EXISTE no backend

---

## 📝 PASSO A PASSO

### **1. Criar DTOs (15min)**

**Arquivo:** `frontend/src/app/models/contrato-calculo.models.ts`

```typescript
// Input para cálculo
export interface CalculoValorTotalInput {
  valorDiariaCobrada: number;
  quantidadeFuncionarios: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;              // 0.15 = 15%
  margemLucroPercentual: number;           // 0.20 = 20%
  margemCoberturaFaltasPercentual: number; // 0.10 = 10%
}

// Output do cálculo (vem do backend)
export interface CalculoValorTotalOutput {
  valorTotalMensal: number;      // R$ 72.000
  custoBaseMensal: number;       // R$ 39.600
  valorImpostos: number;         // R$ 10.800
  valorMargemLucro: number;      // R$ 14.400
  valorMargemFaltas: number;     // R$  7.200
  valorBeneficios: number;       // R$  3.600
  baseParaSalarios: number;      // R$ 36.000
}
```

**Adicionar ao `models/index.ts`:**
```typescript
// ...existing exports...
export * from './contrato-calculo.models';
```

---

### **2. Criar Service (15min)**

**Arquivo:** `frontend/src/app/services/contrato-calculo.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CalculoValorTotalInput, CalculoValorTotalOutput } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ContratoCalculoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/contratos/calculos`;

  /**
   * Calcula o valor total do contrato usando o backend
   * 
   * Backend já validado com 7 testes passando ✅
   */
  calcularValorTotal(input: CalculoValorTotalInput): Observable<CalculoValorTotalOutput> {
    return this.http.post<CalculoValorTotalOutput>(
      `${this.apiUrl}/calcular-valor-total`,
      input
    );
  }
}
```

---

### **3. Modificar Component (30min)**

**Arquivo:** `frontend/src/app/features/contratos/contrato-form/contrato-form.component.ts`

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service'; // ✅ NOVO
import { CondominioService } from '../../../services/condominio.service';
import { StatusContrato, CalculoValorTotalOutput } from '../../../models'; // ✅ NOVO
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'; // ✅ NOVO
import { of } from 'rxjs'; // ✅ NOVO

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contrato-form.component.html',
  styleUrl: './contrato-form.component.scss',
})
export class ContratoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ContratoService);
  private calculoService = inject(ContratoCalculoService); // ✅ NOVO
  private condominioService = inject(CondominioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  contratoId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  condominios = signal<any[]>([]);
  
  // ✅ NOVO - Estado do cálculo
  calculando = signal(false);
  erroCalculo = signal<string | null>(null);
  breakdown = signal<CalculoValorTotalOutput | null>(null);

  StatusContrato = StatusContrato;
  statusOptions = [
    { value: StatusContrato.PAGO, label: 'Pago' },
    { value: StatusContrato.PENDENTE, label: 'Pendente' },
    { value: StatusContrato.INATIVO, label: 'Inativo' },
  ];

  ngOnInit(): void {
    this.loadCondominios();
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contratoId.set(id);
      this.isEdit.set(true);
      this.loadContrato(id);
    }
    
    // ✅ NOVO - Calcular automaticamente quando valores mudarem
    this.setupAutoCalculo();
  }

  // ...existing loadCondominios()...

  buildForm(): void {
    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      valorDiariaCobrada: [0, [Validators.required, Validators.min(0)]],
      percentualAdicionalNoturno: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      valorBeneficiosExtrasMensal: [0, [Validators.required, Validators.min(0)]],
      percentualImpostos: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      quantidadeFuncionarios: [0, [Validators.required, Validators.min(1)]],
      margemLucroPercentual: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      margemCoberturaFaltasPercentual: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      status: [StatusContrato.PENDENTE, Validators.required],
    });
  }

  // ✅ NOVO - Setup auto-cálculo com debounce
  setupAutoCalculo(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(500), // Aguarda 500ms após última mudança
        distinctUntilChanged(),
        switchMap((valores) => {
          // Validar campos necessários
          if (!valores.valorDiariaCobrada || !valores.quantidadeFuncionarios) {
            this.breakdown.set(null);
            return of(null);
          }

          // Chamar backend
          this.calculando.set(true);
          this.erroCalculo.set(null);

          const input = {
            valorDiariaCobrada: valores.valorDiariaCobrada,
            quantidadeFuncionarios: valores.quantidadeFuncionarios,
            valorBeneficiosExtrasMensal: valores.valorBeneficiosExtrasMensal || 0,
            percentualImpostos: (valores.percentualImpostos || 0) / 100, // UI: 15, Backend: 0.15
            margemLucroPercentual: (valores.margemLucroPercentual || 0) / 100,
            margemCoberturaFaltasPercentual: (valores.margemCoberturaFaltasPercentual || 0) / 100,
          };

          return this.calculoService.calcularValorTotal(input);
        })
      )
      .subscribe({
        next: (resultado) => {
          this.calculando.set(false);
          if (resultado) {
            this.breakdown.set(resultado);
          }
        },
        error: (err) => {
          this.calculando.set(false);
          this.erroCalculo.set(err.error?.error || 'Erro ao calcular valor total');
          this.breakdown.set(null);
        },
      });
  }

  // ❌ REMOVER - Cálculo local errado
  // calcularValorTotal(): number { ... }
  // calcularValorTotalMensal(): number { ... }

  // ✅ NOVO - Getters para template
  get valorTotalCalculado(): number {
    return this.breakdown()?.valorTotalMensal || 0;
  }

  get temBreakdown(): boolean {
    return this.breakdown() !== null;
  }

  // ...existing loadContrato(), onSubmit(), etc...
}
```

---

### **4. Atualizar Template (30min)**

**Arquivo:** `frontend/src/app/features/contratos/contrato-form/contrato-form.component.html`

```html
<!-- ...existing form fields... -->

<!-- ✅ NOVO - Seção de Breakdown de Custos -->
<div class="breakdown-section" *ngIf="temBreakdown || calculando()">
  <h3>📊 Breakdown de Custos</h3>
  
  <!-- Loading -->
  <div *ngIf="calculando()" class="loading">
    <span class="spinner"></span>
    Calculando...
  </div>
  
  <!-- Erro -->
  <div *ngIf="erroCalculo()" class="alert alert-danger">
    {{ erroCalculo() }}
  </div>
  
  <!-- Breakdown -->
  <div *ngIf="breakdown() && !calculando()" class="breakdown-grid">
    <div class="breakdown-item total">
      <span class="label">Valor Total Mensal</span>
      <span class="value">{{ breakdown()!.valorTotalMensal | currency:'BRL' }}</span>
    </div>
    
    <div class="breakdown-item">
      <span class="label">Custo Base</span>
      <span class="value">{{ breakdown()!.custoBaseMensal | currency:'BRL' }}</span>
    </div>
    
    <div class="breakdown-item">
      <span class="label">Impostos ({{ form.value.percentualImpostos }}%)</span>
      <span class="value">{{ breakdown()!.valorImpostos | currency:'BRL' }}</span>
    </div>
    
    <div class="breakdown-item">
      <span class="label">Margem Lucro ({{ form.value.margemLucroPercentual }}%)</span>
      <span class="value">{{ breakdown()!.valorMargemLucro | currency:'BRL' }}</span>
    </div>
    
    <div class="breakdown-item">
      <span class="label">Margem Faltas ({{ form.value.margemCoberturaFaltasPercentual }}%)</span>
      <span class="value">{{ breakdown()!.valorMargemFaltas | currency:'BRL' }}</span>
    </div>
    
    <div class="breakdown-item">
      <span class="label">Benefícios</span>
      <span class="value">{{ breakdown()!.valorBeneficios | currency:'BRL' }}</span>
    </div>
    
    <div class="breakdown-item highlight">
      <span class="label">Base para Salários</span>
      <span class="value">{{ breakdown()!.baseParaSalarios | currency:'BRL' }}</span>
    </div>
  </div>
</div>

<!-- ...existing buttons... -->
```

---

### **5. Adicionar Estilos (5min)**

**Arquivo:** `frontend/src/app/features/contratos/contrato-form/contrato-form.component.scss`

```scss
.breakdown-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--surface-color);
  border-radius: 8px;
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
  }
  
  .breakdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: var(--background-color);
    border-radius: 4px;
    
    &.total {
      grid-column: 1 / -1;
      background: var(--primary-color);
      color: white;
      font-size: 1.25rem;
      font-weight: bold;
    }
    
    &.highlight {
      background: var(--success-color);
      color: white;
    }
    
    .label {
      font-weight: 500;
    }
    
    .value {
      font-weight: 700;
    }
  }
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após implementar:

- [ ] Abrir formulário de contrato
- [ ] Preencher campos:
  - Diária: R$ 100
  - Funcionários: 12
  - Benefícios: R$ 3.600
  - Impostos: 15%
  - Lucro: 20%
  - Faltas: 10%
- [ ] Ver breakdown aparecer automaticamente
- [ ] Verificar: **Valor Total = R$ 72.000** ✅ (não R$ 138.258 ❌)
- [ ] Verificar loading state
- [ ] Testar margens >= 100% (deve dar erro)

---

## 🎯 RESULTADO ESPERADO

**ANTES:**
- Cálculo errado: R$ 138.258 ❌
- Cálculo no frontend (fonte única de erro)
- Sem validação de margens

**DEPOIS:**
- Cálculo correto: R$ 72.000 ✅
- Backend como fonte da verdade
- Validação automática
- Breakdown visual
- Loading state
- Tratamento de erros

**Tempo Total:** ~1 hora  
**Complexidade:** 🟢 Baixa  
**Risco:** 🟢 Zero (backend já testado)

---

**Próximo:** FASE 2 - Atualizar modelos (3-5h)

