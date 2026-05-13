import { ComponentFixture, TestBed } from '@angular/core/testing';
import { screen } from '@testing-library/angular';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ContratoDetailComponent } from './contrato-detail.component';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { DiariaService } from '../../../services/diaria.service';
import { StatusContrato, StatusFuncionario } from '../../../models/index';

describe('ContratoDetailComponent', () => {
  let component: ContratoDetailComponent;
  let fixture: ComponentFixture<ContratoDetailComponent>;
  let mockContratoService: any;
  let mockCalculoService: any;
  let mockClienteService: any;
  let mockFuncionarioService: any;
  let mockPostoService: any;
  let mockAlocacaoService: any;
  let mockDiariaService: any;
  let mockActivatedRoute: any;

  const mockContrato = {
      id: 'contrato-1',
      clienteId: 'cliente-1',
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
  };

  const mockCliente = {
    id: 'cliente-1',
    nome: 'Cliente Teste',
    cnpj: '12345678901234',
    cidade: 'São Paulo',
    estado: 'SP',
    ativo: true
  };

  const mockFuncionarios = [
    { id: 'func-1', nome: 'Funcionário 1', clienteId: 'cliente-1', contratoId: 'contrato-1', cpf: '1', celular: '1', statusFuncionario: StatusFuncionario.ATIVO, tipoFuncionario: 'Vigilante' },
  ];

  beforeEach(async () => {
    mockContratoService = {
      getById: vi.fn(() => of(mockContrato)),
      delete: vi.fn(() => of(undefined)),
    };
    mockCalculoService = {
      calcularValorTotal: vi.fn(() => of({})),
      simularSemAlocacoes: vi.fn(() => of({})),
    };
    mockClienteService = {
      getById: vi.fn(() => of(mockCliente)),
    };
    mockFuncionarioService = {
      getByClienteId: vi.fn(() => of(mockFuncionarios)),
    };
    mockPostoService = {
      getByClienteId: vi.fn(() => of([])),
    };
    mockAlocacaoService = {
      getByContratoId: vi.fn(() => of([])),
    };
    mockDiariaService = {
      getResumoFinanceiroByContrato: vi.fn(() => of(null)),
    };
    
    mockActivatedRoute = {
      params: of({ id: 'contrato-1' }),
      snapshot: { paramMap: { get: () => 'contrato-1' } }
    };

    await TestBed.configureTestingModule({
      imports: [ContratoDetailComponent],
      providers: [
        { provide: ContratoService, useValue: mockContratoService },
        { provide: ContratoCalculoService, useValue: mockCalculoService },
        { provide: ClienteService, useValue: mockClienteService },
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: PostoService, useValue: mockPostoService },
        { provide: AlocacaoService, useValue: mockAlocacaoService },
        { provide: DiariaService, useValue: mockDiariaService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContratoDetailComponent);
    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', async () => {
    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    // Use getAllByText for duplicated text (breadcrumb + title)
    expect(screen.getAllByText(/Contrato 1/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Cliente Teste/)).toBeTruthy();
  });

  it('should handle error if contrato not found', async () => {
    mockContratoService.getById.mockReturnValue(throwError(() => new Error('Not Found')));

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.loading()).toBeFalsy();
  });
});
