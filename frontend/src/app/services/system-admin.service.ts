import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TenantInfoItemDto {
  id: string;
  nomeEmpresa: string;
  email: string;
  plano: string;
  createdAt: string;
  faturamentoEstimado: number;
  totalClientes: number;
  totalFuncionarios: number;
}

export interface SystemDashboardDto {
  totalTenants: number;
  totalClientes: number;
  totalFuncionarios: number;
  totalPostos: number;
  faturamentoTotal: number;
  mediaClientesPorTenant: number;
  mediaFuncionariosPorTenant: number;
  mediaPostosPorTenant: number;
  tenantsAtivos: number;
  tenantsInativos: number;
  topTenantsPorFaturamento: TenantInfoItemDto[];
  tenantsMaisAntigos: TenantInfoItemDto[];
  tenantsMaisRecentes: TenantInfoItemDto[];
}

@Injectable({
  providedIn: 'root'
})
export class SystemAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/system-admin`;

  getDashboardMetrics(): Observable<SystemDashboardDto> {
    return this.http.get<SystemDashboardDto>(`${this.apiUrl}/dashboard`);
  }
}
