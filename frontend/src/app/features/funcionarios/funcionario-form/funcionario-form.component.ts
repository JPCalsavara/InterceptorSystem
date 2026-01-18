import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FuncionarioService } from '../../../services/funcionario.service';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { StatusFuncionario, TipoFuncionario, TipoEscala, StatusContrato, StatusAlocacao, TipoAlocacao } from '../../../models';

@Component({
  selector: 'app-funcionario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './funcionario-form.component.html',
  styleUrl: './funcionario-form.component.scss',
})
export class FuncionarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(FuncionarioService);
  private condominioService = inject(CondominioService);
  private contratoService = inject(ContratoService);
  private postoService = inject(PostoDeTrabalhoService);
  private alocacaoService = inject(AlocacaoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  funcionarioId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  condominios = signal<any[]>([]);
  contratos = signal<any[]>([]);
  postos = signal<any[]>([]);
  contratoSelecionado = signal<any | null>(null);

  // Valores calculados do contrato (via API)
  salarioCalculado = signal<number>(0);
  beneficiosCalculados = signal<number>(0);
  valorDiariaCalculado = signal<number>(0);

  StatusFuncionario = StatusFuncionario;
  TipoFuncionario = TipoFuncionario;
  TipoEscala = TipoEscala;

  statusOptions = [
    { value: StatusFuncionario.ATIVO, label: 'Ativo' },
    { value: StatusFuncionario.FERIAS, label: 'Férias' },
    { value: StatusFuncionario.AFASTADO, label: 'Afastado' },
    { value: StatusFuncionario.DEMITIDO, label: 'Demitido' },
  ];

  tipoOptions = [
    { value: TipoFuncionario.CLT, label: 'CLT' },
    { value: TipoFuncionario.FREELANCER, label: 'Freelancer' },
    { value: TipoFuncionario.TERCEIRIZADO, label: 'Terceirizado' },
  ];

  escalaOptions = [
    {
      value: TipoEscala.DOZE_POR_TRINTA_SEIS,
      label: '12x36 (12 horas trabalhadas, 36 de descanso)',
    },
    { value: TipoEscala.SEMANAL_COMERCIAL, label: 'Semanal Comercial (44h semanais)' },
  ];

  ngOnInit(): void {
    this.loadCondominios();
    this.buildForm();
    this.setupCondominioChange();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.funcionarioId.set(id);
      this.isEdit.set(true);
      this.loadFuncionario(id);
    }
  }

  loadCondominios(): void {
    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => console.error('Erro ao carregar condomínios:', err),
    });
  }

  setupCondominioChange(): void {
    this.form.get('condominioId')?.valueChanges.subscribe((condominioId) => {
      if (condominioId) {
        this.loadContratos(condominioId);
        this.loadPostos(condominioId);
        // Limpar contratoId e postoId quando condomínio muda
        this.form.patchValue({ contratoId: '', postoDeTrabalhoId: '' }, { emitEvent: false });
        this.contratoSelecionado.set(null);
      } else {
        this.contratos.set([]);
        this.postos.set([]);
        this.contratoSelecionado.set(null);
      }
    });

    // Listener para mudanças no contratoId
    this.form.get('contratoId')?.valueChanges.subscribe((contratoId) => {
      if (contratoId) {
        this.calcularValoresDoContrato(contratoId);
      } else {
        this.contratoSelecionado.set(null);
        this.salarioCalculado.set(0);
        this.beneficiosCalculados.set(0);
        this.valorDiariaCalculado.set(0);
      }
    });
  }

  loadContratos(condominioId: string): void {
    this.contratoService.getAll().subscribe({
      next: (data) => {
        // Filtrar apenas contratos do condomínio selecionado e vigentes
        const contratosDoCondominio = data.filter(
          (c) => c.condominioId === condominioId && c.status !== StatusContrato.FINALIZADO
        );
        this.contratos.set(contratosDoCondominio);
      },
      error: (err) => console.error('Erro ao carregar contratos:', err),
    });
  }

  loadPostos(condominioId: string): void {
    this.postoService.getAll().subscribe({
      next: (data) => {
        // Filtrar apenas postos do condomínio selecionado
        const postosDoCondominio = data.filter((p) => p.condominioId === condominioId);
        this.postos.set(postosDoCondominio);
      },
      error: (err) => console.error('Erro ao carregar postos de trabalho:', err),
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      contratoId: ['', Validators.required],
      postoDeTrabalhoId: ['', Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      // CPF: aceita 000.000.000-00 ou 00000000000 (valida apenas se tem 11 dígitos)
      cpf: ['', [Validators.required, this.cpfValidator]],
      // Celular: aceita (00) 00000-0000 ou 00000000000 (valida se tem 10 ou 11 dígitos)
      celular: ['', [Validators.required, this.celularValidator]],
      statusFuncionario: [StatusFuncionario.ATIVO, Validators.required],
      tipoFuncionario: [TipoFuncionario.CLT, Validators.required],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, Validators.required],
    });

    // Adicionar listeners para formatação automática
    this.setupFormatListeners();
  }

  /**
   * Validador customizado para CPF (aceita com ou sem máscara)
   */
  private cpfValidator(control: any) {
    if (!control.value) return null;

    const cleaned = control.value.replace(/\D/g, '');

    if (cleaned.length !== 11) {
      return { cpfInvalid: true };
    }

    return null;
  }

  /**
   * Validador customizado para Celular (aceita com ou sem máscara)
   */
  private celularValidator(control: any) {
    if (!control.value) return null;

    const cleaned = control.value.replace(/\D/g, '');

    if (cleaned.length < 10 || cleaned.length > 11) {
      return { celularInvalid: true };
    }

    return null;
  }

  /**
   * Configura listeners para formatar CPF e celular automaticamente
   */
  private setupFormatListeners(): void {
    // Formatação de CPF (XXX.XXX.XXX-XX)
    this.form.get('cpf')?.valueChanges.subscribe((value) => {
      if (value) {
        const cleaned = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        const formatted = this.formatCPF(cleaned);

        if (formatted !== value) {
          this.form.get('cpf')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    // Formatação de Celular ((XX) XXXXX-XXXX)
    this.form.get('celular')?.valueChanges.subscribe((value) => {
      if (value) {
        const cleaned = value.replace(/\D/g, '');
        const formatted = this.formatCelular(cleaned);

        if (formatted !== value) {
          this.form.get('celular')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
  }

  /**
   * Formata CPF: 12345678901 → 123.456.789-01
   */
  private formatCPF(value: string): string {
    if (!value) return '';

    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    // Aplica máscara progressivamente
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  }

  /**
   * Formata Celular: 11987654321 → (11) 98765-4321
   */
  private formatCelular(value: string): string {
    if (!value) return '';

    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    // Aplica máscara progressivamente
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      // Celular com 9 dígitos: (XX) XXXXX-XXXX
      if (numbers.length === 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
      // Celular com 8 dígitos: (XX) XXXX-XXXX
      else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
      }
    }

    return numbers;
  }

  loadFuncionario(id: string): void {
    this.loading.set(true);

    this.service.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          condominioId: data.condominioId,
          contratoId: data.contratoId,  // FASE 2
          nome: data.nome,
          cpf: data.cpf,
          celular: data.celular,
          statusFuncionario: data.statusFuncionario,
          tipoFuncionario: data.tipoFuncionario,
          tipoEscala: data.tipoEscala,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar funcionário. Redirecionando...');
        console.error('Erro:', err);
        setTimeout(() => this.router.navigate(['/funcionarios']), 2000);
      },
    });
  }

  calcularValoresDoContrato(contratoId: string): void {
    const contrato = this.contratos().find(c => c.id === contratoId);

    if (!contrato) {
      return;
    }

    this.contratoSelecionado.set(contrato);

    // Usar API de cálculos (mesma do wizard) para obter valores precisos
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

        // Custo base mensal (diária * 30 dias)
        const custoBaseMensal = contrato.valorDiariaCobrada * 30;

        // Benefícios por funcionário
        const beneficiosPorFuncionario = contrato.valorBeneficiosExtrasMensal / quantidadeFuncionarios;

        // Salário = (custoBaseMensal * 30 + beneficios)
        let salarioBase = custoBaseMensal + beneficiosPorFuncionario;

        // Se for escala noturna (12x36), aplica adicional noturno
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
        // Fallback para cálculo simples se API falhar
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

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Limpar formatação de CPF e celular antes de enviar
    const formValue = {
      ...this.form.value,
      cpf: this.form.value.cpf.replace(/\D/g, ''), // Remove pontos, traços e parênteses
      celular: this.form.value.celular.replace(/\D/g, ''),
    };

    // Criar funcionário primeiro
    const requestFuncionario = this.isEdit()
      ? this.service.update(this.funcionarioId()!, formValue)
      : this.service.create(formValue);

    requestFuncionario.subscribe({
      next: (funcionarioCriado) => {
        // Se for criação (não edição), criar alocações automáticas
        if (!this.isEdit()) {
          this.criarAlocacoesAutomaticas(funcionarioCriado.id);
        } else {
          this.router.navigate(['/funcionarios']);
        }
      },
      error: (err) => {
        this.error.set(
          this.isEdit()
            ? 'Erro ao atualizar funcionário. Tente novamente.'
            : 'Erro ao criar funcionário. Tente novamente.'
        );
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  /**
   * Cria alocações automaticamente para o funcionário desde hoje até o fim do contrato
   * baseado na escala de trabalho (12x36 ou Semanal)
   */
  private criarAlocacoesAutomaticas(funcionarioId: string): void {
    const contrato = this.contratoSelecionado();
    const tipoEscala = this.form.get('tipoEscala')?.value;
    const postoId = this.form.get('postoDeTrabalhoId')?.value;

    if (!contrato || !postoId) {
      console.warn('Sem contrato ou posto selecionado - pulando alocações automáticas');
      this.router.navigate(['/funcionarios']);
      return;
    }

    const alocacoes: any[] = [];
    const dataInicio = new Date(); // Começa hoje
    const dataFim = new Date(contrato.dataFim);

    if (tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) {
      // Escala 12x36: trabalha 1 dia, folga 1 dia
      let dataAtual = new Date(dataInicio);
      let trabalha = true; // Começa trabalhando

      while (dataAtual <= dataFim) {
        if (trabalha) {
          alocacoes.push({
            funcionarioId,
            postoDeTrabalhoId: postoId,
            data: this.formatDate(dataAtual),
            statusAlocacao: StatusAlocacao.CONFIRMADA,
            tipoAlocacao: TipoAlocacao.REGULAR,
          });
        }
        // Alterna: trabalha → folga → trabalha
        trabalha = !trabalha;
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    } else if (tipoEscala === TipoEscala.SEMANAL_COMERCIAL) {
      // Escala Semanal: segunda a sexta (5 dias), descansa sábado e domingo
      let dataAtual = new Date(dataInicio);

      while (dataAtual <= dataFim) {
        const diaSemana = dataAtual.getDay(); // 0 = domingo, 6 = sábado

        // Trabalha de segunda (1) a sexta (5)
        if (diaSemana >= 1 && diaSemana <= 5) {
          alocacoes.push({
            funcionarioId,
            postoDeTrabalhoId: postoId,
            data: this.formatDate(dataAtual),
            statusAlocacao: StatusAlocacao.CONFIRMADA,
            tipoAlocacao: TipoAlocacao.REGULAR,
          });
        }

        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    }

    console.log(`📅 Criando ${alocacoes.length} alocações automáticas para ${tipoEscala}...`);

    // Criar todas as alocações em LOTE (batch) - muito mais eficiente!
    if (alocacoes.length > 0) {
      this.alocacaoService.createBatch(alocacoes).subscribe({
        next: (result) => {
          console.log(`✅ ${result.length} alocações criadas com sucesso!`);
          this.loading.set(false);
          this.router.navigate(['/funcionarios']);
        },
        error: (err) => {
          console.error('❌ Erro ao criar alocações automáticas:', err);
          this.error.set('Funcionário criado, mas houve erro ao gerar alocações. Complete manualmente.');
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/funcionarios']), 3000);
        },
      });
    } else {
      this.loading.set(false);
      this.router.navigate(['/funcionarios']);
    }
  }

  /**
   * Formata data para o padrão YYYY-MM-DD (ISO 8601)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancel(): void {
    this.router.navigate(['/funcionarios']);
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.touched || this.submitted()) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.submitted())) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      if (fieldName === 'postoDeTrabalhoId') return 'Selecione um posto de trabalho';
      return 'Este campo é obrigatório';
    }
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
    if (errors['cpfInvalid']) return 'CPF deve conter 11 dígitos';
    if (errors['celularInvalid']) return 'Celular deve conter 10 ou 11 dígitos';
    if (errors['pattern']) {
      if (fieldName === 'cpf') return 'CPF deve conter 11 dígitos';
      if (fieldName === 'celular') return 'Celular deve conter 10 ou 11 dígitos';
    }

    return 'Campo inválido';
  }
}
