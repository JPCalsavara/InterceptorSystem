import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlocacaoService } from '../../../services/alocacao.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { CondominioService } from '../../../services/condominio.service';
import {
  Alocacao,
  Funcionario,
  PostoDeTrabalho,
  Condominio,
  StatusAlocacao,
  TipoAlocacao,
} from '../../../models/index';

type ViewMode = 'daily' | 'weekly' | 'monthly';

interface DayCell {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  alocacoes: Alocacao[];
}

interface WeekColumn {
  date: Date;
  dateStr: string;
  dayName: string;
  postos: {
    posto: PostoDeTrabalho;
    condominio: Condominio;
    alocacoes: Alocacao[];
  }[];
}

@Component({
  selector: 'app-alocacao-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './alocacao-list.component.html',
  styleUrl: './alocacao-list.component.scss',
})
export class AlocacaoListComponent implements OnInit {
  private service = inject(AlocacaoService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private condominioService = inject(CondominioService);

  alocacoes = signal<Alocacao[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<PostoDeTrabalho[]>([]);
  condominios = signal<Condominio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // View mode
  viewMode = signal<ViewMode>('daily');

  // Filtros
  filtroCondominioId = signal<string>('');
  filtroFuncionarioId = signal<string>('');
  filtroStatus = signal<string>('');
  filtroTipo = signal<string>('');
  filtroDataInicio = signal<string>(this.getToday());
  filtroDataFim = signal<string>(this.getToday());

  // Controle de período para visualização semanal e mensal
  currentDate = signal<Date>(new Date());

  // Alocações filtradas
  alocacoesFiltradas = computed(() => {
    let resultado = this.alocacoes();

    const condominioId = this.filtroCondominioId();
    if (condominioId) {
      const postosDoCondominio = this.postos()
        .filter((p) => p.condominioId === condominioId)
        .map((p) => p.id);
      resultado = resultado.filter((a) => postosDoCondominio.includes(a.postoDeTrabalhoId));
    }

    const funcionarioId = this.filtroFuncionarioId();
    if (funcionarioId) {
      resultado = resultado.filter((a) => a.funcionarioId === funcionarioId);
    }

    const status = this.filtroStatus();
    if (status) {
      resultado = resultado.filter((a) => a.statusAlocacao === status);
    }

    const tipo = this.filtroTipo();
    if (tipo) {
      resultado = resultado.filter((a) => a.tipoAlocacao === tipo);
    }

    // Filtro de data
    const dataInicio = this.filtroDataInicio();
    const dataFim = this.filtroDataFim();

    if (this.viewMode() === 'daily' && dataInicio && dataFim) {
      resultado = resultado.filter((a) => a.data >= dataInicio && a.data <= dataFim);
    }

    return resultado;
  });

  // Dados para visualização semanal
  weekData = computed(() => {
    const date = this.currentDate();
    const weekStart = this.getWeekStart(date);
    const columns: WeekColumn[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + i);
      const dateStr = this.formatDateToISO(currentDay);

      const dayPostos = this.postos().map(posto => {
        const condominio = this.condominios().find(c => c.id === posto.condominioId);
        const alocacoes = this.alocacoesFiltradas().filter(a =>
          a.postoDeTrabalhoId === posto.id && a.data === dateStr
        );

        return {
          posto,
          condominio: condominio!,
          alocacoes
        };
      }).filter(item => item.condominio && item.alocacoes.length > 0);

      columns.push({
        date: currentDay,
        dateStr,
        dayName: this.getDayName(currentDay),
        postos: dayPostos
      });
    }

    return columns;
  });

  // Dados para visualização mensal
  monthData = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells: DayCell[] = [];

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const cellDate = new Date(year, month - 1, day);
      cells.push({
        date: cellDate,
        dateStr: this.formatDateToISO(cellDate),
        isCurrentMonth: false,
        alocacoes: []
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = this.formatDateToISO(cellDate);
      const alocacoes = this.alocacoesFiltradas().filter(a => a.data === dateStr);

      cells.push({
        date: cellDate,
        dateStr,
        isCurrentMonth: true,
        alocacoes
      });
    }

    // Dias do próximo mês
    const remainingCells = 42 - cells.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingCells; day++) {
      const cellDate = new Date(year, month + 1, day);
      cells.push({
        date: cellDate,
        dateStr: this.formatDateToISO(cellDate),
        isCurrentMonth: false,
        alocacoes: []
      });
    }

    return cells;
  });

  // Legenda de funcionários para visualização mensal
  funcionariosLegenda = computed(() => {
    const funcionariosUsados = new Map<string, { funcionario: Funcionario; number: number }>();
    let counter = 1;

    this.alocacoesFiltradas().forEach(alocacao => {
      if (!funcionariosUsados.has(alocacao.funcionarioId)) {
        const funcionario = this.funcionarios().find(f => f.id === alocacao.funcionarioId);
        if (funcionario) {
          funcionariosUsados.set(alocacao.funcionarioId, { funcionario, number: counter++ });
        }
      }
    });

    return Array.from(funcionariosUsados.values());
  });

  ngOnInit(): void {
    this.loadAll();
  }

  // ...existing code...

  loadAll(): void {
    this.loading.set(true);
    Promise.all([
      this.loadAlocacoes(),
      this.loadFuncionarios(),
      this.loadPostos(),
      this.loadCondominios(),
    ]).finally(() => this.loading.set(false));
  }

  loadAlocacoes(): Promise<void> {
    return new Promise((resolve) => {
      this.service.getAll().subscribe({
        next: (data) => {
          this.alocacoes.set(data);
          resolve();
        },
        error: (err) => {
          this.error.set('Erro ao carregar alocações.');
          console.error(err);
          resolve();
        },
      });
    });
  }

  loadFuncionarios(): Promise<void> {
    return new Promise((resolve) => {
      this.funcionarioService.getAll().subscribe({
        next: (data) => {
          this.funcionarios.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar funcionários:', err);
          resolve();
        },
      });
    });
  }

  loadPostos(): Promise<void> {
    return new Promise((resolve) => {
      this.postoService.getAll().subscribe({
        next: (data) => {
          this.postos.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar postos:', err);
          resolve();
        },
      });
    });
  }

  loadCondominios(): Promise<void> {
    return new Promise((resolve) => {
      this.condominioService.getAll().subscribe({
        next: (data) => {
          this.condominios.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar condomínios:', err);
          resolve();
        },
      });
    });
  }

  aplicarFiltros(): void {
    // Os filtros são reativos via computed
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);

    // Ajustar filtros de data baseado no modo
    if (mode === 'daily') {
      // Manter filtros de data
    } else if (mode === 'weekly') {
      const weekStart = this.getWeekStart(this.currentDate());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      this.filtroDataInicio.set(this.formatDateToISO(weekStart));
      this.filtroDataFim.set(this.formatDateToISO(weekEnd));
    } else if (mode === 'monthly') {
      const date = this.currentDate();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      this.filtroDataInicio.set(this.formatDateToISO(firstDay));
      this.filtroDataFim.set(this.formatDateToISO(lastDay));
    }
  }

  previousPeriod(): void {
    const date = this.currentDate();
    const mode = this.viewMode();

    if (mode === 'weekly') {
      date.setDate(date.getDate() - 7);
    } else if (mode === 'monthly') {
      date.setMonth(date.getMonth() - 1);
    }

    this.currentDate.set(new Date(date));
    this.setViewMode(mode);
  }

  nextPeriod(): void {
    const date = this.currentDate();
    const mode = this.viewMode();

    if (mode === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (mode === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    }

    this.currentDate.set(new Date(date));
    this.setViewMode(mode);
  }

  today(): void {
    this.currentDate.set(new Date());
    this.setViewMode(this.viewMode());
  }

  getToday(): string {
    return this.formatDateToISO(new Date());
  }

  formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda-feira
    return new Date(d.setDate(diff));
  }

  getDayName(date: Date): string {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  }

  getMonthName(date: Date): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[date.getMonth()];
  }

  getCurrentPeriodLabel(): string {
    const date = this.currentDate();
    const mode = this.viewMode();

    if (mode === 'weekly') {
      const weekStart = this.getWeekStart(date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}/${weekEnd.getFullYear()}`;
    } else if (mode === 'monthly') {
      return `${this.getMonthName(date)} ${date.getFullYear()}`;
    }

    return '';
  }

  getFuncionarioNumber(funcionarioId: string): number {
    const item = this.funcionariosLegenda().find(f => f.funcionario.id === funcionarioId);
    return item?.number || 0;
  }

  getFuncionarioNome(funcionarioId: string): string {
    return this.funcionarios().find((f) => f.id === funcionarioId)?.nome || 'N/A';
  }

  getPostoHorario(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'N/A';
    const inicio = posto.horarioInicio.substring(0, 5);
    const fim = posto.horarioFim.substring(0, 5);
    return `${inicio} - ${fim}`;
  }

  getCondominioNome(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'N/A';
    return this.condominios().find((c) => c.id === posto.condominioId)?.nome || 'N/A';
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatusLabel(status: StatusAlocacao): string {
    const labels: Record<StatusAlocacao, string> = {
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      FALTA_REGISTRADA: 'Falta',
    };
    return labels[status] || status;
  }

  getStatusClass(status: StatusAlocacao): string {
    const classes: Record<StatusAlocacao, string> = {
      CONFIRMADA: 'badge-success',
      CANCELADA: 'badge-inactive',
      FALTA_REGISTRADA: 'badge-warning',
    };
    return classes[status] || '';
  }

  getTipoLabel(tipo: TipoAlocacao): string {
    const labels: Record<TipoAlocacao, string> = {
      REGULAR: 'Regular',
      DOBRA_PROGRAMADA: 'Dobra',
      SUBSTITUICAO: 'Substituição',
    };
    return labels[tipo] || tipo;
  }

  getTipoClass(tipo: TipoAlocacao): string {
    const classes: Record<TipoAlocacao, string> = {
      REGULAR: 'badge-info',
      DOBRA_PROGRAMADA: 'badge-warning',
      SUBSTITUICAO: 'badge-secondary',
    };
    return classes[tipo] || '';
  }

  confirmDelete(id: string, data: string): void {
    if (confirm(`Deseja excluir a alocação do dia ${this.formatDate(data)}?`)) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage.set('Alocação excluída!');
          this.loadAll();
          setTimeout(() => this.dismissSuccess(), 5000);
        },
        error: (err) => {
          this.error.set('Erro ao excluir alocação.');
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
