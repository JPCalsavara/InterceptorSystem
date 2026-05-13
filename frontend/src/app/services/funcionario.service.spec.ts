import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FuncionarioService } from './funcionario.service';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';
import { Funcionario, StatusFuncionario, TipoFuncionario, TipoEscala } from '../models/index';

describe('FuncionarioService', () => {
  let service: FuncionarioService;
  let httpMock: HttpTestingController;

  const apiBase = 'http://localhost';
  const mockFuncionarios: Funcionario[] = [
    {
      id: 'f1',
      clienteId: 'c1',
      contratoId: 'ct1',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      celular: '11999999999',
      tipoFuncionario: TipoFuncionario.CLT,
      tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
      statusFuncionario: StatusFuncionario.ATIVO,
      ativo: true,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FuncionarioService,
        EntityCacheCoordinatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(FuncionarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reutiliza cache em getAll sem nova HTTP call', () => {
    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectOne(`${apiBase}/api/funcionarios`).flush(mockFuncionarios);

    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectNone(`${apiBase}/api/funcionarios`);
  });

  it('invalida cache após create e refaz getAll', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios`).flush(mockFuncionarios);

    service.create({ clienteId: 'c1', nome: 'Maria', cpf: '000.000.000-00' } as any).subscribe();

    const createReq = httpMock.expectOne(`${apiBase}/api/funcionarios`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockFuncionarios[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios`).flush(mockFuncionarios);
  });

  it('invalida cache após update', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios`).flush(mockFuncionarios);

    service.update('f1', { nome: 'João Atualizado' } as any).subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios/f1`).flush(mockFuncionarios[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios`).flush(mockFuncionarios);
  });

  it('chama invalidateAll após delete', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios`).flush(mockFuncionarios);

    service.delete('f1').subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios/f1`).flush(null);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/funcionarios`).flush(mockFuncionarios);
  });

  it('getByClienteId usa endpoint /api/clientes/:id/funcionarios', () => {
    service.getByClienteId('c1').subscribe((data) => expect(data.length).toBe(1));

    const req = httpMock.expectOne(`${apiBase}/api/clientes/c1/funcionarios`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFuncionarios);
  });
});
