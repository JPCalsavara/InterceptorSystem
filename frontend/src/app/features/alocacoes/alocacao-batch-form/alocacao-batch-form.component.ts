import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlocacaoService } from '../../../services/alocacao.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Funcionario,
  PostoDeTrabalho,
  Condominio,
  Contrato,
  StatusAlocacao,
  TipoAlocacao,
  TipoEscala,
  StatusContrato,
  CreateAlocacaoDto,
} from '../../../models/index';

@Component({
  selector: 'app-alocacao-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './alocacao-batch-form.component.html',
  styleUrl: './alocacao-batch-form.component.scss', // Corrigido de styleUrls para styleUrl
})
export class AlocacaoBatchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private alocacaoService = inject(AlocacaoService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private condominioService = inject(CondominioService);
  private contratoService = inject(ContratoService);
  private router = inject(Router);

  form!: FormGroup;
  condominios = signal<Condominio[]>([]);
  contratos = signal<Contrato[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<PostoDeTrabalho[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  summary = computed(() => {
    const contrato = this.contratos().find(c => c.id === this.form.get('contratoId')?.value);
    const funcionario = this.funcionarios().find(f => f.id === this.form.get('funcionarioId')?.value);

    if (!contrato || !funcionario) {
      return '';
    }

    const alocacoes = this.generateAlocacoesPreview();
    return `Serão geradas ${alocacoes.length} alocações para ${funcionario.nome} entre ${new Date(contrato.dataInicio).toLocaleDateString()} e ${new Date(contrato.dataFim).toLocaleDateString()}.`;
  });

  ngOnInit(): void {
    this.buildForm();
    this.loadCondominios();
    this.setupCondominioChange();
  }

  buildForm(): void {
    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      contratoId: [{ value: '', disabled: true }, Validators.required],
      postoDeTrabalhoId: [{ value: '', disabled: true }, Validators.required],
      funcionarioId: [{ value: '', disabled: true }, Validators.required],
    });
  }

  loadCondominios(): void {
    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => this.handleError('Erro ao carregar condomínios.', err),
    });
  }

  setupCondominioChange(): void {
    this.form.get('condominioId')?.valueChanges.subscribe((id) => {
      this.form.get('contratoId')?.reset({ value: '', disabled: !id });
      this.form.get('postoDeTrabalhoId')?.reset({ value: '', disabled: !id });
      this.form.get('funcionarioId')?.reset({ value: '', disabled: !id });

      this.contratos.set([]);
      this.postos.set([]);
      this.funcionarios.set([]);

      if (id) {
        this.loadContratos(id);
        this.loadPostos(id);
        this.loadFuncionarios(id);
      }
    });
  }

  loadContratos(condominioId: string): void {
    this.contratoService.getAll().subscribe({
      next: (data) => {
        this.contratos.set(data.filter(c => c.condominioId === condominioId && c.status !== StatusContrato.FINALIZADO));
      },
      error: (err) => this.handleError('Erro ao carregar contratos.', err),
    });
  }

  loadPostos(condominioId: string): void {
    this.postoService.getAll().subscribe({
      next: (data) => this.postos.set(data.filter(p => p.condominioId === condominioId)),
      error: (err) => this.handleError('Erro ao carregar postos.', err),
    });
  }

  loadFuncionarios(condominioId: string): void {
    this.funcionarioService.getAll().subscribe({
      next: (data) => this.funcionarios.set(data.filter(f => f.condominioId === condominioId)),
      error: (err) => this.handleError('Erro ao carregar funcionários.', err),
    });
  }

  generateAlocacoesPreview(): CreateAlocacaoDto[] {
    const formValue = this.form.getRawValue();
    const contrato = this.contratos().find(c => c.id === formValue.contratoId);
    const funcionario = this.funcionarios().find(f => f.id === formValue.funcionarioId);

    if (!contrato || !funcionario || !formValue.postoDeTrabalhoId) {
      return [];
    }

    const alocacoes: CreateAlocacaoDto[] = [];
    const dataInicio = new Date(contrato.dataInicio);
    const dataFim = new Date(contrato.dataFim);
    let dataAtual = new Date(dataInicio);

    if (funcionario.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) {
      let trabalha = true;
      while (dataAtual <= dataFim) {
        if (trabalha) {
          alocacoes.push(this.createAlocacaoDto(formValue.funcionarioId, formValue.postoDeTrabalhoId, dataAtual));
        }
        trabalha = !trabalha;
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    } else if (funcionario.tipoEscala === TipoEscala.SEMANAL_COMERCIAL) {
      while (dataAtual <= dataFim) {
        const diaSemana = dataAtual.getUTCDay();
        if (diaSemana >= 1 && diaSemana <= 5) { // Monday to Friday
          alocacoes.push(this.createAlocacaoDto(formValue.funcionarioId, formValue.postoDeTrabalhoId, dataAtual));
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    }
    return alocacoes;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    const alocacoes = this.generateAlocacoesPreview();
    if (alocacoes.length === 0) {
      this.error.set('Nenhuma alocação pôde ser gerada. Verifique os dados do formulário.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.alocacaoService.createBatch(alocacoes).subscribe({
      next: (result) => {
        console.log(`${result.length} alocações criadas com sucesso!`);
        this.router.navigate(['/alocacoes']);
      },
      error: (err) => this.handleError('Erro ao criar alocações em lote.', err),
    });
  }

  private createAlocacaoDto(funcionarioId: string, postoDeTrabalhoId: string, data: Date): CreateAlocacaoDto {
    return {
      funcionarioId,
      postoDeTrabalhoId,
      data: this.formatDate(data),
      statusAlocacao: StatusAlocacao.CONFIRMADA,
      tipoAlocacao: TipoAlocacao.REGULAR,
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancel(): void {
    this.router.navigate(['/alocacoes']);
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
