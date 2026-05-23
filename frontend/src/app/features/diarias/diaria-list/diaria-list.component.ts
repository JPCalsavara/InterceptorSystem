import { Component, OnInit, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { DiariaFormComponent } from '../diaria-form/diaria-form.component';
import { FeriadosService } from '../../../services/feriados.service';
import {
  Diaria,
  Funcionario,
  Posto,
  Alocacao,
  Cliente,
  StatusDiaria,
  TipoDiaria,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';

type ViewMode = 'daily' | 'weekly' | 'monthly';
type LegendHighlight =
  | { type: 'funcionario'; id: string }
  | { type: 'falta' | 'substituicao' | 'dobra' };

interface DayCell {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  diarias: Diaria[];
}

interface WeekColumn {
  date: Date;
  dateStr: string;
  dayName: string;
  postos: {
    posto: Posto;
    cliente: Cliente;
    diarias: Diaria[];
  }[];
}

@Component({
  selector: 'app-diaria-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DiariaFormComponent],
  templateUrl: './diaria-list.component.html',
  styleUrl: './diaria-list.component.scss',
})
export class DiariaListComponent implements OnInit {
  private service = inject(DiariaService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private clienteService = inject(ClienteService);
  private feriadosService = inject(FeriadosService);
  private alocacaoService = inject(AlocacaoService);
  private router = inject(Router);

  clienteIdFixed = input<string>('');

  diarias = signal<Diaria[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<Posto[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  clientes = signal<Cliente[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  highlightedFilter = signal<LegendHighlight[]>([]);
  editingDiariaId = signal<string | null>(null);

  isCronogramaView = computed(() => this.router.url.startsWith('/cronograma'));
  baseRoute = computed(() => (this.isCronogramaView() ? '/cronograma' : '/diarias'));
  pageTitle = computed(() => (this.isCronogramaView() ? 'Cronograma' : 'Diárias'));
  pageSubtitle = computed(() =>
    this.isCronogramaView()
      ? 'Gerencie o cronograma diário de funcionários'
      : 'Gerencie todas as diárias de funcionários',
  );

  // View mode
  viewMode = signal<ViewMode>('daily');

  // Filtros
  filtroClienteId = signal<string>('');
  filtroFuncionarioId = signal<string>('');
  filtroStatus = signal<string>('');
  filtroTipo = signal<string>('');
  filtroDataInicio = signal<string>(this.getToday());
  filtroDataFim = signal<string>(this.getToday());

  // Controle de período para visualização semanal e mensal
  currentDate = signal<Date>(new Date());

  // Diárias filtradas
  diariasFiltradas = computed(() => {
    let resultado = this.diarias();

    const clienteId = this.filtroClienteId();
    if (clienteId) {
      const postosDoCliente = this.postos()
        .filter((p) => p.clienteId === clienteId)
        .map((p) => p.id);
      resultado = resultado.filter((a) => {
        const aloc = this.alocacoes().find((al) => al.id === a.alocacaoId);
        return aloc && postosDoCliente.includes(aloc.postoId);
      });
    }

    const funcionarioId = this.filtroFuncionarioId();
    if (funcionarioId) {
      resultado = resultado.filter((a) => a.funcionarioId === funcionarioId);
    }

    const status = this.filtroStatus();
    if (status) {
      resultado = resultado.filter((a) => a.statusDiaria === status);
    }

    const tipo = this.filtroTipo();
    if (tipo) {
      resultado = resultado.filter((a) => a.tipoDiaria === tipo);
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

      const dayPostos = this.postos()
        .map((posto) => {
          const cliente = this.clientes().find((c) => c.id === posto.clienteId);
          const alocIds = this.alocacoes()
            .filter((al) => al.postoId === posto.id)
            .map((al) => al.id);
          const diarias = this.diariasFiltradas().filter(
            (a) => alocIds.includes(a.alocacaoId) && a.data === dateStr,
          );

          return {
            posto,
            cliente: cliente!,
            diarias,
          };
        })
        .filter((item) => item.cliente && item.diarias.length > 0);

      columns.push({
        date: currentDay,
        dateStr,
        dayName: this.getDayName(currentDay),
        postos: dayPostos,
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
        diarias: [],
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = this.formatDateToISO(cellDate);
      const diarias = this.diariasFiltradas().filter((a) => a.data === dateStr);

      cells.push({
        date: cellDate,
        dateStr,
        isCurrentMonth: true,
        diarias,
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
        diarias: [],
      });
    }

    return cells;
  });

  // Legenda de funcionários para visualização mensal
  funcionariosLegenda = computed(() => {
    const funcionariosUsados = new Map<string, { funcionario: Funcionario; number: number }>();
    let counter = 1;

    this.diariasFiltradas().forEach((diaria) => {
      if (!funcionariosUsados.has(diaria.funcionarioId)) {
        const funcionario = this.funcionarios().find((f) => f.id === diaria.funcionarioId);
        if (funcionario) {
          funcionariosUsados.set(diaria.funcionarioId, { funcionario, number: counter++ });
        }
      }
    });

    return Array.from(funcionariosUsados.values());
  });

  ngOnInit(): void {
    const fixedId = this.clienteIdFixed();
    if (fixedId) {
      this.filtroClienteId.set(fixedId);
    }
    this.loadAll();
  }

  // ...existing code...

  loadAll(): void {
    this.loading.set(true);
    const fixedClienteId = this.clienteIdFixed();

    Promise.all([
      this.loadDiarias(fixedClienteId),
      this.loadFuncionarios(fixedClienteId),
      this.loadPostos(fixedClienteId),
      this.loadAlocacoes(fixedClienteId),
      this.loadClientes(),
    ]).finally(() => this.loading.set(false));
  }

  loadDiarias(clienteId?: string): Promise<void> {
    return new Promise((resolve) => {
      const request$ = clienteId ? this.service.getByClienteId(clienteId) : this.service.getAll();
      request$.subscribe({
        next: (data) => {
          this.diarias.set(data);
          resolve();
        },
        error: (err) => {
          this.error.set('Erro ao carregar diárias.');
          console.error(err);
          resolve();
        },
      });
    });
  }

  loadFuncionarios(clienteId?: string): Promise<void> {
    return new Promise((resolve) => {
      const request$ = clienteId
        ? this.funcionarioService.getByClienteId(clienteId)
        : this.funcionarioService.getAll();
      request$.subscribe({
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

  loadPostos(clienteId?: string): Promise<void> {
    return new Promise((resolve) => {
      const request$ = clienteId
        ? this.postoService.getByClienteId(clienteId)
        : this.postoService.getAll();
      request$.subscribe({
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

  loadAlocacoes(clienteId?: string): Promise<void> {
    return new Promise((resolve) => {
      const request$ = clienteId
        ? this.alocacaoService.getByClienteId(clienteId)
        : this.alocacaoService.getAll();
      request$.subscribe({
        next: (data) => {
          this.alocacoes.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar alocacoes:', err);
          resolve();
        },
      });
    });
  }

  loadClientes(): Promise<void> {
    return new Promise((resolve) => {
      this.clienteService.getAll().subscribe({
        next: (data) => {
          this.clientes.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar clientes:', err);
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
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
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
    const item = this.funcionariosLegenda().find((f) => f.funcionario.id === funcionarioId);
    return item?.number || 0;
  }

  getFuncionarioLegendaIndex(funcionarioId: string): number {
    return this.funcionariosLegenda().findIndex((item) => item.funcionario.id === funcionarioId);
  }

  getDiariaMonthlyClass(diaria: Diaria): string {
    if (diaria.statusDiaria === 'FALTA_REGISTRADA') return 'emp-falta';
    if (diaria.statusDiaria === 'CANCELADA') return 'emp-cancelada';
    if (diaria.tipoDiaria === 'SUBSTITUICAO') return 'emp-substituicao';
    if (diaria.tipoDiaria === 'DOBRA_PROGRAMADA') return 'emp-dobra';
    const index = this.getFuncionarioLegendaIndex(diaria.funcionarioId);
    return `emp-color-${index % 12}`;
  }

  getLegendColorClass(funcionarioId: string): string {
    const index = this.getFuncionarioLegendaIndex(funcionarioId);
    return `emp-color-${index % 12}`;
  }

  getFuncionarioNome(funcionarioId: string): string {
    return this.funcionarios().find((f) => f.id === funcionarioId)?.nome || 'N/A';
  }

  getPostoHorario(alocacaoId: string): string {
    const aloc = this.alocacoes().find((a) => a.id === alocacaoId);
    if (!aloc) return 'N/A';
    const posto = this.postos().find((p) => p.id === aloc.postoId);
    if (!posto) return 'N/A';
    return `${posto.nome} - ${posto.cidade}`;
  }

  getClienteNome(alocacaoId: string): string {
    const aloc = this.alocacoes().find((a) => a.id === alocacaoId);
    if (!aloc) return 'N/A';
    const posto = this.postos().find((p) => p.id === aloc.postoId);
    if (!posto) return 'N/A';
    return this.clientes().find((c) => c.id === posto.clienteId)?.nome || 'N/A';
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatusLabel(status: StatusDiaria): string {
    const labels: Record<StatusDiaria, string> = {
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelamento',
      FALTA_REGISTRADA: 'Falta',
    };
    return labels[status] || status;
  }

  getStatusClass(status: StatusDiaria): string {
    const classes: Record<StatusDiaria, string> = {
      CONFIRMADA: 'badge-success',
      CANCELADA: 'badge-inactive',
      FALTA_REGISTRADA: 'badge-warning',
    };
    return classes[status] || '';
  }

  getTipoLabel(tipo: TipoDiaria): string {
    const labels: Record<TipoDiaria, string> = {
      REGULAR: 'Regular',
      DOBRA_PROGRAMADA: 'Diária Extra',
      SUBSTITUICAO: 'Substituição',
    };
    return labels[tipo] || tipo;
  }

  getTipoClass(tipo: TipoDiaria): string {
    const classes: Record<TipoDiaria, string> = {
      REGULAR: 'badge-info',
      DOBRA_PROGRAMADA: 'badge-warning',
      SUBSTITUICAO: 'badge-secondary',
    };
    return classes[tipo] || '';
  }

  confirmDelete(id: string, data: string): void {
    if (confirm(`Deseja excluir a diária do dia ${this.formatDate(data)}?`)) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage.set('Diária excluída!');
          this.loadAll();
          setTimeout(() => this.dismissSuccess(), 5000);
        },
        error: (err) => {
          this.error.set('Erro ao excluir diária.');
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

  navigateToEdit(id: string): void {
    this.openEditModal(id);
  }

  openEditModal(id: string): void {
    this.editingDiariaId.set(id);
  }

  closeEditModal(): void {
    this.editingDiariaId.set(null);
  }

  onDiariaSaved(): void {
    this.closeEditModal();
    this.successMessage.set('Diária atualizada com sucesso!');
    this.loadAll();
    setTimeout(() => this.dismissSuccess(), 5000);
  }

  getDayCellClasses(cell: DayCell): Record<string, boolean> {
    return {
      'other-month': !cell.isCurrentMonth,
      ...this.feriadosService.getDayCellClasses(cell.date, cell.dateStr),
    };
  }

  getFeriadoNome(dateStr: string): string | null {
    return this.feriadosService.getFeriadoNome(dateStr);
  }

  clearHighlight(): void {
    this.highlightedFilter.set([]);
  }

  /** Alterna o highlight ao clicar em um item da legenda */
  toggleLegendHighlight(filter: LegendHighlight): void {
    const current = this.highlightedFilter();
    const index = current.findIndex((f) =>
      f.type === filter.type &&
      (f.type === 'funcionario' && filter.type === 'funcionario' ? f.id === filter.id : true)
    );

    if (index >= 0) {
      this.highlightedFilter.set(current.filter((_, i) => i !== index));
    } else {
      this.highlightedFilter.set([...current, filter]);
    }
  }

  /** Retorna true se a célula deve ser destacada (contém uma diária que dá match com os filtros) */
  isDayHighlighted(cell: DayCell): boolean {
    const filters = this.highlightedFilter();
    if (filters.length === 0) return false;

    return cell.diarias.some((diaria) => {
      return filters.some((filter) => {
        switch (filter.type) {
          case 'funcionario':
            return diaria.funcionarioId === filter.id;
          case 'falta':
            return diaria.statusDiaria === 'FALTA_REGISTRADA';
          case 'substituicao':
            return diaria.tipoDiaria === 'SUBSTITUICAO';
          case 'dobra':
            return diaria.tipoDiaria === 'DOBRA_PROGRAMADA';
          default:
            return false;
        }
      });
    });
  }

  /** Retorna true se a célula deve ser opacificada (não pertence ao highlight ativo) */
  isDayDimmed(cell: DayCell): boolean {
    const filters = this.highlightedFilter();
    if (filters.length === 0) return false;
    return !this.isDayHighlighted(cell);
  }

  /** Retorna true se o item da legenda está selecionado */
  isLegendItemActive(filter: LegendHighlight): boolean {
    const current = this.highlightedFilter();
    return current.some((f) =>
      f.type === filter.type &&
      (f.type === 'funcionario' && filter.type === 'funcionario' ? f.id === filter.id : true)
    );
  }
}
