import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { CondominioService } from '../../../services/condominio.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import {
  Contrato,
  Funcionario,
  PostoDeTrabalho,
  StatusContrato,
  TipoEscala,
  StatusFuncionario,
} from '../../../models/index';

@Component({
  selector: 'app-contrato-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contrato-detail.component.html',
  styleUrl: './contrato-detail.component.scss',
})
export class ContratoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contratoService = inject(ContratoService);
  private condominioService = inject(CondominioService);
  private postoService = inject(PostoDeTrabalhoService);
  private funcionarioService = inject(FuncionarioService);

  contrato = signal<Contrato | null>(null);
  postos = signal<PostoDeTrabalho[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  condominioNome = signal<string>('');
  loading = signal(true);
  erro = signal<string | null>(null);

  StatusContrato = StatusContrato;

  lucro = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    const impostos = c.valorTotalMensal * c.percentualImpostos;
    const beneficios = this.beneficiosTotais();
    const custoFuncionarios = this.totalCustoFuncionarios();
    return c.valorTotalMensal - impostos - beneficios - custoFuncionarios;
  });

  impostosMensal = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    return c.valorTotalMensal * c.percentualImpostos; // já é decimal
  });

  // Benefícios: usa funcionários reais se disponíveis, senão usa estimativa do contrato (qtd × 2)
  beneficiosTotais = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    const ativos = this.custoFuncionariosDetalhado().length;
    if (ativos > 0) {
      return ativos * (c.valorBeneficiosExtrasMensal || 0);
    }
    return (c.quantidadeFuncionarios || 0) * 2 * (c.valorBeneficiosExtrasMensal || 0);
  });

  // Custo mensal estimado por funcionário (diária × dias trabalhados + benefícios)
  custoFuncionario12x36 = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    return 15 * (c.valorDiariaCobrada || 0) + (c.valorBeneficiosExtrasMensal || 0);
  });

  custoFuncionario5x2 = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    return 22 * (c.valorDiariaCobrada || 0) + (c.valorBeneficiosExtrasMensal || 0);
  });

  // Custo individual de cada funcionário atual do condomínio
  custoFuncionariosDetalhado = computed(() => {
    const c = this.contrato();
    if (!c) return [];
    return this.funcionarios()
      .filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO)
      .map((f) => ({
        funcionario: f,
        custo: this.calcularCustoFuncionario(f, c),
        diasMes: f.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS ? 15 : 22,
        escala: f.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS ? '12×36' : '5×2',
      }));
  });

  totalCustoFuncionarios = computed(() =>
    this.custoFuncionariosDetalhado().reduce((sum, item) => sum + item.custo, 0),
  );

  calcularCustoFuncionario(func: Funcionario, contrato: Contrato): number {
    const dias = func.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS ? 15 : 22;
    return dias * (contrato.valorDiariaCobrada || 0) + (contrato.valorBeneficiosExtrasMensal || 0);
  }

  // Margens em valor absoluto
  margemLucroValor = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    return c.valorTotalMensal * c.margemLucroPercentual;
  });

  margemCoberturaFaltasValor = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    return c.valorTotalMensal * c.margemCoberturaFaltasPercentual;
  });

  // Lucro esperado mínimo = soma das margens alvo
  lucroEsperadoMinimo = computed(() => this.margemLucroValor() + this.margemCoberturaFaltasValor());

  // Custo total = impostos + benefícios + funcionários + encargos
  custoTotal = computed(
    () => this.impostosMensal() + this.beneficiosTotais() + this.totalCustoFuncionarios(),
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/contratos']);
      return;
    }

    this.contratoService.getById(id).subscribe({
      next: (contrato) => {
        this.contrato.set(contrato);
        this.loading.set(false);
        this.carregarCondominio(contrato.condominioId);
        this.carregarPostos(id);
        this.carregarFuncionarios(contrato.condominioId);
      },
      error: () => {
        this.erro.set('Contrato não encontrado.');
        this.loading.set(false);
      },
    });
  }

  private carregarCondominio(condominioId: string): void {
    this.condominioService.getById(condominioId).subscribe({
      next: (cond) => this.condominioNome.set(cond.nome),
      error: () => {},
    });
  }

  private carregarFuncionarios(condominioId: string): void {
    this.funcionarioService.getAll().subscribe({
      next: (todos) => this.funcionarios.set(todos.filter((f) => f.condominioId === condominioId)),
      error: () => {},
    });
  }

  private carregarPostos(contratoId: string): void {
    this.postoService.getByContratoId(contratoId).subscribe({
      next: (postos) => this.postos.set(postos),
      error: () => {},
    });
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
        return status;
    }
  }

  getStatusClass(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.ATIVO:
        return 'success';
      case StatusContrato.PENDENTE:
        return 'warning';
      case StatusContrato.FINALIZADO:
        return 'inactive';
      default:
        return '';
    }
  }

  formatHorario(horarioInicio: string, horarioFim: string): string {
    return `${horarioInicio.substring(0, 5)} – ${horarioFim.substring(0, 5)}`;
  }
}
