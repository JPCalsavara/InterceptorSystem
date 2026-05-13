import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';
import { Cliente } from '../models/cliente.model';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  const apiBase = '';
  const mockClientes: Cliente[] = [
    {
      id: 'c1',
      nome: 'Empresa Alpha',
      cnpj: '12.345.678/0001-99',
      cidade: 'São Paulo',
      estado: 'SP',
      ativo: true,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        EntityCacheCoordinatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reutiliza cache em getAll sem nova HTTP call', () => {
    service.getAll().subscribe((data) => expect(data.length).toBe(1));

    httpMock.expectOne(`${apiBase}/api/clientes`).flush(mockClientes);

    service.getAll().subscribe((data) => expect(data.length).toBe(1));

    httpMock.expectNone(`${apiBase}/api/clientes`);
  });

  it('invalida cache após create e refaz getAll', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/clientes`).flush(mockClientes);

    service
      .create({
        nome: 'Novo Cliente',
        cnpj: '00.000.000/0001-00',
        cidade: 'São Paulo',
        estado: 'SP',
      })
      .subscribe();

    const createReq = httpMock.expectOne(`${apiBase}/api/clientes`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockClientes[0]);

    service.getAll().subscribe();
    const refetchReq = httpMock.expectOne(`${apiBase}/api/clientes`);
    expect(refetchReq.request.method).toBe('GET');
    refetchReq.flush(mockClientes);
  });

  it('invalida cache após update', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/clientes`).flush(mockClientes);

    service
      .update('c1', {
        nome: 'Alpha Atualizado',
        cnpj: '12.345.678/0001-99',
        cidade: 'São Paulo',
        estado: 'SP',
      })
      .subscribe();

    httpMock.expectOne(`${apiBase}/api/clientes/c1`).flush(mockClientes[0]);

    service.getAll().subscribe();
    const refetchReq = httpMock.expectOne(`${apiBase}/api/clientes`);
    expect(refetchReq.request.method).toBe('GET');
    refetchReq.flush(mockClientes);
  });

  it('chama invalidateAll após delete', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/clientes`).flush(mockClientes);

    service.delete('c1').subscribe();
    httpMock.expectOne(`${apiBase}/api/clientes/c1`).flush(null);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/clientes`).flush(mockClientes);
  });

  it('usa endpoint /api/clientes-completos no createCompleto', () => {
    const dto = { nome: 'Completo', cnpj: '00.000.000/0001-00' };
    service.createCompleto(dto).subscribe();

    const req = httpMock.expectOne(`${apiBase}/api/clientes-completos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('getById busca diretamente na API sem cache', () => {
    service.getById('c1').subscribe((c) => expect(c.id).toBe('c1'));

    const req = httpMock.expectOne(`${apiBase}/api/clientes/c1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClientes[0]);
  });
});
