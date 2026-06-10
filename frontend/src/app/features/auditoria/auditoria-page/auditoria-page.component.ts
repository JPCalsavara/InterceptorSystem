import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiariaService } from '../../../services/diaria.service';
import { WhatsappSessoesService, SessaoWhatsappDto } from '../../../services/whatsapp-sessoes.service';
import { DiariaSubstituicaoDto } from '../../../models';

@Component({
  selector: 'app-auditoria-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auditoria-container">
      <header class="auditoria-header">
        <h1>Auditoria e Histórico</h1>
        <p>Acompanhe o histórico de trocas de funcionários e as interações do chatbot no WhatsApp.</p>
      </header>

      <div class="tabs">
        <button [class.active]="activeTab() === 'trocas'" (click)="activeTab.set('trocas')">
          Trocas de Diárias
        </button>
        <button [class.active]="activeTab() === 'whatsapp'" (click)="activeTab.set('whatsapp')">
          Sessões WhatsApp
        </button>
      </div>

      <div class="tab-content" *ngIf="activeTab() === 'trocas'">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data Modificação</th>
                <th>Posto</th>
                <th>Origem</th>
                <th>Substituído</th>
                <th>Substituto</th>
              </tr>
            </thead>
            <tbody>
              @for (sub of substituicoes(); track sub.novaDiariaId) {
                <tr>
                  <td>{{ sub.dataHoraModificacao | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ sub.postoNome }}</td>
                  <td>
                    <span class="badge" [class.badge-bot]="sub.origemModificacao === 'WhatsappBot'">
                      {{ sub.origemModificacao }}
                    </span>
                  </td>
                  <td>{{ sub.funcionarioOriginalNome || '-' }}</td>
                  <td>{{ sub.funcionarioSubstitutoNome }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-state">Nenhuma troca registrada.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="tab-content" *ngIf="activeTab() === 'whatsapp'">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Criado Em</th>
                <th>Telefone</th>
                <th>Estado da Conversa</th>
                <th>Última Atividade</th>
              </tr>
            </thead>
            <tbody>
              @for (sessao of sessoesWhatsapp(); track sessao.id) {
                <tr>
                  <td>{{ sessao.criadoEm | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ sessao.telefone }}</td>
                  <td>
                    <span class="badge state-badge">
                      {{ mapEstadoConversa(sessao.estado) }}
                    </span>
                  </td>
                  <td>{{ sessao.ultimaAtividade | date:'dd/MM/yyyy HH:mm' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="empty-state">Nenhuma sessão registrada.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auditoria-container {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .auditoria-header {
      margin-bottom: var(--space-6);
    }

    .auditoria-header h1 {
      font-size: var(--text-2xl);
      font-weight: var(--fw-bold);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }

    .auditoria-header p {
      color: var(--text-secondary);
    }

    .tabs {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: var(--space-2);
    }

    .tabs button {
      background: none;
      border: none;
      padding: var(--space-2) var(--space-4);
      font-weight: var(--fw-medium);
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
    }

    .tabs button:hover {
      background: var(--bg-hover);
    }

    .tabs button.active {
      color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }

    .table-container {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .data-table th {
      padding: var(--space-3) var(--space-4);
      font-weight: var(--fw-semibold);
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-hover);
      font-size: var(--text-sm);
    }

    .data-table td {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: var(--text-xs);
      font-weight: var(--fw-medium);
      background: var(--bg-hover);
      color: var(--text-secondary);
    }

    .badge-bot {
      background: color-mix(in srgb, var(--success-color) 10%, transparent);
      color: var(--success-color);
    }

    .state-badge {
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      color: var(--primary-color);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-6) !important;
      color: var(--text-tertiary) !important;
    }
  `]
})
export class AuditoriaPageComponent implements OnInit {
  private diariaService = inject(DiariaService);
  private whatsappService = inject(WhatsappSessoesService);

  activeTab = signal<'trocas' | 'whatsapp'>('trocas');
  substituicoes = signal<DiariaSubstituicaoDto[]>([]);
  sessoesWhatsapp = signal<SessaoWhatsappDto[]>([]);

  ngOnInit() {
    this.loadSubstituicoes();
    this.loadSessoesWhatsapp();
  }

  loadSubstituicoes() {
    this.diariaService.getSubstituicoes().subscribe({
      next: (data) => this.substituicoes.set(data),
      error: (err) => console.error('Erro ao carregar substituições', err)
    });
  }

  loadSessoesWhatsapp() {
    this.whatsappService.getAll().subscribe({
      next: (data) => this.sessoesWhatsapp.set(data),
      error: (err) => console.error('Erro ao carregar sessões do WhatsApp', err)
    });
  }

  mapEstadoConversa(estado: number): string {
    const estados: Record<number, string> = {
      0: 'Aguardando Data',
      1: 'Aguardando Posto',
      2: 'Aguardando Cliente',
      3: 'Aguardando Funcionário',
      4: 'Concluída'
    };
    return estados[estado] || 'Desconhecido';
  }
}
