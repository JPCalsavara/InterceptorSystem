import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ContratoFormComponent } from './contrato-form.component';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { ClienteService } from '../../../services/cliente.service';
import { TagService } from '../../../services/tag.service';

const mockClientes = [
  { id: 'c1', nome: 'Empresa Alpha', cnpj: '12.345.678/0001-99', ativo: true },
  { id: 'c2', nome: 'Empresa Beta', cnpj: '98.765.432/0001-11', ativo: true },
];

const mockTags = [{ id: 't1', nome: 'Vigilante', valor: 150, descricao: 'Guarda' }];

const mockActivatedRoute = {
  snapshot: { paramMap: { get: () => null } },
};

const buildProviders = (overrides: Record<string, unknown> = {}) => [
  provideRouter([]),
  { provide: ActivatedRoute, useValue: mockActivatedRoute },
  {
    provide: ContratoService,
    useValue: {
      getAll: vi.fn(() => of([])),
      getById: vi.fn(),
      create: vi.fn(() => of({})),
      update: vi.fn(() => of({})),
    },
  },
  {
    provide: ContratoCalculoService,
    useValue: {
      calcularValorTotal: vi.fn(() => of({ valorTotalMensal: 6000 })),
    },
  },
  {
    provide: ClienteService,
    useValue: { getAll: vi.fn(() => of(mockClientes)) },
  },
  {
    provide: TagService,
    useValue: { getAll: vi.fn(() => of(mockTags)) },
  },
  ...Object.entries(overrides).map(([token, value]) => ({ provide: token, useValue: value })),
];

describe('ContratoFormComponent', () => {
  it('renderiza o título "Novo Contrato" no modo de criação', async () => {
    await render(ContratoFormComponent, { providers: buildProviders() });

    expect(screen.getByRole('heading', { name: 'Novo Contrato' })).toBeInTheDocument();
  });

  it('carrega e exibe a lista de clientes no select', async () => {
    await render(ContratoFormComponent, { providers: buildProviders() });

    const select = screen.getByLabelText(/Cliente/) as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent?.trim());
    expect(options).toContain('Empresa Alpha');
    expect(options).toContain('Empresa Beta');
  });

  it('preenche valores padrão nos campos numéricos', async () => {
    await render(ContratoFormComponent, { providers: buildProviders() });

    const postos = screen.getByLabelText(/Número de Postos/) as HTMLInputElement;
    expect(postos.value).toBe('2');
  });

  it('exibe erros de validação ao submeter o form com cliente vazio', async () => {
    await render(ContratoFormComponent, { providers: buildProviders() });

    const submitBtn = screen.getByRole('button', { name: /Cadastrar/ });
    await userEvent.click(submitBtn);

    expect(screen.getAllByText(/Este campo é obrigatório/).length).toBeGreaterThan(0);
  });

  it('exibe o botão de voltar para a lista de contratos', async () => {
    await render(ContratoFormComponent, { providers: buildProviders() });

    expect(screen.getByRole('button', { name: /Voltar/ })).toBeInTheDocument();
  });

  it('exibe tag picker com as tags disponíveis', async () => {
    await render(ContratoFormComponent, { providers: buildProviders() });

    expect(screen.getByRole('button', { name: /Vigilante/ })).toBeInTheDocument();
  });
});
