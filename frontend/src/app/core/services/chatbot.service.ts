import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatbotRequest {
  phone_number: string;
  tenant_id: string;
  message: string;
}

export interface ChatbotResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/support';

  sendMessage(message: string): Observable<ChatbotResponse> {
    const payload: ChatbotRequest = {
      phone_number: 'WEB_USER',
      tenant_id: 'default',
      message: message
    };
    return this.http.post<ChatbotResponse>(this.apiUrl, payload);
  }
}
