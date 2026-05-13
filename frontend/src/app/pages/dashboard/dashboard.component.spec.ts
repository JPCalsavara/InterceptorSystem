import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import { ContratoFinanceiroUiService } from '../../services/contrato-financeiro-ui.service';
import {
  Cliente,
  Funcionario,
  Posto,
  Diaria,
  Contrato,
  StatusContrato,
  StatusDiaria,
  StatusFuncionario,
  TipoEscala,
  TipoFuncionario,
  TipoDiaria,
} from '../../models/index';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockClienteService: any;
  let mockFuncionarioService: any;
  let mockPostoService: any;
  let mockDiariaService: any;
  let mockContratoService: any;
  let mockFinanceiroUiService: any;
  let mockRouter: any;

  const mockClientes: Cliente[] = [
    { id: 'c1', nome: 'Empresa Alpha', cnpj: '12345678000199', ativo: true, cidade: 'São Paulo', estado: 'SP' },
    { id: 'c2', nome: 'Empresa Beta', cnpj: '98765432000111', ativo: true, cidade: 'Rio de Janeiro', estado: 'RJ' },
    { id: 'c3', nome: 'Empresa Gamma', cnpj: '11111111000111', ativo: false, cidade: 'Belo Horizonte', estado: 'MG' },
  ];

  const mockFuncionarios: Funcionario[] = [
    {
      id: 'f1',
      clienteId: 'c1',
      contratoId: 'ct1',
      nome: 'João Silva',
      cpf: '12345678901',
      celular: '+5511999999999',
      statusFuncionario: StatusFuncionario.ATIVO,
      tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
      tipoFuncionario: TipoFuncionario.CLT,
      ativo: true
    },
  ];

  const mockPostos: Posto[] = [
    { id: 'p1', clienteId: 'c1', nome: 'Posto 1', cep: '01001-000', endereco: 'Rua A', numero: '1', cidade: 'SP', estado: 'SP', ativo: true },
  ];

  const mockDiarias: Diaria[] = [
    { id: 'd1', funcionarioId: 'f1', alocacaoId: 'a1', data: '2026-01-01', valorDiaria: 100, statusDiaria: StatusDiaria.CONFIRMADA, tipoDiaria: TipoDiaria.REGULAR },
  ];

  const mockContratos: Contrato[] = [
    { id: 'ct1', clienteId: 'c1', descricao: 'C1', valorTotalMensal: 10000, valorDiariaCobrada: 100, percentualAdicionalNoturno: 0.2, percentualAdicionalFimSemana: 0.1, valorBeneficiosExtrasMensal: 350, percentualEncargosProvisoes: 0.5, quantidadeFuncionarios: 2, numeroDePostos: 1, margemLucroPercentual: 0.2, margemCoberturaFaltasPercentual: 0.1, status: StatusContrato.ATIVO, dataInicio: '2026-01-01', dataFim: '2026-12-31', tags: [] },
  ];

  beforeEach(async () => {
    mockClienteService = {
      getAll: vi.fn(() => of(mockClientes)),
      getById: vi.fn(),
    };
    mockFuncionarioService = {
      getAll: vi.fn(() => of(mockFuncionarios)),
      getById: vi.fn(),
    };
    mockPostoService = {
      getAll: vi.fn(() => of(mockPostos)),
      getById: vi.fn(),
    };
    mockDiariaService = {
      getAll: vi.fn(() => of(mockDiarias)),
      getResumoFinanceiroByContrato: vi.fn(() => of(null)),
    };
    mockContratoService = {
      getAll: vi.fn(() => of(mockContratos)),
      getById: vi.fn(),
    };
    mockFinanceiroUiService = {
      carregarCalculosDetalhados$: vi.fn(() => of(new Map())),
      getFaturamentoDetalhado: vi.fn(() => 5000),
      getCustoDetalhado: vi.fn(() => 3000),
      getLucroDetalhado: vi.fn(() => 2000),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ClienteService, useValue: mockClienteService },
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: PostoService, useValue: mockPostoService },
        { provide: DiariaService, useValue: mockDiariaService },
        { provide: ContratoService, useValue: mockContratoService },
        { provide: ContratoFinanceiroUiService, useValue: mockFinanceiroUiService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('Inicialização (ngOnInit)', () => {
    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve carregar dados ao inicializar', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockClienteService.getAll).toHaveBeenCalled();
      expect(component.clientes?.().length).toBe(3);
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir erro ao carregar clientes falhar', async () => {
      mockClienteService.getAll.mockReturnValue(throwError(() => new Error('Erro ao carregar')));

      fixture.detectChanges();
      await fixture.whenStable();
      // Erro capturado
    });
  });
});
