import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ContratoListComponent } from './contrato-list.component';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { DiariaService } from '../../../services/diaria.service';
import { ContratoFinanceiroUiService } from '../../../services/contrato-financeiro-ui.service';
import {
  Contrato,
  Cliente,
  Funcionario,
  StatusFuncionario,
  StatusContrato,
  TipoEscala,
  TipoFuncionario,
} from '../../../models/index';

describe('ContratoListComponent', () => {
  let component: ContratoListComponent;
  let fixture: ComponentFixture<ContratoListComponent>;
  let mockContratoService: any;
  let mockClienteService: any;
  let mockFuncionarioService: any;
  let mockDiariaService: any;
  let mockFinanceiroUiService: any;
  let mockRouter: any;

  const mockContratos: Contrato[] = [
    {
      id: 'contrato1',
      clienteId: 'cliente1',
      descricao: 'Contrato 1',
      valorTotalMensal: 10000,
      valorDiariaCobrada: 100,
      percentualAdicionalNoturno: 0.2,
      percentualAdicionalFimSemana: 0.1,
      valorBeneficiosExtrasMensal: 350,
      percentualEncargosProvisoes: 0.5,
      quantidadeFuncionarios: 2,
      numeroDePostos: 1,
      margemLucroPercentual: 0.2,
      margemCoberturaFaltasPercentual: 0.1,
      status: StatusContrato.ATIVO,
      dataInicio: '2026-01-01',
      dataFim: '2026-12-31',
      tags: []
    },
  ];

  beforeEach(async () => {
    mockContratoService = {
      getAll: vi.fn(() => of(mockContratos)),
      delete: vi.fn(() => of(undefined)),
    };
    mockClienteService = {
      getAll: vi.fn(() => of([])),
    };
    mockFuncionarioService = {
      getAll: vi.fn(() => of([])),
    };
    mockDiariaService = {
      getAll: vi.fn(() => of([])),
      getResumoFinanceiroByContrato: vi.fn(() => of(null)),
    };
    mockFinanceiroUiService = {
      carregarCalculosDetalhados$: vi.fn(() => of(new Map())),
      getFaturamentoDetalhado: vi.fn(),
      getCustoDetalhado: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ContratoListComponent],
      providers: [
        { provide: ContratoService, useValue: mockContratoService },
        { provide: ClienteService, useValue: mockClienteService },
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: DiariaService, useValue: mockDiariaService },
        { provide: ContratoFinanceiroUiService, useValue: mockFinanceiroUiService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContratoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load contracts on init', () => {
    expect(mockContratoService.getAll).toHaveBeenCalled();
    expect(component.contratos().length).toBe(1);
  });

  it('should call delete service when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    component.confirmDelete('contrato1', 'Contrato 1');
    await fixture.whenStable();
    
    expect(mockContratoService.delete).toHaveBeenCalledWith('contrato1');
  });
});
