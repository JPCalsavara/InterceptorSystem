import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-card-container">
      <div class="content-wrapper">
        <h3 class="title">{{ title }}</h3>
        <p class="description">{{ description }}</p>
      </div>
      <div class="action-wrapper">
        <button class="btn-primary" (click)="onAction.emit()">{{ buttonText }}</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .action-card-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      /* Usamos variáveis CSS (Tokens) para suportar Dark Mode e temas */
      background-color: var(--surface-color, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e0e0e0);
      /* Transição suave de interações premium */
      transition: all 0.3s ease;
      gap: 1rem;
    }

    .action-card-container:hover {
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .title {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-primary, #333);
      font-weight: 600;
    }

    .description {
      margin: 0;
      color: var(--text-secondary, #666);
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .action-wrapper {
      display: flex;
      align-items: center;
    }

    .btn-primary {
      background-color: var(--primary-color, #2563eb);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary:hover {
      background-color: var(--primary-hover, #1d4ed8);
    }

    /* O SEGREDO DO RESPONSIVO - MOBILE (320px ~ 600px) */
    @media (max-width: 600px) {
      .action-card-container {
        /* Quebra a linha e empilha verticalmente */
        flex-direction: column;
        align-items: stretch;
      }
      
      .action-wrapper {
        width: 100%;
        margin-top: 0.5rem;
      }

      .btn-primary {
        /* Estica o botão para ficar gordo, fácil de apertar com o dedo */
        width: 100%; 
      }
    }
  `]
})
export class ActionCardComponent {
  @Input() title: string = 'Card Title';
  @Input() description: string = 'Card description goes here.';
  @Input() buttonText: string = 'Ação';
  
  @Output() onAction = new EventEmitter<void>();
}
