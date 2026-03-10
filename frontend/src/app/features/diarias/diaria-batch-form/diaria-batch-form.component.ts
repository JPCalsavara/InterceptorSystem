import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Funcionario,
  Posto,
  Alocacao,
  Cliente,
  Contrato,
  StatusDiaria,
  TipoDiaria,
  TipoEscala,
  StatusContrato,
  CreateDiariaDto,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';

@Component({
  selector: 'app-diaria-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './diaria-batch-form.component.html',
  styleUrl: './diaria-batch-form.component.scss', // Corrigido de styleUrls para styleUrl
})
export class DiariaBatchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private diariaService = inject(DiariaService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private clienteService = inject(ClienteService);
  private contratoService = inject(ContratoService);
  private alocacaoService = inject(AlocacaoService);
  private router = inject(Router);

  form!: FormGroup;
  clientes = signal<Cliente[]>([]);
  contratos = signal<Contrato[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  postos = signal<Posto[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  summary = computed(() => {
    const contrato = this.contratos().find((c) => c.id === this.form.get('contratoId')?.value);
    const funcionario = this.funcionarios().find(
      (f) => f.id === this.form.get('funcionarioId')?.value,
    );

    if (!contrato || !funcionario) {
      return '';
    }

    const diarias = this.generateDiariasPreview();
    return `Serão geradas ${diarias.length} diárias para ${funcionario.nome} entre ${new Date(contrato.dataInicio + 'T12:00:00').toLocaleDateString()} e ${new Date(contrato.dataFim + 'T12:00:00').toLocaleDateString()}.`;
  });

  ngOnInit(): void {
    this.buildForm();
    this.loadClientes();
    this.setupClienteChange();
    this.setupContratoChange();
    this.setupFuncionarioChange();
  }

  // Escala do funcionário selecionado (para mostrar/ocultar diaPartida)
  selectedFuncionarioEscala = signal<string | null>(null);

  buildForm(): void {
    this.form = this.fb.group({
      clienteId: ['', Validators.required],
      contratoId: [{ value: '', disabled: true }, Validators.required],
      alocacaoId: [{ value: '', disabled: true }, Validators.required],
      funcionarioId: [{ value: '', disabled: true }, Validators.required],
      diaPartida: ['TRABALHA'], // 'TRABALHA' ou 'FOLGA' — só usado em 12x36
    });
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => this.handleError('Erro ao carregar clientes.', err),
    });
  }

  setupClienteChange(): void {
    this.form.get('clienteId')?.valueChanges.subscribe((id) => {
      this.form.get('contratoId')?.reset({ value: '', disabled: !id });
      this.form.get('alocacaoId')?.reset({ value: '', disabled: !id });
      this.form.get('funcionarioId')?.reset({ value: '', disabled: !id });
      
      this.contratos.set([]);
      this.alocacoes.set([]);
      this.funcionarios.set([]);

      if (id) {
        this.loadContratos(id);
        this.loadPostos(id);
        this.loadFuncionarios(id);
      }
    });
  }

  setupContratoChange(): void {
    this.form.get('contratoId')?.valueChanges.subscribe((id) => {
      this.form.get('alocacaoId')?.reset({ value: '', disabled: !id });
      this.alocacoes.set([]);
      if (id) {
        this.loadAlocacoesByContrato(id);
      }
    });
  }

  setupFuncionarioChange(): void {
    this.form.get('funcionarioId')?.valueChanges.subscribe((funcId) => {
      if (!funcId) {
        this.selectedFuncionarioEscala.set(null);
        return;
      }
      const func = this.funcionarios().find(f => f.id === funcId);
      this.selectedFuncionarioEscala.set(func?.tipoEscala ?? null);
      // Reset diaPartida ao trocar funcionário
      this.form.get('diaPartida')?.setValue('TRABALHA');
    });
  }

  loadContratos(clienteId: string): void {
    this.contratoService.getAll().subscribe({
      next: (data) => {
        this.contratos.set(
          data.filter(
            (c) => c.clienteId === clienteId && c.status !== StatusContrato.FINALIZADO,
          ),
        );
      },
      error: (err) => this.handleError('Erro ao carregar contratos.', err),
    });
  }

  loadAlocacoesByContrato(contratoId: string): void {
    this.alocacaoService.getByContratoId(contratoId).subscribe({
      next: (data) => this.alocacoes.set(data),
      error: (err) => this.handleError('Erro ao carregar alocações.', err),
    });
  }

  loadPostos(clienteId: string): void {
    this.postoService.getAll().subscribe({
      next: (data) => this.postos.set(data.filter((p) => p.clienteId === clienteId)),
      error: (err) => this.handleError('Erro ao carregar postos.', err),
    });
  }

  loadFuncionarios(clienteId: string): void {
    this.funcionarioService.getAll().subscribe({
      next: (data) => this.funcionarios.set(data.filter((f) => f.clienteId === clienteId)),
      error: (err) => this.handleError('Erro ao carregar funcionários.', err),
    });
  }

  generateDiariasPreview(): CreateDiariaDto[] {
    const formValue = this.form.getRawValue();
    const contrato = this.contratos().find((c) => c.id === formValue.contratoId);
    const funcionario = this.funcionarios().find((f) => f.id === formValue.funcionarioId);

    if (!contrato || !funcionario || !formValue.alocacaoId) {
      return [];
    }

    const diarias: CreateDiariaDto[] = [];
    const dataInicio = new Date(contrato.dataInicio + 'T12:00:00');
    const dataFim = new Date(contrato.dataFim + 'T12:00:00');
    let dataAtual = new Date(dataInicio);

    if (funcionario.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) {
      let trabalha = formValue.diaPartida !== 'FOLGA'; // Permite inverter padrão par/ímpar
      while (dataAtual <= dataFim) {
        if (trabalha) {
          diarias.push(
            this.createDiariaDto(formValue.funcionarioId, formValue.alocacaoId, dataAtual),
          );
        }
        trabalha = !trabalha;
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    } else if (funcionario.tipoEscala === TipoEscala.SEMANAL_COMERCIAL) {
      while (dataAtual <= dataFim) {
        const diaSemana = dataAtual.getDay();
        if (diaSemana >= 1 && diaSemana <= 5) {
          // Monday to Friday
          diarias.push(
            this.createDiariaDto(formValue.funcionarioId, formValue.alocacaoId, dataAtual),
          );
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    } else if (funcionario.tipoEscala === TipoEscala.ALCALA_8H) {
      while (dataAtual <= dataFim) {
        const diaSemana = dataAtual.getDay();
        if (diaSemana >= 1 && diaSemana <= 6) {
          // Monday to Saturday
          diarias.push(
            this.createDiariaDto(formValue.funcionarioId, formValue.alocacaoId, dataAtual),
          );
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    }
    return diarias;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    const diarias = this.generateDiariasPreview();
    if (diarias.length === 0) {
      this.error.set('Nenhuma diária pôde ser gerada. Verifique os dados do formulário.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.diariaService.createBatch(diarias).subscribe({
      next: (result) => {
        console.log(`${result.length} diárias criadas com sucesso!`);
        this.router.navigate(['/diarias']);
      },
      error: (err) => this.handleError('Erro ao criar diárias em lote.', err),
    });
  }

  private createDiariaDto(
    funcionarioId: string,
    alocacaoId: string,
    data: Date,
  ): CreateDiariaDto {
    return {
      funcionarioId,
      alocacaoId,
      data: this.formatDate(data),
      statusDiaria: StatusDiaria.CONFIRMADA,
      tipoDiaria: TipoDiaria.REGULAR,
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancel(): void {
    this.router.navigate(['/diarias']);
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => this.form.get(key)?.markAsTouched());
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && (field.touched || this.submitted()));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors || (!field.touched && !this.submitted())) return '';
    if (field.errors['required']) return 'Este campo é obrigatório.';
    return 'Campo inválido.';
  }

  private handleError(message: string, error: any): void {
    this.error.set(message);
    this.loading.set(false);
    console.error(error);
  }
}
