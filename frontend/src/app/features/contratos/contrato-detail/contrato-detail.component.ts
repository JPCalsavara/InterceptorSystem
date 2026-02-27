import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { CondominioService } from '../../../services/condominio.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { Contrato, PostoDeTrabalho, StatusContrato } from '../../../models/index';

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

  contrato = signal<Contrato | null>(null);
  postos = signal<PostoDeTrabalho[]>([]);
  condominioNome = signal<string>('');
  loading = signal(true);
  erro = signal<string | null>(null);

  StatusContrato = StatusContrato;

  lucro = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    const impostos = c.valorTotalMensal * (c.percentualImpostos / 100);
    return c.valorTotalMensal - impostos - c.valorBeneficiosExtrasMensal;
  });

  impostosMensal = computed(() => {
    const c = this.contrato();
    if (!c) return 0;
    return c.valorTotalMensal * (c.percentualImpostos / 100);
  });

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
