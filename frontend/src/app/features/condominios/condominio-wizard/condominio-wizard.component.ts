import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { StatusContrato, StatusFuncionario, TipoFuncionario, TipoEscala } from '../../../models/index';

interface PostoDeTrabalhoForm {
  horarioInicio: string;
  horarioFim: string;
  quantidadeFuncionarios: number;
  permiteDobrarEscala: boolean;
}

@Component({
  selector: 'app-condominio-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './condominio-wizard.component.html',
  styleUrls: ['./condominio-wizard.component.scss'],
})
export class CondominioWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private condominioService = inject(CondominioService);
  private contratoService = inject(ContratoService);
  private calculoService = inject(ContratoCalculoService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private router = inject(Router);

  // Controle do wizard
  currentStep = signal(1);
  totalSteps = 3;
  loading = signal(false);
  error = signal<string | null>(null);

  // IDs gerados após criação
  condominioId = signal<string | null>(null);
  contratoId = signal<string | null>(null);

  // Formulários de cada etapa
  formCondominio!: FormGroup;
  formContrato!: FormGroup;
  formFuncionarios!: FormGroup;

  // Labels dos steps
  steps = [
    { number: 1, label: 'Condomínio', icon: '🏢' },
    { number: 2, label: 'Contrato', icon: '📄' },
    { number: 3, label: 'Funcionários', icon: '👥' },
  ];

  // Computed para controle de navegação
  canGoNext = computed(() => {
    const step = this.currentStep();
    if (step === 1) return this.formCondominio?.valid;
    if (step === 2) {
      // Se optou por criar contrato, valida o formulário inteiro
      const criarContrato = this.formContrato?.get('criarContrato')?.value;
      if (criarContrato) {
        // Marca todos os campos como touched para mostrar erros
        const valorDiaria = this.formContrato?.get('valorDiariaCobrada');
        const dataInicio = this.formContrato?.get('dataInicio');
        const mesesDuracao = this.formContrato?.get('mesesDuracao');

        // Verifica se os campos obrigatórios estão válidos
        return valorDiaria?.valid && dataInicio?.valid && mesesDuracao?.valid;
      }
      return true; // Se não criar contrato, pode avançar
    }
    if (step === 3) return true; // Funcionários são opcionais
    return false;
  });

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

  totalFuncionariosPorPostos = computed(() => {
    return this.funcionarios?.length || 0;
  });

  quantidadeTotalFuncionarios = computed(() => {
    const numeroPostos = this.formCondominio?.get('numeroPostos')?.value || 0;
    const funcionariosPorPosto = this.formCondominio?.get('funcionariosPorPosto')?.value || 0;
    return numeroPostos * funcionariosPorPosto;
  });

  ngOnInit(): void {
    this.buildForms();
    this.setupAutoCalculo();
  }

  setupAutoCalculo(): void {
    // Observar mudanças no formContrato e formCondominio para recalcular via API
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

          // Validar campos necessários
          if (!valores.valorDiariaCobrada || !this.quantidadeTotalFuncionarios()) {
            this.breakdown.set(null);
            return of(null);
          }

          // Chamar backend com mesma estrutura do contrato-form
          this.calculando.set(true);

          const input = {
            valorDiariaCobrada: valores.valorDiariaCobrada,
            quantidadeFuncionarios: this.formCondominio.get('funcionariosPorPosto')?.value || 0,
            numeroDePostos: this.formCondominio.get('numeroPostos')?.value || 2,
            valorBeneficiosExtrasMensal: valores.valorBeneficiosExtrasMensal || 0,
            percentualImpostos: (valores.percentualImpostos || 0) / 100, // UI: 15, Backend: 0.15
            percentualAdicionalNoturno: (valores.percentualAdicionalNoturno || 0) / 100,
            margemLucroPercentual: (valores.percentualMargemLucro || 0) / 100,
            margemCoberturaFaltasPercentual: (valores.percentualMargemFaltas || 0) / 100,
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
          console.error('Erro ao calcular valores:', err);
          this.breakdown.set(null);
        },
      });

    // Também observar mudanças no formCondominio (numeroPostos, funcionariosPorPosto)
    this.formCondominio.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        // Forçar recálculo disparando valueChanges no formContrato
        const criarContrato = this.formContrato.get('criarContrato')?.value;
        if (criarContrato) {
          this.formContrato.patchValue(this.formContrato.value, { emitEvent: true });
        }
      });
  }

  buildForms(): void {
    // Etapa 1: Condomínio
    this.formCondominio = this.fb.group({
      // Dados do condomínio
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)]],
      endereco: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      numeroPostos: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      funcionariosPorPosto: [2, [Validators.required, Validators.min(1), Validators.max(5)]],
      horarioTrocaTurno: ['06:00', [Validators.required]],
      emailGestor: [''], // Email opcional - sem validação obrigatória
      telefoneEmergencia: [''], // Telefone opcional - sem validação obrigatória
    });

    // Etapa 2: Contrato (opcional)
    this.formContrato = this.fb.group({
      criarContrato: [false], // Checkbox para habilitar
      descricao: ['Contrato de prestação de serviços de vigilância', []],
      valorDiariaCobrada: [100, [Validators.required, Validators.min(0.01)]],
      valorBeneficiosExtrasMensal: [350, [Validators.required, Validators.min(0)]],
      percentualImpostos: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentualAdicionalNoturno: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
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
  }

  // Getters para FormArrays
  get funcionarios(): FormArray {
    return this.formFuncionarios.get('funcionarios') as FormArray;
  }

  // Helpers para validação
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.formCondominio.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && field.touched;
    }

    return field.invalid && field.touched;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.formCondominio.get(fieldName);
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

  calcularQuantidadeFuncionarios(): void {
    // Force o recálculo do computed signal
    const numeroPostos = this.formCondominio.get('numeroPostos')?.value || 0;
    const funcionariosPorPosto = this.formCondominio.get('funcionariosPorPosto')?.value || 0;
    // O computed signal será automaticamente atualizado
  }

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
    this.formCondominio.get('telefoneEmergencia')?.setValue(valorFormatado, { emitEvent: false });
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
      (func) => func.get('statusFuncionario')?.value === status
    ).length;
  }

  contarFuncionariosPorTipo(tipo: string): number {
    return this.funcionarios.controls.filter(
      (func) => func.get('tipoFuncionario')?.value === tipo
    ).length;
  }

  // Navegação entre steps
  nextStep(): void {
    const step = this.currentStep();

    // Marca campos como touched para mostrar erros
    if (step === 1) {
      this.markFormGroupTouched(this.formCondominio);
    } else if (step === 2) {
      const criarContrato = this.formContrato?.get('criarContrato')?.value;
      if (criarContrato) {
        this.markFormGroupTouched(this.formContrato);
      }
    }

    if (this.currentStep() < this.totalSteps && this.canGoNext()) {
      this.currentStep.update(v => v + 1);
      this.error.set(null);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  previousStep(): void {
    if (this.canGoBack()) {
      this.currentStep.update(v => v - 1);
      this.error.set(null);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      const currentStepNum = this.currentStep();

      // Se tentar avançar, valida o step atual primeiro
      if (step > currentStepNum) {
        // Validar STEP 1 (Condomínio)
        if (currentStepNum === 1 && !this.formCondominio.valid) {
          this.markFormGroupTouched(this.formCondominio);
          this.error.set('⚠️ Preencha todos os campos obrigatórios do condomínio antes de avançar');
          return;
        }

        // Validar STEP 2 (Contrato - se habilitado)
        if (currentStepNum === 2) {
          const criarContrato = this.formContrato?.get('criarContrato')?.value;
          if (criarContrato && !this.isContratoFormValid()) {
            this.markFormGroupTouched(this.formContrato);
            this.error.set('⚠️ Preencha todos os campos obrigatórios do contrato antes de avançar');
            return;
          }
        }
      }

      // Sempre permite mudar de step (navegação livre)
      this.currentStep.set(step);
      this.error.set(null);
    }
  }

  private isContratoFormValid(): boolean {
    const valorDiaria = this.formContrato?.get('valorDiariaCobrada');
    const dataInicio = this.formContrato?.get('dataInicio');
    const mesesDuracao = this.formContrato?.get('mesesDuracao');
    return (valorDiaria?.valid && dataInicio?.valid && mesesDuracao?.valid) || false;
  }

  // Submissão final
  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const criarContrato = this.formContrato.get('criarContrato')?.value;

      if (!criarContrato) {
        // Se não criar contrato, criar apenas condomínio manualmente
        const condominioId = await this.criarCondominio();
        this.router.navigate(['/condominios', condominioId]);
        return;
      }

      // Usar endpoint /api/condominios-completos para criar tudo junto
      const payload = this.montarPayloadCompleto();

      console.log('📤 Payload enviado para /api/condominios-completos:', JSON.stringify(payload, null, 2));

      this.condominioService.createCompleto(payload).subscribe({
        next: (response) => {
          this.loading.set(false);
          console.log('✅ Resposta recebida:', response);
          // Redirecionar para o condomínio criado
          this.router.navigate(['/condominios', response.condominio.id]);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage = err.error?.error || err.error?.message || err.message || 'Erro ao criar condomínio completo';
          this.error.set(errorMessage);
          console.error('❌ Erro detalhado:', err);
          console.error('❌ Status:', err.status);
          console.error('❌ Error body:', err.error);
        },
      });
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao processar dados');
      this.loading.set(false);
      console.error('Erro:', err);
    }
  }

  private montarPayloadCompleto(): any {
    const formCondominioValue = this.formCondominio.value;
    const formContratoValue = this.formContrato.value;

    // Converter horário para formato backend (HH:mm -> HH:mm:ss)
    const horario = formCondominioValue.horarioTrocaTurno;
    const horarioCompleto = horario && horario.includes(':00', 5) ? horario : (horario || '06:00') + ':00';

    // Limpar telefone (remover parênteses, espaços e hífens) - aceita null/vazio
    let telefone = formCondominioValue.telefoneEmergencia || '';
    if (telefone) {
      telefone = telefone.replace(/[\(\)\s\-]/g, '');
    }

    // Calcular quantidade total de funcionários
    const numeroPostos = formCondominioValue.numeroPostos || 2;
    const funcionariosPorPosto = formCondominioValue.funcionariosPorPosto || 2;
    const quantidadeTotalFuncionarios = numeroPostos * funcionariosPorPosto;

    // Data de término calculada
    const dataFim = this.calcularDataFim();

    return {
      condominio: {
        nome: formCondominioValue.nome,
        cnpj: formCondominioValue.cnpj,
        endereco: formCondominioValue.endereco,
        quantidadeFuncionariosIdeal: quantidadeTotalFuncionarios,
        horarioTrocaTurno: horarioCompleto,
        emailGestor: formCondominioValue.emailGestor || null,
        telefoneEmergencia: telefone || null,
      },
      contrato: {
        descricao: formContratoValue.descricao || `Contrato - ${formCondominioValue.nome}`,
        valorTotalMensal: this.faturamentoMensal(),
        valorDiariaCobrada: formContratoValue.valorDiariaCobrada,
        percentualAdicionalNoturno: (formContratoValue.percentualAdicionalNoturno || 0) / 100,
        valorBeneficiosExtrasMensal: formContratoValue.valorBeneficiosExtrasMensal || 0,
        percentualImpostos: (formContratoValue.percentualImpostos || 0) / 100,
        quantidadeFuncionarios: quantidadeTotalFuncionarios,
        numeroDePostos: numeroPostos,
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

  private async criarCondominio(): Promise<string> {
    return new Promise((resolve, reject) => {
      const formValue = this.formCondominio.value;

      // Converter horário para formato backend (HH:mm -> HH:mm:ss)
      const horario = formValue.horarioTrocaTurno;
      const horarioCompleto = horario.includes(':00', 5) ? horario : horario + ':00';

      // Limpar telefone (remover parênteses, espaços e hífens)
      let telefone = formValue.telefoneEmergencia || '';
      telefone = telefone.replace(/[\(\)\s\-]/g, '');

      // Calcular quantidade total de funcionários
      const numeroPostos = formValue.numeroPostos || 2;
      const funcionariosPorPosto = formValue.funcionariosPorPosto || 2;
      const quantidadeTotalFuncionarios = numeroPostos * funcionariosPorPosto;

      const payload = {
        nome: formValue.nome,
        cnpj: formValue.cnpj,
        endereco: formValue.endereco,
        quantidadeFuncionariosIdeal: quantidadeTotalFuncionarios,
        horarioTrocaTurno: horarioCompleto,
        emailGestor: formValue.emailGestor || null,
        telefoneEmergencia: telefone || null,
      };

      this.condominioService.create(payload).subscribe({
        next: (response) => {
          this.condominioId.set(response.id);
          resolve(response.id);
        },
        error: (err) => reject(err),
      });
    });
  }

  private async criarPostos(condominioId: string): Promise<void> {
    const postos = this.formCondominio.get('postos')?.value || [];

    const promises = postos.map((posto: PostoDeTrabalhoForm) => {
      return new Promise((resolve, reject) => {
        const payload = {
          condominioId,
          horarioInicio: posto.horarioInicio.includes(':00', 5)
            ? posto.horarioInicio
            : posto.horarioInicio + ':00',
          horarioFim: posto.horarioFim.includes(':00', 5)
            ? posto.horarioFim
            : posto.horarioFim + ':00',
          permiteDobrarEscala: posto.permiteDobrarEscala,
          capacidadeMaximaExtraPorTerceiros: posto.quantidadeFuncionarios,
        };

        this.postoService.create(payload).subscribe({
          next: () => resolve(true),
          error: (err) => reject(err),
        });
      });
    });

    await Promise.all(promises);
  }

  private async criarContrato(condominioId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const formValue = this.formContrato.value;
      const dataFim = this.calcularDataFim();

      const payload = {
        condominioId,
        descricao: `Contrato - ${this.formCondominio.get('nome')?.value}`,
        valorTotalMensal: this.faturamentoMensal(),
        valorDiariaCobrada: formValue.valorDiariaCobrada,
        percentualAdicionalNoturno: formValue.percentualAdicionalNoturno,
        valorBeneficiosExtrasMensal: 0,
        percentualImpostos: formValue.percentualImpostos,
        quantidadeFuncionarios: this.formFuncionarios?.get('funcionarios')?.value?.length || 0,
        margemLucroPercentual: formValue.percentualMargemLucro,
        margemCoberturaFaltasPercentual: formValue.percentualMargemFaltas,
        dataInicio: formValue.dataInicio,
        dataFim: dataFim,
        status: formValue.status,
      };

      this.contratoService.create(payload).subscribe({
        next: (response) => {
          this.contratoId.set(response.id);
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  private async criarFuncionarios(condominioId: string): Promise<void> {
    const funcionarios = this.formFuncionarios.get('funcionarios')?.value || [];
    const contratoId = this.contratoId();

    if (!contratoId) {
      console.warn('Sem contrato criado, funcionários não serão criados');
      return;
    }

    const promises = funcionarios.map((func: any) => {
      return new Promise((resolve, reject) => {
        const payload = {
          condominioId,
          contratoId,
          nome: func.nome,
          cpf: func.cpf,
          celular: func.celular || null,
          tipoFuncionario: func.tipoFuncionario,
          statusFuncionario: func.statusFuncionario,
          tipoEscala: func.tipoEscala,
        };

        this.funcionarioService.create(payload).subscribe({
          next: () => resolve(true),
          error: (err) => reject(err),
        });
      });
    });

    await Promise.all(promises);
  }

  cancel(): void {
    if (confirm('Deseja cancelar? Todos os dados serão perdidos.')) {
      this.router.navigate(['/condominios']);
    }
  }
}

