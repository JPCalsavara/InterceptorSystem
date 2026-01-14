import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
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
  styleUrl: './condominio-wizard.component.scss',
})
export class CondominioWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private condominioService = inject(CondominioService);
  private contratoService = inject(ContratoService);
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
    if (step === 2) return true; // Contrato é opcional
    if (step === 3) return true; // Funcionários são opcionais
    return false;
  });

  canGoBack = computed(() => this.currentStep() > 1);
  isLastStep = computed(() => this.currentStep() === this.totalSteps);

  // Computed para cálculos automáticos
  totalPostos = computed(() => {
    return this.postos?.length || 0;
  });

  totalFuncionariosPorPostos = computed(() => {
    const postos = this.postos?.value || [];
    return postos.reduce((sum: number, posto: any) => sum + (posto.quantidadeFuncionarios || 0), 0);
  });

  // Cálculos do contrato
  custoOperacional = computed(() => {
    const valorDiaria = this.formContrato?.get('valorDiariaCobrada')?.value || 0;
    const qtdFuncionarios = this.totalFuncionariosPorPostos();
    const adicionalNoturno = this.formContrato?.get('percentualAdicionalNoturno')?.value || 0;
    const impostos = this.formContrato?.get('percentualImpostos')?.value || 0;

    // Custo diário base
    const custoDiarioBase = valorDiaria * qtdFuncionarios;

    // Adicional noturno
    const custoComNoturno = custoDiarioBase * (1 + adicionalNoturno / 100);

    // Impostos
    const custoComImpostos = custoComNoturno * (1 + impostos / 100);

    // Mensal (30 dias)
    return custoComImpostos * 30;
  });

  margemLucro = computed(() => {
    const margemPercentual = this.formContrato?.get('percentualMargemLucro')?.value || 0;
    return this.custoOperacional() * (margemPercentual / 100);
  });

  margemFaltas = computed(() => {
    const margemPercentual = this.formContrato?.get('percentualMargemFaltas')?.value || 0;
    return this.custoOperacional() * (margemPercentual / 100);
  });

  faturamentoMensal = computed(() => {
    return this.custoOperacional() + this.margemLucro() + this.margemFaltas();
  });

  ngOnInit(): void {
    this.buildForms();
  }

  buildForms(): void {
    // Etapa 1: Condomínio + Postos de Trabalho
    this.formCondominio = this.fb.group({
      // Dados do condomínio
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)]],
      endereco: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      horarioTrocaTurno: ['06:00', [Validators.required]],
      emailGestor: ['', [Validators.email]],
      telefoneEmergencia: ['', [Validators.pattern(/^\d{10,11}$/)]],

      // Configurações de postos
      numeroPostos: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      funcionariosPorPosto: [2, [Validators.required, Validators.min(1), Validators.max(5)]],

      // Postos de Trabalho
      postos: this.fb.array([]),
    });

    // Adicionar pelo menos 1 posto
    this.addPosto();

    // Etapa 2: Contrato (opcional)
    this.formContrato = this.fb.group({
      criarContrato: [false], // Checkbox para habilitar
      valorDiariaCobrada: [100, [Validators.min(0)]],
      percentualImpostos: [40, [Validators.min(0), Validators.max(100)]],
      percentualAdicionalNoturno: [50, [Validators.min(0), Validators.max(100)]],
      percentualMargemLucro: [20, [Validators.min(0), Validators.max(100)]],
      percentualMargemFaltas: [5, [Validators.min(0), Validators.max(100)]],
      dataInicio: [this.formatDate(new Date()), []],
      mesesDuracao: [2, [Validators.min(1), Validators.max(60)]],
      status: [StatusContrato.ATIVO],
    });

    // Escutar mudanças nos campos de postos para recalcular
    this.formCondominio.get('numeroPostos')?.valueChanges.subscribe(() => {
      this.atualizarPostos();
    });

    this.formCondominio.get('funcionariosPorPosto')?.valueChanges.subscribe(() => {
      this.atualizarPostos();
    });

    // Etapa 3: Funcionários (opcional)
    this.formFuncionarios = this.fb.group({
      adicionarFuncionarios: [false], // Checkbox para habilitar
      funcionarios: this.fb.array([]),
    });
  }

  // Getters para FormArrays
  get postos(): FormArray {
    return this.formCondominio.get('postos') as FormArray;
  }

  get funcionarios(): FormArray {
    return this.formFuncionarios.get('funcionarios') as FormArray;
  }

  // Gerenciar postos
  atualizarPostos(): void {
    const numeroPostos = this.formCondominio.get('numeroPostos')?.value || 1;
    const funcionariosPorPosto = this.formCondominio.get('funcionariosPorPosto')?.value || 2;
    const horarioTroca = this.formCondominio.get('horarioTrocaTurno')?.value || '06:00';

    // Limpar array atual
    this.postos.clear();

    // Criar postos baseado no número configurado
    // Regra: Turnos de 12h começando no horário de troca
    for (let i = 0; i < numeroPostos; i++) {
      const horaInicio = this.calcularHorarioInicioPosto(horarioTroca, i, numeroPostos);
      const horaFim = this.calcularHorarioFim(horaInicio);

      const postoForm = this.fb.group({
        horarioInicio: [horaInicio, [Validators.required]],
        horarioFim: [horaFim, [Validators.required]],
        quantidadeFuncionarios: [funcionariosPorPosto, [Validators.required, Validators.min(1)]],
        permiteDobrarEscala: [true],
      });
      this.postos.push(postoForm);
    }
  }

  calcularHorarioInicioPosto(horarioTroca: string, indicePosto: number, totalPostos: number): string {
    const [horas, minutos] = horarioTroca.split(':').map(Number);

    // Se for 1 ou 2 postos, usa turnos de 12h
    if (totalPostos <= 2) {
      const horaInicio = indicePosto === 0 ? horas : (horas + 12) % 24;
      return `${horaInicio.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    }

    // Para 3+ postos, divide 24h pelo número de postos
    const intervalo = Math.floor(24 / totalPostos);
    const horaInicio = (horas + (intervalo * indicePosto)) % 24;
    return `${horaInicio.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  calcularHorarioFim(horarioInicio: string): string {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    // Sempre adiciona 12 horas (regra de negócio: turnos de 12h)
    const horaFim = (horas + 12) % 24;
    return `${horaFim.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  addPosto(): void {
    const horarioTroca = this.formCondominio.get('horarioTrocaTurno')?.value || '06:00';
    const funcionariosPorPosto = this.formCondominio.get('funcionariosPorPosto')?.value || 2;
    const indicePosto = this.postos.length;
    const totalPostos = this.postos.length + 1;

    const horaInicio = this.calcularHorarioInicioPosto(horarioTroca, indicePosto, totalPostos);
    const horaFim = this.calcularHorarioFim(horaInicio);

    const postoForm = this.fb.group({
      horarioInicio: [horaInicio, [Validators.required]],
      horarioFim: [horaFim, [Validators.required]],
      quantidadeFuncionarios: [funcionariosPorPosto, [Validators.required, Validators.min(1)]],
      permiteDobrarEscala: [true],
    });

    this.postos.push(postoForm);

    // Atualizar contador
    this.formCondominio.get('numeroPostos')?.setValue(this.postos.length, { emitEvent: false });
  }

  removePosto(index: number): void {
    if (this.postos.length > 1) {
      this.postos.removeAt(index);
      this.formCondominio.get('numeroPostos')?.setValue(this.postos.length, { emitEvent: false });
    }
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

  // Navegação entre steps
  nextStep(): void {
    if (this.currentStep() < this.totalSteps && this.canGoNext()) {
      this.currentStep.update(v => v + 1);
      this.error.set(null);
    }
  }

  previousStep(): void {
    if (this.canGoBack()) {
      this.currentStep.update(v => v - 1);
      this.error.set(null);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      // Só permite ir para frente se os steps anteriores estiverem válidos
      if (step > this.currentStep()) {
        if (step === 2 && !this.formCondominio.valid) return;
        if (step === 3 && !this.formCondominio.valid) return;
      }
      this.currentStep.set(step);
      this.error.set(null);
    }
  }

  // Submissão final
  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Etapa 1: Criar Condomínio
      const condominioId = await this.criarCondominio();
      if (!condominioId) {
        throw new Error('Erro ao criar condomínio');
      }

      // Etapa 1.1: Criar Postos de Trabalho
      await this.criarPostos(condominioId);

      // Etapa 2: Criar Contrato (se habilitado)
      if (this.formContrato.get('criarContrato')?.value) {
        await this.criarContrato(condominioId);
      }

      // Etapa 3: Criar Funcionários (se habilitado)
      if (this.formFuncionarios.get('adicionarFuncionarios')?.value) {
        await this.criarFuncionarios(condominioId);
      }

      // Sucesso - redirecionar
      this.router.navigate(['/condominios', condominioId]);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao criar condomínio completo');
      this.loading.set(false);
      console.error('Erro:', err);
    }
  }

  private async criarCondominio(): Promise<string> {
    return new Promise((resolve, reject) => {
      const formValue = this.formCondominio.value;

      // Converter horário para formato backend
      const horario = formValue.horarioTrocaTurno;
      const horarioCompleto = horario.includes(':00', 5) ? horario : horario + ':00';

      // Limpar telefone (remover parênteses, espaços e hífens)
      let telefone = formValue.telefoneEmergencia || '';
      telefone = telefone.replace(/[\(\)\s\-]/g, '');

      const payload = {
        nome: formValue.nome,
        cnpj: formValue.cnpj,
        endereco: formValue.endereco,
        quantidadeFuncionariosIdeal: this.totalFuncionariosPorPostos(),
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
        quantidadeFuncionarios: this.totalFuncionariosPorPostos(),
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

