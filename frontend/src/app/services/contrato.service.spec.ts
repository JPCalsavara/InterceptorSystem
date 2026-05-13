import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContratoService } from './contrato.service';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';
import { Contrato, StatusContrato } from '../models/index';

describe('ContratoService', () => {
  let service: ContratoService;
  let httpMock: HttpTestingController;

  const apiBase = 'http://localhost';
  const mockContratos: Contrato[] = [
    {
      id: 'ct1',
      clienteId: 'c1',
      descricao: 'Contrato de segurança predial',
      valorDiariaCobrada: 100,
      percentualAdicionalNoturno: 0.2,
      percentualAdicionalFimSemana: 0.1,
      valorBeneficiosExtrasMensal: 350,
      percentualEncargosProvisoes: 0.15,
      numeroDePostos: 2,
      quantidadeFuncionarios: 2,
      margemLucroPercentual: 0.15,
      margemCoberturaFaltasPercentual: 0.1,
      dataInicio: '2026-01-01',
      dataFim: '2026-12-31',
      status: StatusContrato.ATIVO,
      valorTotalMensal: 10000,
      tags: [],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContratoService,
        EntityCacheCoordinatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ContratoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reutiliza cache em getAll sem nova HTTP call', () => {
    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectOne(`${apiBase}/api/contratos`).flush(mockContratos);

    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectNone(`${apiBase}/api/contratos`);
  });

  it('invalida cache após create e refaz getAll', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos`).flush(mockContratos);

    service.create({ clienteId: 'c1', descricao: 'Novo Contrato' } as any).subscribe();

    const createReq = httpMock.expectOne(`${apiBase}/api/contratos`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockContratos[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos`).flush(mockContratos);
  });

  it('invalida cache após update', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos`).flush(mockContratos);

    service.update('ct1', { descricao: 'Contrato Atualizado' } as any).subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos/ct1`).flush(mockContratos[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos`).flush(mockContratos);
  });

  it('chama invalidateAll após delete', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos`).flush(mockContratos);

    service.delete('ct1').subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos/ct1`).flush(null);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/contratos`).flush(mockContratos);
  });

  it('getByClienteId usa endpoint scoped por clienteId', () => {
    service.getByClienteId('c1').subscribe((data) => expect(data.length).toBe(1));

    const req = httpMock.expectOne(`${apiBase}/api/clientes/c1/contratos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockContratos);
  });

  it('calcularValorTotal envia POST para endpoint de cálculos', () => {
    const payload = { valorDiariaCobrada: 100, quantidadeFuncionarios: 2 };
    const mockResult = { valorTotalMensal: 6000 };

    service.calcularValorTotal(payload).subscribe((result) => {
      expect(result.valorTotalMensal).toBe(6000);
    });

    const req = httpMock.expectOne(`${apiBase}/api/contratos/calculos/calcular-valor-total`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResult);
  });
});
