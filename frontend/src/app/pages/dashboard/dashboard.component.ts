import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  stats?: {
    label: string;
    value: number | string;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  cards: DashboardCard[] = [
    {
      title: 'Condomínios',
      description: 'Gerenciar condomínios cadastrados',
      icon: '🏢',
      route: '/condominios',
      color: '#2196F3',
      stats: { label: 'Ativos', value: '-' },
    },
    {
      title: 'Funcionários',
      description: 'Gerenciar vigilantes e porteiros',
      icon: '👥',
      route: '/funcionarios',
      color: '#4CAF50',
      stats: { label: 'Ativos', value: '-' },
    },
    {
      title: 'Postos de Trabalho',
      description: 'Gerenciar postos e turnos',
      icon: '📍',
      route: '/postos',
      color: '#FF9800',
      stats: { label: 'Cadastrados', value: '-' },
    },
    {
      title: 'Alocações',
      description: 'Escala semanal e mensal',
      icon: '📅',
      route: '/alocacoes',
      color: '#9C27B0',
      stats: { label: 'Esta semana', value: '-' },
    },
    {
      title: 'Contratos',
      description: 'Gerenciar contratos ativos',
      icon: '📄',
      route: '/contratos',
      color: '#F44336',
      stats: { label: 'Vigentes', value: '-' },
    },
  ];
}
