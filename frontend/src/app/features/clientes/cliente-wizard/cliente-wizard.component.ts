import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, firstValueFrom, forkJoin } from 'rxjs';
import { CriarClienteCompletoOutput } from '../../../services/cliente-completo.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import {
  StatusContrato,
  StatusFuncionario,
  TipoFuncionario,
  TipoEscala,
} from '../../../models/index';

@Component({
  selector: 'app-cliente-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-wizard.component.html',
  styleUrls: ['./cliente-wizard.component.scss'],
})
export class ClienteWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private calculoService = inject(ContratoCalculoService);
  private funcionarioService = inject(FuncionarioService);
  private router = inject(Router);

  // Controle do wizard
  currentStep = signal(1);
  totalSteps = 3;
  loading = signal(false);
  error = signal<string | null>(null);

  // Formulários de cada etapa
  formCliente!: FormGroup;
  formContrato!: FormGroup;
  formFuncionarios!: FormGroup;

  // Labels dos steps
  steps = [
    { number: 1, label: 'Cliente', icon: 'building-office' },
    { number: 2, label: 'Contrato', icon: 'document-text' },
    { number: 3, label: 'Funcionários', icon: 'user-group' },
  ];

  // Computed para controle de navegação
  canGoNext(): boolean {
    const step = this.currentStep();
    if (step === 1) return this.formCliente?.valid ?? false;
    if (step === 2) {
      const criarContrato = this.formContrato?.get('criarContrato')?.value;
      if (criarContrato) return this.formContrato?.valid ?? false;
      return true;
    }
    if (step === 3) return true; // Funcionários são opcionais
    return false;
  }

  canGoBack = computed(() => this.currentStep() > 1);
  isLastStep = computed(() => this.currentStep() === this.totalSteps);

  // Breakdown do contrato (resultado da API)
  breakdown = signal<any>(null);
  calculando = signal(false);

  // Cálculos simplificados para exibição (usam dados do breakdown quando disponível)
  custoOperacional = computed(() => {
    return this.breakdown()?.custoBaseMensal || 0;
  });

  margemLucro = computed(() => {
    return this.breakdown()?.valorMargemLucro || 0;
  });

  margemFaltas = computed(() => {
    return this.breakdown()?.valorMargemFaltas || 0;
  });

  faturamentoMensal = computed(() => {
    return this.breakdown()?.valorTotalMensal || 0;
  });

  // Custo estimado por escala (diária × dias, sem contar benefícios pois varia)
  custoEstimado12x36 = computed(() => {
    const postos = this.formContrato?.get('postosConfig')?.value || [];
    const diaria = postos.length > 0 ? (postos[0].valorDiariaCobrada || 0) : 0;
    return 15 * diaria;
  });

  custoEstimado5x2 = computed(() => {
    const postos = this.formContrato?.get('postosConfig')?.value || [];
    const diaria = postos.length > 0 ? (postos[0].valorDiariaCobrada || 0) : 0;
    return 22 * diaria;
  });

  totalFuncionariosPorPostos = computed(() => {
    return this.funcionarios?.length || 0;
  });

  quantidadeTotalFuncionarios = computed(() => {
    const postos = this.formContrato?.get('postosConfig')?.value || [];
    let total = 0;
    for (const posto of postos) {
      total += (posto.quantidadeAlocacoes || 0) * (posto.quantidadeFuncionariosPorAlocacao || 0);
    }
    return total;
  });

  ngOnInit(): void {
    this.buildForms();
    this.setupAutoCalculo();
  }

  setupAutoCalculo(): void {
    // Observar mudanças no formContrato e formCliente para recalcular via API
    this.formContrato.valueChanges
      .pipe(
        debounceTime(500), // Aguarda 500ms após última mudança
        distinctUntilChanged(),
        switchMap((valores) => {
          // Só calcular se checkbox estiver marcado
          if (!valores.criarContrato) {
            this.breakdown.set(null);
            return of(null);
          }

          const postos = valores.postosConfig || [];
          if (!postos.length) return of(null);

          // Build input for each posto
          const requests = postos.map((posto: any) => {
             const qtdeFuncionarios = (posto.quantidadeAlocacoes || 1) * (posto.quantidadeFuncionariosPorAlocacao || 1);
             const input = {
                valorDiariaCobrada: posto.valorDiariaCobrada || 0,
                quantidadeFuncionarios: qtdeFuncionarios,
                numeroDePostos: posto.quantidadeAlocacoes || 1,
                numeroDePostosNoturnos: Math.floor((posto.quantidadeAlocacoes || 1) / 2),
                valorBeneficiosExtrasMensal: posto.valorBeneficiosExtrasMensal || 0,
                percentualImpostos: (valores.percentualImpostos || 0) / 100,
                percentualAdicionalNoturno: (valores.percentualAdicionalNoturno || 0) / 100,
                margemLucroPercentual: (valores.percentualMargemLucro || 0) / 100,
                margemCoberturaFaltasPercentual: (valores.percentualMargemFaltas || 0) / 100,
             };
             return this.calculoService.calcularValorTotal(input);
          });

          this.calculando.set(true);
          return forkJoin(requests);
        }),
      )
      .subscribe({
        next: (resultados: any) => {
          this.calculando.set(false);
          if (resultados && resultados.length > 0) {
             const combined = {
                valorTotalMensal: 0,
                custoBaseMensal: 0,
                valorMargemLucro: 0,
                valorMargemFaltas: 0
             };
             resultados.forEach((res: any) => {
                if (res) {
                   combined.valorTotalMensal += res.valorTotalMensal || 0;
                   combined.custoBaseMensal += res.custoBaseMensal || 0;
                   combined.valorMargemLucro += res.valorMargemLucro || 0;
                   combined.valorMargemFaltas += res.valorMargemFaltas || 0;
                }
             });
             this.breakdown.set(combined);
          } else {
             this.breakdown.set(null);
          }
        },
        error: (err) => {
          this.calculando.set(false);
          console.error('Erro ao calcular valores:', err);
          this.breakdown.set(null);
        },
      });

    // Também observar mudanças nos campos profundos de Array para forçar recálculo
    this.formContrato.get('postosConfig')?.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        const criarContrato = this.formContrato.get('criarContrato')?.value;
        if (criarContrato) {
          this.formContrato.patchValue({ ...this.formContrato.value }, { emitEvent: true });
        }
      });
  }

  buildForms(): void {
    // Etapa 1: Cliente
    this.formCliente = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)]],
      cidade: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      emailGestor: [''],
      telefoneEmergencia: [''],
    });

    // Etapa 2: Contrato (opcional)
    this.formContrato = this.fb.group({
      criarContrato: [false], // Checkbox para habilitar
      descricao: ['Contrato de prestação de serviços de vigilância', []],
      numeroPostos: [1, [Validators.required, Validators.min(1)]],
      postosConfig: this.fb.array([this.createPostoConfigGroup()]),

      percentualImpostos: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentualAdicionalNoturno: [
        20,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      percentualMargemLucro: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentualMargemFaltas: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
      dataInicio: [this.formatDate(new Date()), [Validators.required]],
      mesesDuracao: [6, [Validators.required, Validators.min(1), Validators.max(60)]],
      status: [StatusContrato.ATIVO],
    });

    // Etapa 3: Funcionários (opcional)
    this.formFuncionarios = this.fb.group({
      adicionarFuncionarios: [false], // Checkbox para habilitar
      funcionarios: this.fb.array([]),
    });
    this.setupPostosConfigWatcher();
  }

  createPostoConfigGroup(): FormGroup {
    return this.fb.group({
      quantidadeAlocacoes: [2, [Validators.required, Validators.min(1)]],
      quantidadeFuncionariosPorAlocacao: [1, [Validators.required, Validators.min(1)]],
      valorDiariaCobrada: [100, [Validators.required, Validators.min(0.01)]],
      valorBeneficiosExtrasMensal: [350, [Validators.required, Validators.min(0)]]
    });
  }

  setupPostosConfigWatcher() {
    this.formContrato.get('numeroPostos')?.valueChanges.subscribe(num => {
      const currentLen = this.postosConfig.length;
      if (num > currentLen && num <= 20) {
        for (let i = currentLen; i < num; i++) {
          this.postosConfig.push(this.createPostoConfigGroup());
        }
      } else if (num < currentLen && num >= 1) {
        for (let i = currentLen - 1; i >= num; i--) {
          this.postosConfig.removeAt(i);
        }
      }
    });
  }

  // Getters para FormArrays
  get funcionarios(): FormArray {
    return this.formFuncionarios.get('funcionarios') as FormArray;
  }

  get postosConfig(): FormArray {
    return this.formContrato.get('postosConfig') as FormArray;
  }

  // Helpers para validação
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.formCliente.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && field.touched;
    }

    return field.invalid && field.touched;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.formCliente.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
    if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
    if (errors['pattern']) {
      if (fieldName === 'cnpj') return 'CNPJ inválido (ex: 12.345.678/0001-90)';
      if (fieldName === 'telefoneEmergencia') return 'Telefone inválido (digite apenas números)';
    }
    if (errors['email']) return 'Email inválido';

    return 'Campo inválido';
  }

  isEdit = signal(false); // Wizard sempre é criação, nunca edição

  formatarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito

    // Limita a 11 dígitos
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    // Formata: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    let valorFormatado = '';
    if (valor.length > 0) {
      valorFormatado = '(' + valor.substring(0, 2);
      if (valor.length > 2) {
        valorFormatado += ') ' + valor.substring(2, valor.length <= 10 ? 6 : 7);
      }
      if (valor.length > 6) {
        valorFormatado += '-' + valor.substring(valor.length <= 10 ? 6 : 7, 11);
      }
    }

    // Atualiza o valor do campo sem trigger de validação desnecessária
    this.formCliente.get('telefoneEmergencia')?.setValue(valorFormatado, { emitEvent: false });
    input.value = valorFormatado;
  }

  // Métodos auxiliares
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calcularDataFim(): string {
    const dataInicio = this.formContrato.get('dataInicio')?.value;
    const mesesDuracao = this.formContrato.get('mesesDuracao')?.value || 2;

    if (!dataInicio) return '';

    const data = new Date(dataInicio);
    data.setMonth(data.getMonth() + mesesDuracao);

    return this.formatDate(data);
  }

  calcularDuracaoMeses(): string {
    const meses = this.formContrato?.get('mesesDuracao')?.value || 0;
    if (meses === 0) return '';
    if (meses === 1) return 'Duração: 1 mês';
    if (meses < 12) return `Duração: ${meses} meses`;

    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;

    if (mesesRestantes === 0) {
      return anos === 1 ? 'Duração: 1 ano' : `Duração: ${anos} anos`;
    }

    const anoTexto = anos === 1 ? '1 ano' : `${anos} anos`;
    const mesTexto = mesesRestantes === 1 ? '1 mês' : `${mesesRestantes} meses`;
    return `Duração: ${anoTexto} e ${mesTexto}`;
  }

  // Gerenciar funcionários
  addFuncionario(): void {
    const funcionarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)]],
      celular: ['', [Validators.pattern(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/)]],
      tipoFuncionario: [TipoFuncionario.CLT, [Validators.required]],
      statusFuncionario: [StatusFuncionario.ATIVO, [Validators.required]],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, [Validators.required]],
    });

    this.funcionarios.push(funcionarioForm);
  }

  removeFuncionario(index: number): void {
    this.funcionarios.removeAt(index);
  }

  contarFuncionariosPorStatus(status: string): number {
    return this.funcionarios.controls.filter(
      (func) => func.get('statusFuncionario')?.value === status,
    ).length;
  }

  contarFuncionariosPorTipo(tipo: string): number {
    return this.funcionarios.controls.filter((func) => func.get('tipoFuncionario')?.value === tipo)
      .length;
  }

  // Navegação entre steps
  nextStep(): void {
    const step = this.currentStep();

    // Marca campos como touched para mostrar erros
    if (step === 1) {
      this.markFormGroupTouched(this.formCliente);
    } else if (step === 2) {
      const criarContrato = this.formContrato?.get('criarContrato')?.value;
      if (criarContrato) {
        this.markFormGroupTouched(this.formContrato);
      }
    }

    if (this.currentStep() < this.totalSteps && this.canGoNext()) {
      this.currentStep.update((v) => v + 1);
      this.error.set(null);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  previousStep(): void {
    if (this.canGoBack()) {
      this.currentStep.update((v) => v - 1);
      this.error.set(null);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      const currentStepNum = this.currentStep();

      // Se tentar avançar, valida o step atual primeiro
      if (step > currentStepNum) {
        // Validar STEP 1 (Cliente)
        if (currentStepNum === 1 && !this.formCliente.valid) {
          this.markFormGroupTouched(this.formCliente);
          this.error.set('Preencha todos os campos obrigatórios do cliente antes de avançar');
          return;
        }

        // Validar STEP 2 (Contrato - se habilitado)
        if (currentStepNum === 2) {
          const criarContrato = this.formContrato?.get('criarContrato')?.value;
          if (criarContrato && !this.formContrato?.valid) {
            this.markFormGroupTouched(this.formContrato);
            this.error.set('Preencha todos os campos obrigatórios do contrato antes de avançar');
            return;
          }
        }
      }

      // Sempre permite mudar de step (navegação livre)
      this.currentStep.set(step);
      this.error.set(null);
    }
  }

  // Submissão final
  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const criarContrato = this.formContrato.get('criarContrato')?.value;

      if (!criarContrato) {
        // Se não criar contrato, criar apenas cliente
        const clienteId = await this.criarCliente();
        this.router.navigate(['/clientes', clienteId]);
        return;
      }

      // Usar endpoint /api/clientes-completos para criar tudo junto
      const payload = this.montarPayloadCompleto();

      console.log(
        'Payload enviado para /api/clientes-completos:',
        JSON.stringify(payload, null, 2),
      );

      this.clienteService.createCompleto(payload).subscribe({
        next: async (response: CriarClienteCompletoOutput) => {
          console.log('Resposta recebida:', response);

          // Criar funcionários do Step 3, se houver
          const funcionariosParaCriar = this.funcionarios.controls;
          if (funcionariosParaCriar.length > 0) {
            const contratoId = response.contrato.id;
            const clienteId = response.cliente.id;

            for (const funcControl of funcionariosParaCriar) {
              const func = funcControl.value;
              try {
                await firstValueFrom(
                  this.funcionarioService.create({
                    clienteId,
                    contratoId,
                    nome: func.nome,
                    cpf: func.cpf,
                    celular: func.celular || '',
                    tipoFuncionario: func.tipoFuncionario,
                    statusFuncionario: func.statusFuncionario,
                    tipoEscala: func.tipoEscala,
                  }),
                );
              } catch (funcErr: any) {
                console.error('Erro ao criar funcionário:', func.nome, funcErr);
              }
            }
          }

          this.loading.set(false);
          this.router.navigate(['/clientes', response.cliente.id]);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage =
            err.error?.error ||
            err.error?.message ||
            err.message ||
            'Erro ao criar cliente completo';
          this.error.set(errorMessage);
          console.error('Erro detalhado:', err);
          console.error('Status:', err.status);
          console.error('Error body:', err.error);
        },
      });
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao processar dados');
      this.loading.set(false);
      console.error('Erro:', err);
    }
  }

  private montarPayloadCompleto(): any {
    const formClienteValue = this.formCliente.value;
    const formContratoValue = this.formContrato.value;

    // Limpar telefone (remover parênteses, espaços e hífens) - aceita null/vazio
    let telefone = formClienteValue.telefoneEmergencia || '';
    if (telefone) {
      telefone = telefone.replace(/[\(\)\s\-]/g, '');
    }

    // Determinar valores agregados/médios ou do primeiro posto para o payload base do backend
    const postosConfigValues = formContratoValue.postosConfig || [];
    const firstConfig = postosConfigValues[0] || {};
    const numeroPostos = formContratoValue.numeroPostos || 1;

    // Data de término calculada
    const dataFim = this.calcularDataFim();

    return {
      cliente: {
        nome: formClienteValue.nome,
        cnpj: formClienteValue.cnpj,
        cidade: formClienteValue.cidade,
        estado: formClienteValue.estado,
        emailGestor: formClienteValue.emailGestor || null,
        telefoneEmergencia: telefone || null,
      },
      contrato: {
        descricao: formContratoValue.descricao || `Contrato - ${formClienteValue.nome}`,
        valorTotalMensal: this.faturamentoMensal(),
        valorDiariaCobrada: firstConfig.valorDiariaCobrada || 0,
        percentualAdicionalNoturno: (formContratoValue.percentualAdicionalNoturno || 0) / 100,
        valorBeneficiosExtrasMensal: firstConfig.valorBeneficiosExtrasMensal || 0,
        percentualImpostos: (formContratoValue.percentualImpostos || 0) / 100,
        margemLucroPercentual: (formContratoValue.percentualMargemLucro || 0) / 100,
        margemCoberturaFaltasPercentual: (formContratoValue.percentualMargemFaltas || 0) / 100,
        dataInicio: formContratoValue.dataInicio,
        dataFim: dataFim,
        status: 'ATIVO', // Status inicial sempre ATIVO
      },
      criarPostosAutomaticamente: true,
      numeroDePostos: numeroPostos,
    };
  }

  private async criarCliente(): Promise<string> {
    return new Promise((resolve, reject) => {
      const formValue = this.formCliente.value;

      // Limpar telefone (remover parênteses, espaços e hífens)
      let telefone = formValue.telefoneEmergencia || '';
      telefone = telefone.replace(/[\(\)\s\-]/g, '');

      const payload = {
        nome: formValue.nome,
        cnpj: formValue.cnpj,
        cidade: formValue.cidade,
        estado: formValue.estado,
        emailGestor: formValue.emailGestor || null,
        telefoneEmergencia: telefone || null,
      };

      this.clienteService.create(payload).subscribe({
        next: (response) => {
          resolve(response.id);
        },
        error: (err) => reject(err),
      });
    });
  }

  cancel(): void {
    if (confirm('Deseja cancelar? Todos os dados serão perdidos.')) {
      this.router.navigate(['/clientes']);
    }
  }
}
