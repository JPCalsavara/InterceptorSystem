import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlocacaoService } from '../../../services/alocacao.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { Alocacao, Posto, Cliente, Contrato, TipoEscala } from '../../../models/index';
import { forkJoin } from 'rxjs';

interface AlocacaoView extends Alocacao {
  postoNome: string;
  clienteNome: string;
  contratoDesc: string;
}

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alocacao-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './alocacao-list.component.html',
  styleUrl: './alocacao-list.component.scss',
})
export class AlocacaoListComponent implements OnInit {
  private alocacaoService = inject(AlocacaoService);
  private postoService = inject(PostoService);
  private clienteService = inject(ClienteService);
  private contratoService = inject(ContratoService);

  alocacoes = signal<Alocacao[]>([]);
  postos = signal<Posto[]>([]);
  clientes = signal<Cliente[]>([]);
  contratos = signal<Contrato[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtros
  filtroCliente = signal<string>('');
  filtroPosto = signal<string>('');

  alocacoesView = computed(() => {
    let result = this.alocacoes();

    const clienteFiltro = this.filtroCliente();
    const postoFiltro = this.filtroPosto();

    if (clienteFiltro) {
      const postoIds = this.postos()
        .filter((p) => p.clienteId === clienteFiltro)
        .map((p) => p.id);
      result = result.filter((a) => postoIds.includes(a.postoId));
    }

    if (postoFiltro) {
      result = result.filter((a) => a.postoId === postoFiltro);
    }

    return result.map((aloc) => {
      const posto = this.postos().find((p) => p.id === aloc.postoId);
      const cliente = this.clientes().find((c) => c.id === posto?.clienteId);
      const contrato = this.contratos().find((c) => c.id === aloc.contratoId);

      return {
        ...aloc,
        postoNome: posto?.nome || '—',
        clienteNome: cliente?.nome || '—',
        contratoDesc: contrato?.descricao || '—',
      } as AlocacaoView;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      alocacoes: this.alocacaoService.getAll(),
      postos: this.postoService.getAll(),
      clientes: this.clienteService.getAll(),
      contratos: this.contratoService.getAll(),
    }).subscribe({
      next: (res) => {
        this.alocacoes.set(res.alocacoes);
        this.postos.set(res.postos);
        this.clientes.set(res.clientes);
        this.contratos.set(res.contratos);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar alocações');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  getEscalaLabel(tipo: TipoEscala): string {
    const labels = {
      [TipoEscala.DOZE_POR_TRINTA_SEIS]: '12x36',
      [TipoEscala.SEMANAL_COMERCIAL]: 'Comercial',
      [TipoEscala.ALCALA_8H]: '8 Horas',
      [TipoEscala.FOLGUISTA]: 'Folguista',
      [TipoEscala.OITO_HORAS_SEIS_POR_DOIS]: '8h (6x2)',
    };
    return labels[tipo] || tipo;
  }

  formatHorario(horario: string): string {
    return horario.substring(0, 5);
  }

  deleteAlocacao(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta alocação?')) {
      this.alocacaoService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Erro ao excluir:', err),
      });
    }
  }
}
