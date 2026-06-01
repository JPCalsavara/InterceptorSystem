import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotWidgetComponent } from './shared/components/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatbotWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
