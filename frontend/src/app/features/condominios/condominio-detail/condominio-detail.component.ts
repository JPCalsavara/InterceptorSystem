import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CondominioService } from '../../../services/condominio.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Condominio,
  Funcionario,
  PostoDeTrabalho,
  Alocacao,
  Contrato,
  StatusAlocacao,
  StatusFuncionario,
} from '../../../models/index';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-condominio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './condominio-detail.component.html',
  styleUrl: './condominio-detail.component.scss',
})
export class CondominioDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private condominioService = inject(CondominioService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private alocacaoService = inject(AlocacaoService);
  private contratoService = inject(ContratoService);

  condominio = signal<Condominio | null>(null);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<PostoDeTrabalho[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  contratos = signal<Contrato[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Métricas computadas
  custoTotal = computed(() => {
    return this.contratos().reduce((sum, c) => sum + c.valorTotalMensal, 0);
  });

  valorDiariaMedia = computed(() => {
    const contratos = this.contratos();
    if (contratos.length === 0) return 0;
    const total = contratos.reduce((sum, c) => sum + c.valorDiariaCobrada, 0);
    return total / contratos.length;
  });

  totalFuncionarios = computed(() => {
    return this.funcionarios().filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO)
      .length;
  });

  totalFaltas = computed(() => {
    return this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA)
      .length;
  });

  alocacoesComProblema = computed(() => {
    return this.alocacoes().filter(
      (a) =>
        a.statusAlocacao === StatusAlocacao.CANCELADA ||
        a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA
    );
  });

  custoEstimadoMensal = computed(() => {
    return this.funcionarios()
      .filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO)
      .reduce((sum, f) => sum + f.salarioMensal + f.valorTotalBeneficiosMensal, 0);
  });

  custoExtraFaltas = computed(() => {
    const faltas = this.alocacoes().filter(
      (a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA
    );
    return faltas.reduce((sum, a) => {
      const func = this.funcionarios().find((f) => f.id === a.funcionarioId);
      return sum + (func?.valorDiariasFixas || 0);
    }, 0);
  });

  totalAdicionalNoturno = computed(() => {
    // Estima 20% do valor da diária para adicional noturno
    const alocacoesNoturnos = this.alocacoes().filter(
      (a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA
    );
    return alocacoesNoturnos.reduce((sum, a) => {
      const func = this.funcionarios().find((f) => f.id === a.funcionarioId);
      return sum + (func?.valorDiariasFixas || 0) * 0.2;
    }, 0);
  });

  totalBeneficios = computed(() => {
    return this.funcionarios()
      .filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO)
      .reduce((sum, f) => sum + f.valorTotalBeneficiosMensal, 0);
  });

  faturamentoTotal = computed(() => {
    return this.contratos()
      .filter((c) => c.status === 'PAGO')
      .reduce((sum, c) => sum + c.valorTotalMensal, 0);
  });

  contratoAtual = computed(() => {
    const contratos = this.contratos();
    console.log('Contratos disponíveis:', contratos);
    if (contratos.length === 0) return null;
    // Retorna o contrato com data fim mais próxima no futuro
    const now = new Date();
    const ativos = contratos.filter((c) => {
      const dataFim = new Date(c.dataFim);
      console.log(
        'Verificando contrato:',
        c.id,
        'dataFim:',
        c.dataFim,
        'parsed:',
        dataFim,
        'maior que now:',
        dataFim > now
      );
      return dataFim > now;
    });
    const contratoSelecionado =
      ativos.sort((a, b) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime())[0] ||
      contratos[0] ||
      null;
    console.log('Contrato atual selecionado:', contratoSelecionado);
    return contratoSelecionado;
  });

  diasParaVencimento = computed(() => {
    const contrato = this.contratoAtual();
    console.log('Calculando dias para vencimento, contrato:', contrato);
    if (!contrato || !contrato.dataFim) return null;
    const now = new Date();
    const fim = new Date(contrato.dataFim);
    const diff = fim.getTime() - now.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    console.log('Dias para vencimento:', dias);
    return dias;
  });

  vencimentoClass = computed(() => {
    const dias = this.diasParaVencimento();
    if (dias === null) return 'info-icon-info';
    if (dias <= 14) return 'info-icon-error'; // 2 semanas - vermelho
    if (dias <= 90) return 'info-icon-warning'; // 3 meses - amarelo
    return 'info-icon-success'; // verde
  });

  custoTotalFuncionarios = computed(() => {
    return this.funcionarios()
      .filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO)
      .reduce(
        (sum, f) => sum + f.salarioMensal + f.valorTotalBeneficiosMensal + f.valorDiariasFixas,
        0
      );
  });

  lucro = computed(() => {
    return this.faturamentoTotal() - this.custoTotalFuncionarios();
  });

  custoMedioFuncionario = computed(() => {
    const total = this.totalFuncionarios();
    return total > 0 ? this.custoTotalFuncionarios() / total : 0;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCondominioData(id);
    }
  }

  loadCondominioData(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      condominio: this.condominioService.getById(id),
      funcionarios: this.funcionarioService.getAll(),
      postos: this.postoService.getByCondominioId(id),
      alocacoes: this.alocacaoService.getAll(),
      contratos: this.contratoService.getAll(),
    }).subscribe({
      next: (data) => {
        this.condominio.set(data.condominio);
        // Filtrar funcionários do condomínio
        this.funcionarios.set(data.funcionarios.filter((f) => f.condominioId === id));
        this.postos.set(data.postos);

        // Filtrar alocações dos postos deste condomínio
        const postoIds = data.postos.map((p) => p.id);
        this.alocacoes.set(data.alocacoes.filter((a) => postoIds.includes(a.postoDeTrabalhoId)));

        // Filtrar contratos do condomínio
        this.contratos.set(data.contratos.filter((c) => c.condominioId === id));

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar dados do condomínio');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  getStatusLabel(status: StatusAlocacao): string {
    const labels = {
      [StatusAlocacao.CONFIRMADA]: 'Confirmada',
      [StatusAlocacao.CANCELADA]: 'Cancelada',
      [StatusAlocacao.FALTA_REGISTRADA]: 'Falta Registrada',
    };
    return labels[status] || 'Desconhecido';
  }

  getFuncionarioNome(funcionarioId: string): string {
    const func = this.funcionarios().find((f) => f.id === funcionarioId);
    return func?.nome || 'Desconhecido';
  }

  getPostoHorario(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    return posto?.horario || 'Desconhecido';
  }

  getAlocacoesByPosto(postoId: string): Alocacao[] {
    return this.alocacoes().filter((a) => a.postoDeTrabalhoId === postoId);
  }

  getStatusBadgeClass(status: StatusAlocacao): string {
    const classes = {
      [StatusAlocacao.CONFIRMADA]: 'badge-success',
      [StatusAlocacao.CANCELADA]: 'badge-error',
      [StatusAlocacao.FALTA_REGISTRADA]: 'badge-warning',
    };
    return classes[status] || '';
  }

  getTipoFuncionarioLabel(tipo: string): string {
    const labels: Record<string, string> = {
      CLT: 'CLT',
      FREELANCER: 'Freelancer',
      TERCEIRIZADO: 'Terceirizado',
    };
    return labels[tipo] || tipo;
  }

  getStatusFuncionarioLabel(status: string): string {
    const labels: Record<string, string> = {
      ATIVO: 'Ativo',
      FERIAS: 'Férias',
      AFASTADO: 'Afastado',
      DEMITIDO: 'Demitido',
    };
    return labels[status] || status;
  }

  getStatusFuncionarioBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      ATIVO: 'badge-success',
      FERIAS: 'badge-warning',
      AFASTADO: 'badge-warning',
      DEMITIDO: 'badge-error',
    };
    return classes[status] || 'badge-info';
  }

  getFaltasByFuncionario(funcionarioId: string): number {
    return this.alocacoes().filter(
      (a) =>
        a.funcionarioId === funcionarioId && a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA
    ).length;
  }

  deleteFuncionario(id: string): void {
    if (confirm('Tem certeza que deseja apagar este funcionário?')) {
      this.funcionarioService.delete(id).subscribe({
        next: () => {
          const condominioId = this.condominio()?.id;
          if (condominioId) {
            this.loadCondominioData(condominioId);
          }
        },
        error: (err) => {
          this.error.set('Erro ao apagar funcionário');
          console.error('Erro:', err);
        },
      });
    }
  }
}
