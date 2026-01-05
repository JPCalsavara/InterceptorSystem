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
    return this.contratos().reduce((sum, c) => sum + c.valorTotal, 0);
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
}
