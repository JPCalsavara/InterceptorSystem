import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import {
  Contrato,
  StatusContrato,
  Cliente,
  Funcionario,
  StatusFuncionario,
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

  contratos = signal<Contrato[]>([]);
  clientes = signal<Cliente[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  StatusContrato = StatusContrato;

  // Computed signals para organização kanban
  contratosPendentes = computed(() =>
    this.contratos().filter((c) => c.status === StatusContrato.PENDENTE),
  );
  contratosVerde = computed(() => this.getContratosByDias(90, Infinity));
  contratosAmarelo = computed(() => this.getContratosByDias(30, 90));
  contratosVermelho = computed(() => this.getContratosByDias(0, 30));
  contratosFinalizados = computed(() =>
    this.contratos().filter((c) => c.status === StatusContrato.FINALIZADO),
  );

  // Métricas mensais
  totalContratos = computed(
    () => this.contratos().filter((c) => c.status !== StatusContrato.FINALIZADO).length,
  );
  faturamentoMensal = computed(() =>
    this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO)
      .reduce((sum, c) => sum + this.getValorMensal(c), 0),
  );
  custoMensal = computed(() =>
    this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO)
      .reduce((sum, c) => sum + this.getContratoCusto(c), 0),
  );
  lucroMensal = computed(() => this.faturamentoMensal() - this.custoMensal());

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
      },
      error: (err) => {
        this.error.set('Erro ao carregar contratos. Tente novamente.');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
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
        return 'Finalizado';
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
      if (c.status !== StatusContrato.ATIVO) return false;
      const dataFim = new Date(c.dataFim);
      const diff = dataFim.getTime() - now.getTime();
      const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return dias >= min && dias < max;
    });
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
    return this.getValorMensal(contrato) - this.getContratoCusto(contrato);
  }

  getContratoCusto(contrato: Contrato): number {
    const valorTotal = contrato.valorTotalMensal || 0;
    const diaria = contrato.valorDiariaCobrada || 0;
    const beneficioUnit = contrato.valorBeneficiosExtrasMensal || 0;

    // Impostos: percentualImpostos já é decimal (0.15 = 15%)
    const impostos = valorTotal * (contrato.percentualImpostos || 0);

    // Funcionários ativos deste cliente
    const ativos = this.funcionarios().filter(
      (f) => f.clienteId === contrato.clienteId && f.statusFuncionario === StatusFuncionario.ATIVO,
    );

    // Benefícios: se há ativos reais, usa qtd real; senao usa estimativa do contrato
    const qtdBeneficios =
      ativos.length > 0 ? ativos.length : (contrato.quantidadeFuncionarios || 0) * 2;
    const beneficios = qtdBeneficios * beneficioUnit;

    // Custo por funcionário (diaria × dias de escala)
    const custoFuncionarios = ativos.reduce((sum, f) => {
      // Sem TipoEscala disponível aqui — usar 15 dias como padrão (12×36)
      const dias = 15;
      return sum + dias * diaria + beneficioUnit;
    }, 0);

    return impostos + beneficios + custoFuncionarios;
  }

  getValorMensal(contrato: Contrato): number {
    return contrato.valorTotalMensal || 0;
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
