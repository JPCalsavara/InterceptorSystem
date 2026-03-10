import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { DiariaService } from '../../../services/diaria.service';
import {
  Posto,
  Alocacao,
  Cliente,
  Contrato,
  Diaria,
  StatusDiaria,
  StatusContrato,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';

interface PostoPorCliente {
  cliente: Cliente;
  postos: Posto[];
}

@Component({
  selector: 'app-posto-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './posto-list.component.html',
  styleUrl: './posto-list.component.scss',
})
export class PostoListComponent implements OnInit {
  private service = inject(PostoService);
  private clienteService = inject(ClienteService);
  private contratoService = inject(ContratoService);
  private diariaService = inject(DiariaService);
  private alocacaoService = inject(AlocacaoService);

  postos = signal<Posto[]>([]);
  clientes = signal<Cliente[]>([]);
  contratos = signal<Contrato[]>([]);
  diarias = signal<Diaria[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Agrupa postos por cliente
  postosPorCliente = computed<PostoPorCliente[]>(() => {
    const clientesMap = new Map<string, Cliente>();
    this.clientes().forEach((c) => clientesMap.set(c.id, c));

    const grupos = new Map<string, Posto[]>();
    this.postos().forEach((posto) => {
      if (!grupos.has(posto.clienteId)) {
        grupos.set(posto.clienteId, []);
      }
      grupos.get(posto.clienteId)!.push(posto);
    });

    const resultado: PostoPorCliente[] = [];
    grupos.forEach((postos, clienteId) => {
      const cliente = clientesMap.get(clienteId);
      if (cliente) {
        resultado.push({ cliente, postos });
      }
    });

    return resultado;
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.loadClientes();
    this.loadContratos();
    this.loadPostos();
    this.loadAlocacoes();
    this.loadDiarias();
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Erro ao carregar clientes:', err),
    });
  }

  loadContratos(): void {
    this.contratoService.getAll().subscribe({
      next: (data) => this.contratos.set(data),
      error: (err) => console.error('Erro ao carregar contratos:', err),
    });
  }

  loadDiarias(): void {
    this.diariaService.getAll().subscribe({
      next: (data) => this.diarias.set(data),
      error: (err) => console.error('Erro ao carregar diárias:', err),
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
    const alocIds = this.alocacoes().filter(al => al.postoId === postoId).map(al => al.id);
    return this.diarias().filter(
      (a) =>
        alocIds.includes(a.alocacaoId) && a.statusDiaria === StatusDiaria.FALTA_REGISTRADA,
    ).length;
  }

  formatNome(nome: string, cidade: string): string {
    return `${nome} - ${cidade}`;
  }

  getContratoDescricao(contratoId: string): string {
    const contrato = this.contratos().find((c) => c.id === contratoId);
    return contrato ? contrato.descricao : '—';
  }

  getContratoDoCliente(clienteId: string): string {
    const contrato = this.contratos().find(
      (c) => c.clienteId === clienteId && c.status === StatusContrato.ATIVO,
    );
    return contrato?.descricao || '—';
  }

  getCapacidadeMaxDobras(clienteId: string): number {
    return 0;
  }

  getPermiteDobras(clienteId: string): boolean {
    return false;
  }

  confirmDelete(id: string, nome: string, cidade: string): void {
    const postoNome = this.formatNome(nome, cidade);
    if (confirm(`Deseja excluir o posto "${postoNome}"?`)) {
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
