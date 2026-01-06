import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { CondominioService } from '../../../services/condominio.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import {
  Contrato,
  StatusContrato,
  Condominio,
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
  private condominioService = inject(CondominioService);
  private funcionarioService = inject(FuncionarioService);

  contratos = signal<Contrato[]>([]);
  condominios = signal<Condominio[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  StatusContrato = StatusContrato;

  // Computed signals para organização kanban
  contratosPendentes = computed(() =>
    this.contratos().filter(
      (c) => c.status === StatusContrato.PENDENTE || c.status === StatusContrato.INATIVO
    )
  );
  contratosVerde = computed(() => this.getContratosByDias(90, Infinity));
  contratosAmarelo = computed(() => this.getContratosByDias(30, 90));
  contratosVermelho = computed(() => this.getContratosByDias(0, 30));
  contratosFinalizados = computed(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return this.contratos().filter((c) => {
      if (c.status !== StatusContrato.PAGO) return false;
      const dataFim = new Date(c.dataFim);
      dataFim.setHours(0, 0, 0, 0);
      return dataFim < hoje;
    });
  });

  // Métricas mensais
  totalContratos = computed(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return this.contratos().filter((c) => {
      // Excluir contratos finalizados (PAGO com dataFim no passado)
      if (c.status === StatusContrato.PAGO) {
        const dataFim = new Date(c.dataFim);
        dataFim.setHours(0, 0, 0, 0);
        if (dataFim < hoje) return false; // Finalizado
      }
      return true;
    }).length;
  });
  faturamentoMensal = computed(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return this.contratos()
      .filter((c) => {
        if (c.status !== StatusContrato.PAGO) return false;
        const dataFim = new Date(c.dataFim);
        dataFim.setHours(0, 0, 0, 0);
        return dataFim >= hoje; // Apenas não finalizados
      })
      .reduce((sum, c) => sum + this.getValorMensal(c), 0);
  });
  custoMensal = computed(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return this.contratos()
      .filter((c) => {
        if (c.status !== StatusContrato.PAGO) return false;
        const dataFim = new Date(c.dataFim);
        dataFim.setHours(0, 0, 0, 0);
        return dataFim >= hoje; // Apenas não finalizados
      })
      .reduce((sum, c) => sum + this.getContratoCusto(c), 0);
  });
  lucroMensal = computed(() => this.faturamentoMensal() - this.custoMensal());

  ngOnInit(): void {
    this.loadContratos();
    this.loadCondominios();
    this.loadFuncionarios();
  }

  loadCondominios(): void {
    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => console.error('Erro ao carregar condomínios:', err),
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
      case StatusContrato.PAGO:
        return 'Pago';
      case StatusContrato.PENDENTE:
        return 'Pendente';
      case StatusContrato.INATIVO:
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  }

  getStatusClass(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.PAGO:
        return 'success';
      case StatusContrato.PENDENTE:
        return 'warning';
      case StatusContrato.INATIVO:
        return 'inactive';
      default:
        return '';
    }
  }

  getContratosByDias(min: number, max: number): Contrato[] {
    const now = new Date();
    return this.contratos().filter((c) => {
      if (c.status !== StatusContrato.PAGO) return false;
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

  getCondominioNome(condominioId: string): string {
    const cond = this.condominios().find((c) => c.id === condominioId);
    return cond?.nome || 'Desconhecido';
  }

  getContratoLucro(contrato: Contrato): number {
    const valorMensal = this.getValorMensal(contrato);
    const custo = this.getContratoCusto(contrato);
    return valorMensal - custo;
  }

  getContratoCusto(contrato: Contrato): number {
    const funcionariosCondominio = this.funcionarios().filter(
      (f) =>
        f.condominioId === contrato.condominioId && f.statusFuncionario === StatusFuncionario.ATIVO
    );

    const custoFixo = funcionariosCondominio.reduce(
      (sum, f) => sum + f.salarioMensal + f.valorTotalBeneficiosMensal + f.valorDiariasFixas,
      0
    );

    return custoFixo;
  }

  getValorMensal(contrato: Contrato): number {
    return contrato.valorTotalMensal || 0;
  }
}
