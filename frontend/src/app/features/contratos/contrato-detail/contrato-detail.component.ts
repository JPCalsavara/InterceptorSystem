import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { PostoService } from '../../../services/posto.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import {
  Contrato,
  Funcionario,
  Posto,
  Alocacao,
  StatusContrato,
  TipoEscala,
  StatusFuncionario,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';

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
  private clienteService = inject(ClienteService);
  private postoService = inject(PostoService);
  private funcionarioService = inject(FuncionarioService);
  private alocacaoService = inject(AlocacaoService);

  contrato = signal<Contrato | null>(null);
  alocacoes = signal<Alocacao[]>([]);
  postos = signal<Posto[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  clienteNome = signal<string>('');
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
    return (c.numeroDePostos || 0) * (c.valorBeneficiosExtrasMensal || 0);
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

  // Custo individual de cada funcionário atual do cliente
  custoFuncionariosDetalhado = computed(() => {
    const c = this.contrato();
    if (!c) return [];
    return this.funcionarios()
      .filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO)
      .map((f) => ({
        funcionario: f,
        custo: this.calcularCustoFuncionario(f, c),
        diasMes:
          f.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS
            ? 15
            : f.tipoEscala === TipoEscala.FOLGUISTA
              ? 8
              : f.tipoEscala === TipoEscala.OITO_HORAS_SEIS_POR_DOIS
                ? 26
                : 22,
        escala:
          f.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS
            ? '12×36'
            : f.tipoEscala === TipoEscala.ALCALA_8H
              ? 'Alcalá 8h'
              : f.tipoEscala === TipoEscala.FOLGUISTA
                ? 'Folguista'
                : f.tipoEscala === TipoEscala.OITO_HORAS_SEIS_POR_DOIS
                  ? '8h (6×2)'
                  : '5×2',
      }));
  });

  totalCustoFuncionarios = computed(() =>
    this.custoFuncionariosDetalhado().reduce((sum, item) => sum + item.custo, 0),
  );

  calcularCustoFuncionario(func: Funcionario, contrato: Contrato): number {
    let dias = 22;
    if (func.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) dias = 15;
    else if (func.tipoEscala === TipoEscala.FOLGUISTA) dias = 8;
    else if (func.tipoEscala === TipoEscala.OITO_HORAS_SEIS_POR_DOIS) dias = 26;
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
        this.carregarCliente(contrato.clienteId);
        this.carregarAlocacoes(id);
        this.carregarFuncionarios(contrato.clienteId);
      },
      error: () => {
        this.erro.set('Contrato não encontrado.');
        this.loading.set(false);
      },
    });
  }

  private carregarCliente(clienteId: string): void {
    this.clienteService.getById(clienteId).subscribe({
      next: (cond) => this.clienteNome.set(cond.nome),
      error: () => {},
    });
  }

  private carregarFuncionarios(clienteId: string): void {
    this.funcionarioService.getAll().subscribe({
      next: (todos) => this.funcionarios.set(todos.filter((f) => f.clienteId === clienteId)),
      error: () => {},
    });
  }

  private carregarAlocacoes(contratoId: string): void {
    this.alocacaoService.getByContratoId(contratoId).subscribe({
      next: (alocs) => this.alocacoes.set(alocs),
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

  getTagRatesPreview(): string {
    const tags = this.contrato()?.tags ?? [];
    if (tags.length === 0) {
      return 'Sem tags tarifadas neste contrato';
    }

    return tags.map((tag) => `${tag.tagNome}: ${this.formatCurrency(tag.valorDiaria)}`).join(' • ');
  }

  getMaiorTagRate(): number {
    const tags = this.contrato()?.tags ?? [];
    return tags.length > 0 ? Math.max(...tags.map((tag) => tag.valorDiaria)) : 0;
  }

  formatHorario(horarioInicio: string, horarioFim: string): string {
    return `${horarioInicio.substring(0, 5)} – ${horarioFim.substring(0, 5)}`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  }
}
