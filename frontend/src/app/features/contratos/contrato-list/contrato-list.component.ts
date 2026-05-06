import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { DiariaService } from '../../../services/diaria.service';
import { ContratoFinanceiroUiService } from '../../../services/contrato-financeiro-ui.service';
import {
  Contrato,
  StatusContrato,
  Cliente,
  Funcionario,
  StatusFuncionario,
  ContratoResumoFinanceiro,
  DiariasContratoResumo,
} from '../../../models/index';

@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contrato-list.component.html',
  styleUrl: './contrato-list.component.scss',
})
export class ContratoListComponent implements OnInit {
  private service = inject(ContratoService);
  private clienteService = inject(ClienteService);
  private funcionarioService = inject(FuncionarioService);
  private diariaService = inject(DiariaService);
  private financeiroUiService = inject(ContratoFinanceiroUiService);

  contratos = signal<Contrato[]>([]);
  clientes = signal<Cliente[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  resumosFinanceiros = signal<Map<string, ContratoResumoFinanceiro>>(new Map());
  calculosDetalhados = signal<Map<string, unknown>>(new Map());
  loading = signal(false);
  loadingResumos = signal(false);
  loadingCalculos = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  StatusContrato = StatusContrato;

  // Seletor de período
  periodoAno = signal<number>(new Date().getFullYear());
  periodoMes = signal<number>(new Date().getMonth() + 1);

  periodoLabel = computed(() => {
    return new Date(this.periodoAno(), this.periodoMes() - 1).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });
  });

  periodoAnterior(): void {
    const mes = this.periodoMes();
    if (mes === 1) {
      this.periodoAno.update((a) => a - 1);
      this.periodoMes.set(12);
    } else {
      this.periodoMes.update((m) => m - 1);
    }
    this.loadResumosFinanceiros();
  }

  proximoPeriodo(): void {
    const mes = this.periodoMes();
    if (mes === 12) {
      this.periodoAno.update((a) => a + 1);
      this.periodoMes.set(1);
    } else {
      this.periodoMes.update((m) => m + 1);
    }
    this.loadResumosFinanceiros();
  }

  // Computed signals para organização kanban
  contratosPendentes = computed(() =>
    this.contratos().filter((c) => c.status === StatusContrato.PENDENTE),
  );
  contratosVerde = computed(() => this.getContratosByDias(90, Infinity));
  contratosAmarelo = computed(() => this.getContratosByDias(30, 90));
  contratosVermelho = computed(() => this.getContratosByDias(0, 30));
  contratosFinalizados = computed(() => this.contratos().filter((c) => this.estaConcluido(c)));

  // Métricas mensais
  totalContratos = computed(() => this.contratos().filter((c) => !this.estaConcluido(c)).length);
  faturamentoMensal = computed(() =>
    this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO && !this.estaConcluido(c))
      .reduce((sum, c) => sum + this.getValorMensal(c), 0),
  );
  custoMensal = computed(() =>
    this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO && !this.estaConcluido(c))
      .reduce((sum, c) => sum + this.getCustoMensal(c), 0),
  );
  lucroMensal = computed(() =>
    this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO && !this.estaConcluido(c))
      .reduce((sum, c) => sum + this.getContratoLucro(c), 0),
  );

  custoRealMensal = computed(() =>
    this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO && !this.estaConcluido(c))
      .reduce((sum, c) => sum + this.getCustoMensal(c), 0),
  );

  lucroRealMensal = computed(() => this.lucroMensal());

  ngOnInit(): void {
    this.loadContratos();
    this.loadClientes();
    this.loadFuncionarios();
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Erro ao carregar clientes:', err),
    });
  }

  loadFuncionarios(): void {
    this.funcionarioService.getAll().subscribe({
      next: (data) => this.funcionarios.set(data),
      error: (err) => console.error('Erro ao carregar funcionários:', err),
    });
  }

  loadContratos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getAll().subscribe({
      next: (data) => {
        this.contratos.set(data);
        this.loading.set(false);
        this.loadResumosFinanceiros();
      },
      error: (err) => {
        this.error.set('Erro ao carregar contratos. Tente novamente.');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  loadResumosFinanceiros(): void {
    const contratosFiltrados = this.contratos().filter(
      (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
    );

    if (contratosFiltrados.length === 0) {
      this.resumosFinanceiros.set(new Map());
      return;
    }

    this.loadingResumos.set(true);
    const ano = this.periodoAno();
    const mes = this.periodoMes();

    const requests = contratosFiltrados.map((c) =>
      this.diariaService
        .getResumoFinanceiroByContrato(c.id, ano, mes)
        .pipe(catchError(() => of(null))),
    );

    forkJoin(requests).subscribe((resultados) => {
      const novoMapa = new Map<string, ContratoResumoFinanceiro>();
      resultados.forEach((resumo, i) => {
        if (resumo !== null) {
          novoMapa.set(contratosFiltrados[i].id, resumo);
        }
      });
      this.resumosFinanceiros.set(novoMapa);
      this.loadCalculosDetalhados();
      this.loadingResumos.set(false);
    });
  }

  loadCalculosDetalhados(): void {
    const contratosFiltrados = this.contratos().filter(
      (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
    );

    if (contratosFiltrados.length === 0) {
      this.calculosDetalhados.set(new Map());
      return;
    }

    this.loadingCalculos.set(true);
    this.financeiroUiService
      .carregarCalculosDetalhados$(contratosFiltrados, this.resumosFinanceiros())
      .subscribe({
        next: (mapa) => {
          this.calculosDetalhados.set(mapa);
          this.loadingCalculos.set(false);
        },
        error: () => {
          this.calculosDetalhados.set(new Map());
          this.loadingCalculos.set(false);
        },
      });
  }

  getResumoDiarias(contratoId: string): DiariasContratoResumo | undefined {
    const resumoFinanceiro = this.resumosFinanceiros().get(contratoId);
    if (!resumoFinanceiro) return undefined;

    return {
      contratoId: resumoFinanceiro.contratoId,
      ano: resumoFinanceiro.ano,
      mes: resumoFinanceiro.mes,
      totalDiarias: resumoFinanceiro.totalDiariasNormais + resumoFinanceiro.totalDiariasExtras,
      totalValorDiarias: resumoFinanceiro.custoRealTotal,
      totalConfirmadas: 0,
      totalFaltas: 0,
      totalCanceladas: 0,
      resumoByTag: [],
    };
  }

  confirmDelete(id: string, descricao: string): void {
    if (confirm(`Deseja realmente excluir o contrato "${descricao}"?`)) {
      this.deleteContrato(id);
    }
  }

  deleteContrato(id: string): void {
    this.loading.set(true);

    this.service.delete(id).subscribe({
      next: () => {
        this.successMessage.set('Contrato excluído com sucesso!');
        this.loadContratos();
        setTimeout(() => this.dismissSuccess(), 5000);
      },
      error: (err) => {
        this.error.set('Erro ao excluir contrato. Tente novamente.');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  dismissError(): void {
    this.error.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  getStatusLabel(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.ATIVO:
        return 'Ativo';
      case StatusContrato.PENDENTE:
        return 'Pendente';
      case StatusContrato.FINALIZADO:
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  }

  getStatusClass(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.ATIVO:
        return 'badge-success';
      case StatusContrato.PENDENTE:
        return 'badge-warning';
      case StatusContrato.FINALIZADO:
        return 'badge-neutral';
      default:
        return '';
    }
  }

  getContratosByDias(min: number, max: number): Contrato[] {
    const now = new Date();
    return this.contratos().filter((c) => {
      if (c.status !== StatusContrato.ATIVO || this.estaConcluido(c)) return false;
      const dataFim = new Date(c.dataFim);
      const diff = dataFim.getTime() - now.getTime();
      const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return dias >= min && dias < max;
    });
  }

  private estaConcluido(contrato: Contrato): boolean {
    if (contrato.status === StatusContrato.FINALIZADO) return true;
    return this.getDiasParaVencimento(contrato.dataFim) < 0;
  }

  getDiasParaVencimento(dataFim: string): number {
    const now = new Date();
    const fim = new Date(dataFim);
    const diff = fim.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getClienteNome(clienteId: string): string {
    const cond = this.clientes().find((c) => c.id === clienteId);
    return cond?.nome || 'Desconhecido';
  }

  getContratoLucro(contrato: Contrato): number {
    return this.getValorMensal(contrato) - this.getCustoMensal(contrato);
  }

  getValorMensal(contrato: Contrato): number {
    return this.financeiroUiService.getFaturamentoDetalhado(
      contrato,
      this.calculosDetalhados() as Map<string, any>,
    );
  }

  getCustoMensal(contrato: Contrato): number {
    return this.financeiroUiService.getCustoDetalhado(
      contrato,
      this.calculosDetalhados() as Map<string, any>,
    );
  }

  getTagRatesPreview(contrato: Contrato): string {
    const tags = contrato.tags ?? [];
    if (tags.length === 0) {
      return 'Sem tags tarifadas';
    }

    return tags.map((tag) => `${tag.tagNome}: ${this.formatCurrency(tag.valorDiaria)}`).join(' • ');
  }

  getMaxTagRate(contrato: Contrato): number {
    const tags = contrato.tags ?? [];
    return tags.length > 0 ? Math.max(...tags.map((tag) => tag.valorDiaria)) : 0;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  }
}
