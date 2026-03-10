import { Component, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

type ViewMode = 'daily' | 'weekly' | 'monthly';

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
  selector: 'app-diarias-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './diarias-view.component.html',
  styleUrl: './diarias-view.component.scss',
})
export class DiariasViewComponent {
  private feriadosService = inject(FeriadosService);

  readonly diarias = input<Diaria[]>([]);
  readonly funcionarios = input<Funcionario[]>([]);
  readonly postos = input<Posto[]>([]);
  readonly alocacoes = input<Alocacao[]>([]);
  readonly clientes = input<Cliente[]>([]);

  viewMode = signal<ViewMode>('monthly');
  filtroStatus = signal<string>('');
  currentDate = signal<Date>(new Date());

  diariasFiltradas = computed(() => {
    let result = this.diarias();
    const status = this.filtroStatus();
    if (status) result = result.filter((a) => a.statusDiaria === status);
    return result;
  });

  weekData = computed((): WeekColumn[] => {
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
          const alocIds = this.alocacoes().filter(al => al.postoId === posto.id).map(al => al.id);
          const diarias = this.diariasFiltradas().filter(
            (a) => alocIds.includes(a.alocacaoId) && a.data === dateStr,
          );
          return { posto, cliente: cliente!, diarias };
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

  monthData = computed((): DayCell[] => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells: DayCell[] = [];

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

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = this.formatDateToISO(cellDate);
      const diarias = this.diariasFiltradas().filter((a) => a.data === dateStr);
      cells.push({ date: cellDate, dateStr, isCurrentMonth: true, diarias });
    }

    const remainingCells = 42 - cells.length;
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

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  previousPeriod(): void {
    const date = this.currentDate();
    const mode = this.viewMode();
    if (mode === 'weekly') date.setDate(date.getDate() - 7);
    else if (mode === 'monthly') date.setMonth(date.getMonth() - 1);
    this.currentDate.set(new Date(date));
  }

  nextPeriod(): void {
    const date = this.currentDate();
    const mode = this.viewMode();
    if (mode === 'weekly') date.setDate(date.getDate() + 7);
    else if (mode === 'monthly') date.setMonth(date.getMonth() + 1);
    this.currentDate.set(new Date(date));
  }

  today(): void {
    this.currentDate.set(new Date());
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

  // ── Color helpers ───────────────────────────────────────────────────────────

  getFuncionarioLegendaIndex(funcionarioId: string): number {
    return this.funcionariosLegenda().findIndex((item) => item.funcionario.id === funcionarioId);
  }

  getFuncionarioNumber(funcionarioId: string): number {
    const item = this.funcionariosLegenda().find((f) => f.funcionario.id === funcionarioId);
    return item?.number || 0;
  }

  getDiariaMonthlyClass(diaria: Diaria): string {
    if (diaria.statusDiaria === 'FALTA_REGISTRADA') return 'emp-falta';
    if (diaria.statusDiaria === 'CANCELADA') return 'emp-cancelada';
    if (diaria.tipoDiaria === 'SUBSTITUICAO') return 'emp-substituicao';
    const index = this.getFuncionarioLegendaIndex(diaria.funcionarioId);
    return `emp-color-${index % 12}`;
  }

  getLegendColorClass(funcionarioId: string): string {
    const index = this.getFuncionarioLegendaIndex(funcionarioId);
    return `emp-color-${index % 12}`;
  }

  // ── Lookup helpers ──────────────────────────────────────────────────────────

  getFuncionarioNome(funcionarioId: string): string {
    return this.funcionarios().find((f) => f.id === funcionarioId)?.nome || 'N/A';
  }

  getPostoNome(alocacaoId: string): string {
    const alocacao = this.alocacoes().find((a) => a.id === alocacaoId);
    if (!alocacao) return 'N/A';
    const posto = this.postos().find((p) => p.id === alocacao.postoId);
    if (!posto) return 'N/A';
    return `${posto.nome} - ${posto.cidade}`;
  }

  getClienteNome(alocacaoId: string): string {
    const alocacao = this.alocacoes().find((a) => a.id === alocacaoId);
    if (!alocacao) return 'N/A';
    const posto = this.postos().find((p) => p.id === alocacao.postoId);
    if (!posto) return 'N/A';
    return this.clientes().find((c) => c.id === posto.clienteId)?.nome || 'N/A';
  }

  // ── Label / badge-class helpers ─────────────────────────────────────────────

  getStatusLabel(status: StatusDiaria): string {
    const labels: Record<StatusDiaria, string> = {
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
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
      DOBRA_PROGRAMADA: 'Dobra',
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

  // ── Date utilities ──────────────────────────────────────────────────────────

  formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  getDayCellClasses(cell: DayCell): Record<string, boolean> {
    return {
      'other-month': !cell.isCurrentMonth,
      ...this.feriadosService.getDayCellClasses(cell.date, cell.dateStr),
    };
  }

  getFeriadoNome(dateStr: string): string | null {
    return this.feriadosService.getFeriadoNome(dateStr);
  }
}
