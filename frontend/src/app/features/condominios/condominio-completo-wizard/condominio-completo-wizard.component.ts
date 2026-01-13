import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CondominioCompletoService, CriarCondominioCompletoInput, ValidarCriacaoCondominioCompletoOutput } from '../../../services/condominio-completo.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { CalculoValorTotalInput } from '../../../models';

@Component({
  selector: 'app-condominio-completo-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './condominio-completo-wizard.component.html',
  styleUrls: ['./condominio-completo-wizard.component.scss']
})
export class CondominioCompletoWizardComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private condominioCompletoService = inject(CondominioCompletoService);
  private calculoService = inject(ContratoCalculoService);

  // Estado do wizard
  currentStep = signal(1);
  totalSteps = 4;
  isLoading = signal(false);
  errorMessage = signal('');

  // Validação e preview
  validationResult = signal<ValidarCriacaoCondominioCompletoOutput | null>(null);
  valorTotalCalculado = signal<number | null>(null);

  // Formulários por step
  condominioForm: FormGroup;
  contratoForm: FormGroup;
  postosForm: FormGroup;

  constructor() {
    this.condominioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      endereco: ['', [Validators.required]],
      quantidadeFuncionariosIdeal: [12, [Validators.required, Validators.min(1)]],
      horarioTrocaTurno: ['06:00', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
      emailGestor: ['', [Validators.email]],
      telefoneEmergencia: ['']
    });

    this.contratoForm = this.fb.group({
      contratoDescricao: ['', [Validators.required]],
      valorDiariaCobrada: [120, [Validators.required, Validators.min(1)]],
      percentualAdicionalNoturno: [0.30, [Validators.required, Validators.min(0), Validators.max(1)]],
      valorBeneficiosExtrasMensal: [3600, [Validators.required, Validators.min(0)]],
      percentualImpostos: [0.15, [Validators.required, Validators.min(0), Validators.max(1)]],
      margemLucroPercentual: [0.20, [Validators.required, Validators.min(0), Validators.max(1)]],
      margemCoberturaFaltasPercentual: [0.10, [Validators.required, Validators.min(0), Validators.max(1)]],
      dataInicio: ['', [Validators.required]],
      dataFim: ['', [Validators.required]]
    });

    this.postosForm = this.fb.group({
      criarPostosAutomaticamente: [true],
      numeroPostos: [{ value: 2, disabled: true }, [Validators.min(1), Validators.max(10)]]
    });

    // Observar mudanças no checkbox para habilitar/desabilitar campo
    this.postosForm.get('criarPostosAutomaticamente')?.valueChanges.subscribe(auto => {
      const numeroPostosControl = this.postosForm.get('numeroPostos');
      if (auto) {
        numeroPostosControl?.disable();
        numeroPostosControl?.setValue(2);
      } else {
        numeroPostosControl?.enable();
      }
    });
  }

  // Navegação entre steps
  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      if (this.validateCurrentStep()) {
        // Se for step 2 (contrato), calcular valor
        if (this.currentStep() === 2) {
          this.calcularValorContrato();
        }
        this.currentStep.set(this.currentStep() + 1);
      }
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  validateCurrentStep(): boolean {
    this.errorMessage.set('');

    switch (this.currentStep()) {
      case 1:
        if (this.condominioForm.invalid) {
          this.errorMessage.set('Por favor, preencha todos os campos obrigatórios do condomínio.');
          return false;
        }
        break;
      case 2:
        if (this.contratoForm.invalid) {
          this.errorMessage.set('Por favor, preencha todos os campos obrigatórios do contrato.');
          return false;
        }
        // Validar soma de margens
        const valores = this.contratoForm.value;
        const somaMargens = valores.percentualImpostos + valores.margemLucroPercentual + valores.margemCoberturaFaltasPercentual;
        if (somaMargens >= 1) {
          this.errorMessage.set('A soma das margens (impostos + lucro + faltas) deve ser menor que 100%.');
          return false;
        }
        break;
      case 3:
        if (this.postosForm.invalid) {
          this.errorMessage.set('Configuração de postos inválida.');
          return false;
        }
        break;
    }

    return true;
  }

  // Calcular valor total do contrato
  calcularValorContrato() {
    const condominioData = this.condominioForm.value;
    const contratoData = this.contratoForm.value;

    const input: CalculoValorTotalInput = {
      valorDiariaCobrada: contratoData.valorDiariaCobrada,
      quantidadeFuncionarios: condominioData.quantidadeFuncionariosIdeal,
      valorBeneficiosExtrasMensal: contratoData.valorBeneficiosExtrasMensal,
      percentualImpostos: contratoData.percentualImpostos,
      margemLucroPercentual: contratoData.margemLucroPercentual,
      margemCoberturaFaltasPercentual: contratoData.margemCoberturaFaltasPercentual
    };

    this.isLoading.set(true);
    this.calculoService.calcularValorTotal(input).subscribe({
      next: (result) => {
        this.valorTotalCalculado.set(result.valorTotalMensal);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao calcular valor:', err);
        this.errorMessage.set('Erro ao calcular valor do contrato.');
        this.isLoading.set(false);
      }
    });
  }

  // Validar criação (dry-run)
  validarCriacao() {
    const input = this.buildInput();
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.condominioCompletoService.validar(input).subscribe({
      next: (result) => {
        this.validationResult.set(result);
        this.isLoading.set(false);

        if (!result.valido) {
          this.errorMessage.set('Validação falhou: ' + result.erros.join(', '));
        }
      },
      error: (err) => {
        console.error('Erro na validação:', err);
        this.errorMessage.set('Erro ao validar dados: ' + (err.error?.message || 'Erro desconhecido'));
        this.isLoading.set(false);
      }
    });
  }

  // Criar condomínio completo
  criar() {
    const input = this.buildInput();
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.condominioCompletoService.criar(input).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        alert(`✅ Condomínio criado com sucesso!\n\nID: ${result.condominioId}\nContrato ID: ${result.contratoId}\nPostos criados: ${result.postoIds.length}`);
        this.router.navigate(['/condominios', result.condominioId]);
      },
      error: (err) => {
        console.error('Erro ao criar:', err);
        this.errorMessage.set('Erro ao criar condomínio: ' + (err.error?.message || 'Erro desconhecido'));
        this.isLoading.set(false);
      }
    });
  }

  private buildInput(): CriarCondominioCompletoInput {
    return {
      ...this.condominioForm.value,
      ...this.contratoForm.value,
      ...this.postosForm.value
    };
  }

  cancelar() {
    if (confirm('Deseja realmente cancelar? Todos os dados serão perdidos.')) {
      this.router.navigate(['/condominios']);
    }
  }
}

