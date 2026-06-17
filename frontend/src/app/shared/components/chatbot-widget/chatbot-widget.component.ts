import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container" [class.open]="isOpen()">
      <!-- Chat Window -->
      @if (isOpen()) {
        <div class="chat-window">
          <div class="chat-header">
            <div class="header-info">
              <span class="bot-avatar">👩‍💼</span>
              <div>
                <h4>Joseane (Assistente)</h4>
                <p>Online</p>
              </div>
            </div>
            <button class="close-btn" (click)="toggleChat()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div class="chat-messages" #scrollContainer>
            @for (msg of messages(); track $index) {
              <div class="message-wrapper" [class.user]="msg.sender === 'user'">
                <div class="message-bubble">
                  {{ msg.text }}
                </div>
                <span class="timestamp">{{ msg.timestamp | date:'HH:mm' }}</span>
              </div>
            }
            @if (messages().length === 1 && !isLoading()) {
              <div class="quick-actions">
                <button *ngFor="let q of defaultQuestions" (click)="sendQuickAction(q)">
                  {{ q }}
                </button>
              </div>
            }
            @if (isLoading()) {
              <div class="message-wrapper bot">
                <div class="message-bubble loading">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
              </div>
            }
          </div>
          
          <div class="chat-input-area">
            <input 
              type="text" 
              [(ngModel)]="newMessage" 
              (keyup.enter)="sendMessage()"
              placeholder="Digite sua mensagem..."
              [disabled]="isLoading()"
            />
            <button class="send-btn" (click)="sendMessage()" [disabled]="!newMessage.trim() || isLoading()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      }

      <!-- Floating Toggle Button -->
      @if (!isOpen()) {
        <button class="chatbot-toggle" (click)="toggleChat()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      z-index: 9999;
    }

    .chatbot-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      svg { width: 28px; height: 28px; }

      &:hover {
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
      }
    }

    .chat-window {
      width: 350px;
      height: 500px;
      max-height: calc(100vh - 40px);
      background: var(--surface-card);
      border-radius: var(--radius-lg);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      border: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chat-header {
      padding: var(--space-4);
      background: var(--primary-color);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-info {
        display: flex;
        align-items: center;
        gap: var(--space-3);

        .bot-avatar {
          font-size: 24px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          padding: 4px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        h4 { margin: 0; font-size: var(--text-base); font-weight: var(--fw-semibold); }
        p { margin: 0; font-size: var(--text-xs); opacity: 0.8; }
      }

      .close-btn {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: var(--space-2);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;

        svg { width: 20px; height: 20px; }

        &:hover { background: rgba(255,255,255,0.1); }
      }
    }

    .chat-messages {
      flex: 1;
      padding: var(--space-4);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      background: var(--bg-primary);

      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
    }

    .message-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      max-width: 85%;

      &.user {
        align-self: flex-end;
        align-items: flex-end;
        
        .message-bubble {
          background: var(--primary-color);
          color: white;
          border-bottom-right-radius: 4px;
        }
      }

      &:not(.user) .message-bubble {
        background: var(--surface-muted);
        color: var(--text-primary);
        border-bottom-left-radius: 4px;
      }
    }

    .message-bubble {
      padding: var(--space-2) var(--space-3);
      border-radius: 12px;
      font-size: var(--text-sm);
      line-height: 1.4;
      word-break: break-word;
    }

    .timestamp {
      font-size: 10px;
      color: var(--text-secondary);
      margin-top: 4px;
      padding: 0 4px;
    }

    .chat-input-area {
      padding: var(--space-3);
      background: var(--surface-card);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      gap: var(--space-2);

      input {
        flex: 1;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--border-subtle);
        border-radius: 20px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: var(--text-sm);
        outline: none;
        transition: border-color 0.2s;

        &:focus { border-color: var(--primary-color); }
        &:disabled { opacity: 0.7; cursor: not-allowed; }
      }

      .send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s;

        svg { width: 18px; height: 18px; transform: translateX(-1px) translateY(1px); }

        &:hover:not(:disabled) { transform: scale(1.05); }
        &:disabled { background: var(--border-strong); cursor: not-allowed; opacity: 0.7; }
      }
    }

    .loading {
      display: flex;
      gap: 4px;
      padding: 12px 16px;

      .dot {
        width: 6px;
        height: 6px;
        background: var(--text-secondary);
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;

        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
      }
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-2);
      padding: 0 var(--space-2);
      align-items: flex-end;

      button {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        padding: var(--space-2) var(--space-3);
        border-radius: 12px;
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: right;

        &:hover {
          background: var(--primary-color);
          color: white;
        }
      }
    }

    @media (max-width: 480px) {
      .chatbot-container {
        bottom: var(--space-4);
        right: var(--space-4);
      }
      
      .chat-window {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
        position: fixed;
        bottom: 16px;
        right: 16px;
      }
    }
  `]
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  private chatbotService = inject(ChatbotService);
  
  isOpen = signal(false);
  isLoading = signal(false);
  messages = signal<ChatMessage[]>([
    { text: 'Olá! Meu nome é Joseane, sou a assistente virtual do InterceptorSystem. Como posso ajudar você hoje?', sender: 'bot', timestamp: new Date() }
  ]);
  
  defaultQuestions = [
    'Quais as regras para escala e diárias?',
    'Como funciona o faturamento de contratos?',
    'Como faço para registrar uma substituição?',
    'Contratos vencidos fecham automaticamente?'
  ];

  newMessage = '';
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  toggleChat() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendQuickAction(question: string) {
    this.newMessage = question;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isLoading()) return;

    const userMsg = this.newMessage.trim();
    this.newMessage = '';
    
    // Add user message
    this.messages.update(msgs => [...msgs, { text: userMsg, sender: 'user', timestamp: new Date() }]);
    this.isLoading.set(true);
    
    this.scrollToBottom();

    // Call service
    this.chatbotService.sendMessage(userMsg).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, { text: res.reply, sender: 'bot', timestamp: new Date() }]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Chat error:', err);
        this.messages.update(msgs => [...msgs, { text: 'Desculpe, ocorreu um erro ao conectar ao serviço de IA.', sender: 'bot', timestamp: new Date() }]);
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
