import { Component, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeriadosService } from '../../../services/feriados.service';
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
  selector: 'app-alocacoes-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './alocacoes-view.component.html',
  styleUrl: './alocacoes-view.component.scss',
})
export class AlocacoesViewComponent {
  private feriadosService = inject(FeriadosService);

  readonly alocacoes = input<Alocacao[]>([]);
  readonly funcionarios = input<Funcionario[]>([]);
  readonly postos = input<PostoDeTrabalho[]>([]);
  readonly condominios = input<Condominio[]>([]);

  viewMode = signal<ViewMode>('monthly');
  filtroStatus = signal<string>('');
  currentDate = signal<Date>(new Date());

  alocacoesFiltradas = computed(() => {
    let result = this.alocacoes();
    const status = this.filtroStatus();
    if (status) result = result.filter((a) => a.statusAlocacao === status);
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
          const condominio = this.condominios().find((c) => c.id === posto.condominioId);
          const alocacoes = this.alocacoesFiltradas().filter(
            (a) => a.postoDeTrabalhoId === posto.id && a.data === dateStr,
          );
          return { posto, condominio: condominio!, alocacoes };
        })
        .filter((item) => item.condominio && item.alocacoes.length > 0);

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
        alocacoes: [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = this.formatDateToISO(cellDate);
      const alocacoes = this.alocacoesFiltradas().filter((a) => a.data === dateStr);
      cells.push({ date: cellDate, dateStr, isCurrentMonth: true, alocacoes });
    }

    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      const cellDate = new Date(year, month + 1, day);
      cells.push({
        date: cellDate,
        dateStr: this.formatDateToISO(cellDate),
        isCurrentMonth: false,
        alocacoes: [],
      });
    }

    return cells;
  });

  funcionariosLegenda = computed(() => {
    const funcionariosUsados = new Map<string, { funcionario: Funcionario; number: number }>();
    let counter = 1;

    this.alocacoesFiltradas().forEach((alocacao) => {
      if (!funcionariosUsados.has(alocacao.funcionarioId)) {
        const funcionario = this.funcionarios().find((f) => f.id === alocacao.funcionarioId);
        if (funcionario) {
          funcionariosUsados.set(alocacao.funcionarioId, { funcionario, number: counter++ });
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

  getAlocacaoMonthlyClass(alocacao: Alocacao): string {
    if (alocacao.statusAlocacao === 'FALTA_REGISTRADA') return 'emp-falta';
    if (alocacao.statusAlocacao === 'CANCELADA') return 'emp-cancelada';
    if (alocacao.tipoAlocacao === 'SUBSTITUICAO') return 'emp-substituicao';
    const index = this.getFuncionarioLegendaIndex(alocacao.funcionarioId);
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

  getPostoHorario(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'N/A';
    return `${posto.horarioInicio.substring(0, 5)} - ${posto.horarioFim.substring(0, 5)}`;
  }

  getCondominioNome(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'N/A';
    return this.condominios().find((c) => c.id === posto.condominioId)?.nome || 'N/A';
  }

  // ── Label / badge-class helpers ─────────────────────────────────────────────

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
