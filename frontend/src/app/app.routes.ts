import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'condominios',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/condominios/condominio-list/condominio-list.component').then(
            (m) => m.CondominioListComponent
          ),
      },
      {
        path: 'novo',
        loadComponent: () =>
          import('./features/condominios/condominio-form/condominio-form.component').then(
            (m) => m.CondominioFormComponent
          ),
      },
      {
        path: 'criar-completo',
        loadComponent: () =>
          import('./features/condominios/condominio-wizard/condominio-wizard.component').then(
            (m) => m.CondominioWizardComponent
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./features/condominios/condominio-form/condominio-form.component').then(
            (m) => m.CondominioFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/condominios/condominio-detail/condominio-detail.component').then(
            (m) => m.CondominioDetailComponent
          ),
      },
    ],
  },
  {
    path: 'contratos',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/contratos/contrato-list/contrato-list.component').then(
            (m) => m.ContratoListComponent
          ),
      },
      {
        path: 'novo',
        loadComponent: () =>
          import('./features/contratos/contrato-form/contrato-form.component').then(
            (m) => m.ContratoFormComponent
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./features/contratos/contrato-form/contrato-form.component').then(
            (m) => m.ContratoFormComponent
          ),
      },
    ],
  },
  {
    path: 'funcionarios',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/funcionarios/funcionario-list/funcionario-list.component').then(
            (m) => m.FuncionarioListComponent
          ),
      },
      {
        path: 'novo',
        loadComponent: () =>
          import('./features/funcionarios/funcionario-form/funcionario-form.component').then(
            (m) => m.FuncionarioFormComponent
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./features/funcionarios/funcionario-form/funcionario-form.component').then(
            (m) => m.FuncionarioFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/funcionarios/funcionario-detail/funcionario-detail.component').then(
            (m) => m.FuncionarioDetailComponent
          ),
      },
    ],
  },
  {
    path: 'postos',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/postos/posto-list/posto-list.component').then((m) => m.PostoListComponent),
      },
      {
        path: 'novo',
        loadComponent: () =>
          import('./features/postos/posto-form/posto-form.component').then((m) => m.PostoFormComponent),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./features/postos/posto-form/posto-form.component').then((m) => m.PostoFormComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/postos/posto-detail/posto-detail.component').then(
            (m) => m.PostoDetailComponent
          ),
      },
    ],
  },
  {
    path: 'alocacoes',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/alocacoes/alocacao-list/alocacao-list.component').then(
            (m) => m.AlocacaoListComponent
          ),
      },
      {
        path: 'novo',
        loadComponent: () =>
          import('./features/alocacoes/alocacao-form/alocacao-form.component').then((m) => m.AlocacaoFormComponent),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./features/alocacoes/alocacao-form/alocacao-form.component').then((m) => m.AlocacaoFormComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/alocacoes/alocacao-detail/alocacao-detail.component').then(
            (m) => m.AlocacaoDetailComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
