import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthResult } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockNavigate: ReturnType<typeof vi.fn>;

  const apiBase = 'http://localhost';
  const mockAuthResult: AuthResult = {
    empresaId: 'emp1',
    nomeEmpresa: 'Empresa Teste',
    email: 'test@empresa.com',
    plano: 'basico',
    token: 'jwt-token-abc',
    emailVerificado: true,
  };

  beforeEach(() => {
    localStorage.clear();
    mockNavigate = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: mockNavigate } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('login()', () => {
    it('faz POST e armazena token no localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      service.login({ email: 'test@empresa.com', senha: 'senha123' }).subscribe((result) => {
        expect(result.token).toBe('jwt-token-abc');
      });

      const req = httpMock.expectOne(`${apiBase}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResult);

      expect(setItemSpy).toHaveBeenCalledWith('auth_token', 'jwt-token-abc');
      expect(setItemSpy).toHaveBeenCalledWith('auth_user', JSON.stringify(mockAuthResult));
    });

    it('atualiza o signal currentUser após login', () => {
      service.login({ email: 'test@empresa.com', senha: 'senha123' }).subscribe();
      httpMock.expectOne(`${apiBase}/api/auth/login`).flush(mockAuthResult);

      expect(service.currentUser()?.email).toBe('test@empresa.com');
      expect(service.currentUser()?.token).toBe('jwt-token-abc');
    });
  });

  describe('logout()', () => {
    it('remove token do localStorage e zera currentUser signal', () => {
      localStorage.setItem('auth_token', 'jwt-token-abc');
      localStorage.setItem('auth_user', JSON.stringify(mockAuthResult));

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(service.currentUser()).toBeNull();
    });

    it('navega para "/" após logout', () => {
      service.logout();

      expect(mockNavigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('isAuthenticated()', () => {
    it('retorna false quando não há token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('retorna true quando há token no localStorage', () => {
      localStorage.setItem('auth_token', 'jwt-token-abc');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('atualizarUser()', () => {
    it('atualiza o signal currentUser e persiste no localStorage', () => {
      service.currentUser.set(mockAuthResult);
      service.atualizarUser({ nomeEmpresa: 'Empresa Atualizada' });

      expect(service.currentUser()?.nomeEmpresa).toBe('Empresa Atualizada');

      const stored = JSON.parse(localStorage.getItem('auth_user')!);
      expect(stored.nomeEmpresa).toBe('Empresa Atualizada');
    });

    it('não faz nada se currentUser for null', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      service.atualizarUser({ nomeEmpresa: 'X' });
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('confirmarEmail()', () => {
    it('envia POST com token e marca email como verificado', () => {
      service.currentUser.set({ ...mockAuthResult, emailVerificado: false });

      service.confirmarEmail('conf-token-123').subscribe((result) => {
        expect(result.mensagem).toBe('Email confirmado');
      });

      const req = httpMock.expectOne(`${apiBase}/api/auth/email/confirmar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token: 'conf-token-123' });
      req.flush({ mensagem: 'Email confirmado' });

      expect(service.isEmailVerificado()).toBe(true);
    });
  });

  describe('registrar()', () => {
    it('faz POST e armazena sessão', () => {
      service
        .registrar({ email: 'novo@empresa.com', senha: 'senha123', nomeEmpresa: 'Nova Empresa' })
        .subscribe((result) => {
          expect(result.email).toBe('test@empresa.com');
        });

      const req = httpMock.expectOne(`${apiBase}/api/auth/registrar`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResult);

      expect(service.currentUser()?.email).toBe('test@empresa.com');
    });
  });
});
