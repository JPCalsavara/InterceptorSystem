import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.scss',
})
export class PerfilPageComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  getInitials(): string {
    const nome = this.user()?.nomeEmpresa || 'Empresa';
    return nome
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
