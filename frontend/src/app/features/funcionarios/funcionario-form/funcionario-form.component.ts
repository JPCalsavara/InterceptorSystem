import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FuncionarioService } from '../../../services/funcionario.service';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
import { StatusFuncionario, TipoFuncionario, TipoEscala, StatusContrato } from '../../../models';

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
  contratoSelecionado = signal<any | null>(null);

  // Valores calculados do contrato
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
        // Limpar contratoId quando condomínio muda
        this.form.patchValue({ contratoId: '' }, { emitEvent: false });
        this.contratoSelecionado.set(null);
      } else {
        this.contratos.set([]);
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

  buildForm(): void {
    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      contratoId: ['', Validators.required],  // FASE 2 backend - obrigatório
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      celular: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      statusFuncionario: [StatusFuncionario.ATIVO, Validators.required],
      tipoFuncionario: [TipoFuncionario.CLT, Validators.required],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, Validators.required],
      // Campos de salário removidos - agora são calculados pelo backend (FASE 3)
    });
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

    // Calcular valores conforme FASE 3
    const quantidadeFuncionarios = contrato.quantidadeFuncionarios || 1;

    // Salário Base = Valor Total Mensal / Quantidade de Funcionários
    const salarioBase = contrato.valorTotalMensal / quantidadeFuncionarios;

    // Adicional Noturno (para escala 12x36)
    const tipoEscala = this.form.get('tipoEscala')?.value;
    const adicionalNoturno = tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS
      ? salarioBase * (contrato.percentualAdicionalNoturno / 100)
      : 0;

    // Benefícios
    const beneficios = (contrato.valorBeneficiosExtrasMensal || 0) / quantidadeFuncionarios;

    // Salário Total
    const salarioTotal = salarioBase + adicionalNoturno + beneficios;

    // Valor Diária (base de 30 dias)
    const valorDiaria = contrato.valorDiariaCobrada || (salarioBase / 30);

    this.salarioCalculado.set(salarioTotal);
    this.beneficiosCalculados.set(beneficios);
    this.valorDiariaCalculado.set(valorDiaria);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const request = this.isEdit()
      ? this.service.update(this.funcionarioId()!, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.router.navigate(['/funcionarios']);
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

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
    if (errors['pattern']) {
      if (fieldName === 'cpf') return 'CPF deve conter 11 dígitos';
      if (fieldName === 'celular') return 'Celular deve conter 10 ou 11 dígitos';
    }

    return 'Campo inválido';
  }
}
