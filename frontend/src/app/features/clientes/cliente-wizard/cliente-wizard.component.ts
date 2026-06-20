import { FormInputComponent } from "../../../shared/components/form-input/form-input.component";
import { SvgIconComponent } from "./svg/svg-icon.component";
import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { CriarClienteCompletoOutput } from '../../../services/cliente-completo.service';
import { ClienteService } from '../../../services/cliente.service';
import {
  cnpjValidator,
  cpfValidator,
  telefoneValidator,
} from '../../../shared/validators/br-documents.validators';
import { TagPickerComponent } from '../../../shared/components/tag-picker/tag-picker.component';
import {
  StatusContrato,
  StatusFuncionario,
  TipoFuncionario,
  TipoEscala,
  
} from '../../../models/index';
import { TipoPosto, TIPO_POSTO_OPTIONS } from '../../contratos/contrato-form/contrato-form.component';
import { WizardStepClienteComponent } from './components/wizard-step-cliente/wizard-step-cliente.component';
import { WizardStepContratoComponent } from './components/wizard-step-contrato/wizard-step-contrato.component';
import { WizardStepFuncionariosComponent } from './components/wizard-step-funcionarios/wizard-step-funcionarios.component';

@Component({
  selector: 'app-cliente-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, TagPickerComponent, WizardStepClienteComponent, WizardStepContratoComponent, WizardStepFuncionariosComponent, SvgIconComponent, FormInputComponent],
  templateUrl: './cliente-wizard.component.html',
  styleUrls: ['./cliente-wizard.component.scss'],
})
export class ClienteWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
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

  @ViewChild(WizardStepContratoComponent) stepContrato?: WizardStepContratoComponent;

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

  // Enum de tipos de posto
  TipoPosto = TipoPosto;
  tipoPostoOptions = TIPO_POSTO_OPTIONS;

  canGoBack = computed(() => this.currentStep() > 1);
  isLastStep = computed(() => this.currentStep() === this.totalSteps);

  ngOnInit(): void {
    this.buildForms();
  }
  buildForms(): void {
    // Etapa 1: Cliente
    this.formCliente = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, cnpjValidator]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      quantidadeIdealPorTurno: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      horarioTrocaTurno: ['06:00', [Validators.required]],
      emailGestor: ['', [Validators.email]],
      telefoneEmergencia: ['', [telefoneValidator]],
    });

    // Etapa 2: Contrato (opcional)
    this.formContrato = this.fb.group({
      criarContrato: [false], // Checkbox para habilitar
      modoPersonalizado: [false],
      descricao: ['Contrato de prestação de serviços de vigilância', []],
      numeroPostos: [1, [Validators.required, Validators.min(1)]],
      postosConfig: this.fb.array([]),

      percentualImpostos: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentualAdicionalNoturno: [
        20,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      percentualAdicionalFimSemana: [
        100,
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
    if (errors['cnpjInvalid']) return 'CNPJ inválido (verifique o formato e os dígitos)';
    if (errors['cpfInvalid']) return 'CPF inválido (verifique o formato e os dígitos)';
    if (errors['telefoneInvalid']) return 'Telefone inválido (ex: (11) 99999-9999)';
    if (errors['email']) return 'Email inválido';

    return 'Campo inválido';
  }

  isEdit = signal(false); // Wizard sempre é criação, nunca edição




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

          // Funcionários já foram criados pelo orquestrador no backend

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

    console.log('--- DEBUG PAYLOAD ---');
    console.log('stepContrato is defined?', !!this.stepContrato);
    console.log('formContratoValue', formContratoValue);

    // Limpar telefone (remover parênteses, espaços e hífens) - aceita null/vazio
    let telefone = formClienteValue.telefoneEmergencia || '';
    if (telefone) {
      telefone = telefone.replace(/[\(\)\s\-]/g, '');
    }

    // Determinar valores agregados/médios ou do primeiro posto para o payload base do backend
    const postosConfigValues = formContratoValue.postosConfig || [];
    const firstConfig = postosConfigValues[0] || {};
    const numeroPostos = formContratoValue.numeroPostos || 1;

    const dataFim = this.stepContrato?.calcularDataFim() || '';

    return {
      cliente: {
        nome: formClienteValue.nome,
        cnpj: formClienteValue.cnpj,
        cidade: formClienteValue.cidade,
        estado: formClienteValue.estado,
        quantidadeIdealPorTurno: formClienteValue.quantidadeIdealPorTurno,
        horarioTrocaTurno: formClienteValue.horarioTrocaTurno,
        emailGestor: formClienteValue.emailGestor || null,
        telefoneEmergencia: telefone || null,
      },
      contrato: {
        descricao: formContratoValue.descricao || `Contrato - ${formClienteValue.nome}`,
        valorTotalMensal: this.stepContrato?.faturamentoMensal() || 0,
        valorDiariaCobrada: firstConfig.valorDiariaCobrada || 0,
        percentualAdicionalNoturno: (formContratoValue.percentualAdicionalNoturno || 0) / 100,
        percentualAdicionalFimSemana: (formContratoValue.percentualAdicionalFimSemana || 100) / 100,
        valorBeneficiosExtrasMensal: firstConfig.valorBeneficiosExtrasMensal || 0,
        percentualEncargosProvisoes: (formContratoValue.percentualImpostos || 0) / 100,
        margemLucroPercentual: (formContratoValue.percentualMargemLucro || 0) / 100,
        margemCoberturaFaltasPercentual: (formContratoValue.percentualMargemFaltas || 0) / 100,
        dataInicio: formContratoValue.dataInicio,
        dataFim: dataFim,
        status: 'ATIVO', // Status inicial sempre ATIVO
        tags: (this.stepContrato?.selectedTagIds() || []).map((tagId) => ({
          tagId,
          valorDiaria: this.stepContrato?.getTagRate(tagId) || 0,
        })),
      },
      criarPostosAutomaticamente: true,
      numeroDePostos: numeroPostos,
      postoConfigs: postosConfigValues.map((posto: any) => ({
        tipoPosto: posto.tipoPosto,
        quantidadeAlocacoes: posto.quantidadeAlocacoes,
        quantidadeFuncionariosPorAlocacao: posto.quantidadeFuncionariosPorAlocacao,
        alocacoesNoturnas: posto.alocacoesNoturnas,
        valorDiariaCobrada: posto.valorDiariaCobrada,
        valorBeneficiosExtrasMensal: posto.valorBeneficiosExtrasMensal,
      })),
      funcionarios: this.funcionarios.value.map((func: any) => ({
        nome: func.nome,
        cpf: func.cpf,
        celular: func.celular || '',
        tipoFuncionario: func.tipoFuncionario,
        statusFuncionario: func.statusFuncionario,
        tipoEscala: func.tipoEscala
      }))
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
        quantidadeIdealPorTurno: formValue.quantidadeIdealPorTurno,
        horarioTrocaTurno: formValue.horarioTrocaTurno,
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

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
