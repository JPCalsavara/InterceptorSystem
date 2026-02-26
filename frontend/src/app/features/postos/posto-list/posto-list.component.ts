import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import {
  PostoDeTrabalho,
  Condominio,
  Contrato,
  Alocacao,
  StatusAlocacao,
} from '../../../models/index';

interface PostoPorCondominio {
  condominio: Condominio;
  postos: PostoDeTrabalho[];
}

@Component({
  selector: 'app-posto-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './posto-list.component.html',
  styleUrl: './posto-list.component.scss',
})
export class PostoListComponent implements OnInit {
  private service = inject(PostoDeTrabalhoService);
  private condominioService = inject(CondominioService);
  private contratoService = inject(ContratoService);
  private alocacaoService = inject(AlocacaoService);

  postos = signal<PostoDeTrabalho[]>([]);
  condominios = signal<Condominio[]>([]);
  contratos = signal<Contrato[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Agrupa postos por condomínio
  postosPorCondominio = computed<PostoPorCondominio[]>(() => {
    const condominiosMap = new Map<string, Condominio>();
    this.condominios().forEach((c) => condominiosMap.set(c.id, c));

    const grupos = new Map<string, PostoDeTrabalho[]>();
    this.postos().forEach((posto) => {
      if (!grupos.has(posto.condominioId)) {
        grupos.set(posto.condominioId, []);
      }
      grupos.get(posto.condominioId)!.push(posto);
    });

    const resultado: PostoPorCondominio[] = [];
    grupos.forEach((postos, condominioId) => {
      const condominio = condominiosMap.get(condominioId);
      if (condominio) {
        resultado.push({ condominio, postos });
      }
    });

    return resultado;
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.loadCondominios();
    this.loadContratos();
    this.loadPostos();
    this.loadAlocacoes();
  }

  loadCondominios(): void {
    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => console.error('Erro ao carregar condomínios:', err),
    });
  }

  loadContratos(): void {
    this.contratoService.getAll().subscribe({
      next: (data) => this.contratos.set(data),
      error: (err) => console.error('Erro ao carregar contratos:', err),
    });
  }

  loadAlocacoes(): void {
    this.alocacaoService.getAll().subscribe({
      next: (data) => this.alocacoes.set(data),
      error: (err) => console.error('Erro ao carregar alocações:', err),
    });
  }

  loadPostos(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.postos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar postos.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  getNumeroFaltas(postoId: string): number {
    // Calcula o número de faltas a partir das alocações
    return this.alocacoes().filter(
      (a) =>
        a.postoDeTrabalhoId === postoId && a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA,
    ).length;
  }

  formatHorario(inicio: string, fim: string): string {
    const inicioFormatado = inicio.substring(0, 5);
    const fimFormatado = fim.substring(0, 5);
    return `${inicioFormatado} às ${fimFormatado}`;
  }

  getContratoDescricao(contratoId: string): string {
    const contrato = this.contratos().find((c) => c.id === contratoId);
    return contrato ? contrato.descricao : '—';
  }

  confirmDelete(id: string, inicio: string, fim: string): void {
    const horario = this.formatHorario(inicio, fim);
    if (confirm(`Deseja excluir o posto "${horario}"?`)) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage.set('Posto excluído!');
          this.loadAll();
          setTimeout(() => this.dismissSuccess(), 5000);
        },
        error: (err) => {
          this.error.set('Erro ao excluir posto.');
          this.loading.set(false);
          console.error(err);
        },
      });
    }
  }

  dismissError(): void {
    this.error.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }
}
