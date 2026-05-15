import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlocacaoService } from '../../../services/alocacao.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import {
  Alocacao,
  Posto,
  Cliente,
  Diaria,
  Funcionario,
  TipoEscala,
  StatusDiaria
} from '../../../models/index';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-alocacao-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alocacao-detail.component.html',
  styleUrl: './alocacao-detail.component.scss',
})
export class AlocacaoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private alocacaoService = inject(AlocacaoService);
  private postoService = inject(PostoService);
  private clienteService = inject(ClienteService);
  private diariaService = inject(DiariaService);
  private funcionarioService = inject(FuncionarioService);

  alocacao = signal<Alocacao | null>(null);
  posto = signal<Posto | null>(null);
  cliente = signal<Cliente | null>(null);
  diarias = signal<Diaria[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  
  loading = signal(true);
  error = signal<string | null>(null);

  nextDiarias = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.diarias()
      .filter(d => new Date(d.data + 'T12:00:00') >= today)
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 10);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
    }
  }

  loadData(id: string): void {
    this.loading.set(true);
    this.alocacaoService.getById(id).subscribe({
      next: (aloc) => {
        this.alocacao.set(aloc);
        this.loadRelatedData(aloc);
      },
      error: (err) => {
        this.error.set('Erro ao carregar turno.');
        this.loading.set(false);
      }
    });
  }

  private loadRelatedData(aloc: Alocacao): void {
    forkJoin({
      posto: this.postoService.getById(aloc.postoId),
      diarias: this.diariaService.getAll(),
      funcionarios: this.funcionarioService.getAll()
    }).subscribe({
      next: (res) => {
        this.posto.set(res.posto);
        const filteredDiarias = res.diarias.filter(d => d.alocacaoId === aloc.id);
        this.diarias.set(filteredDiarias);
        this.funcionarios.set(res.funcionarios);
        
        this.clienteService.getById(res.posto.clienteId).subscribe(c => this.cliente.set(c));
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dados relacionados:', err);
        this.loading.set(false);
      }
    });
  }

  getEscalaLabel(tipo: TipoEscala): string {
    const labels = {
      [TipoEscala.DOZE_POR_TRINTA_SEIS]: '12x36',
      [TipoEscala.SEMANAL_COMERCIAL]: 'Comercial',
      [TipoEscala.FOLGUISTA]: 'Folguista',
      [TipoEscala.OITO_HORAS_SEIS_POR_DOIS]: '8h (6x2)',
    };
    return labels[tipo] || tipo;
  }

  getFuncionarioNome(id: string): string {
    return this.funcionarios().find(f => f.id === id)?.nome || '—';
  }

  getStatusClass(status: StatusDiaria): string {
    const map = {
      [StatusDiaria.CONFIRMADA]: 'status-confirmada',
      [StatusDiaria.CANCELADA]: 'status-cancelada',
      [StatusDiaria.FALTA_REGISTRADA]: 'status-falta'
    };
    return map[status] || '';
  }

  formatDate(date: string): string {
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  }
}
