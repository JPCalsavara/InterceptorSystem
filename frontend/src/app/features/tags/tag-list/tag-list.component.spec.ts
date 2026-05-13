import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect } from 'vitest';
import { TagListComponent } from './tag-list.component';
import { TagService } from '../../../services/tag.service';

const mockTags = [
  { id: 't1', nome: 'Vigilante', valor: 150, descricao: 'Guarda patrimonial' },
  { id: 't2', nome: 'Supervisor', valor: 200, descricao: undefined },
];

describe('TagListComponent', () => {
  let mockTagService: any;

  const setup = async (serviceOverrides: any = {}) => {
    mockTagService = {
      getAll: vi.fn(() => of([...mockTags])),
      create: vi.fn(() => of(mockTags[0])),
      update: vi.fn(() => of(mockTags[0])),
      delete: vi.fn(() => of(undefined)),
      ...serviceOverrides,
    };

    return render(TagListComponent, {
      providers: [{ provide: TagService, useValue: mockTagService }],
    });
  };

  it('renderiza a lista de tags carregadas', async () => {
    await setup();
    expect(screen.getByText('Vigilante')).toBeTruthy();
    expect(screen.getByText('Supervisor')).toBeTruthy();
  });

  it('exibe o contador de resultados correto', async () => {
    await setup();
    const counter = screen.getByText(/Mostrando/);
    expect(counter.textContent).toContain('2');
  });

  it('exibe mensagem de erro quando o serviço falha', async () => {
    await setup({
      getAll: vi.fn(() => throwError(() => new Error('Erro de servidor'))),
    });
    expect(screen.getByText(/Erro ao carregar tags/)).toBeTruthy();
  });

  it('abre o modal de criação ao clicar em "Nova Tag"', async () => {
    await setup();
    await userEvent.click(screen.getByRole('button', { name: /Nova Tag/i }));
    expect(screen.getByRole('heading', { name: 'Nova Tag' })).toBeTruthy();
  });

  it('chama service.delete ao confirmar exclusão', async () => {
    const { fixture } = await setup();
    fixture.componentInstance.confirmDelete(mockTags[0] as any);
    fixture.detectChanges();
    fixture.componentInstance.executeDelete();
    fixture.detectChanges();
    expect(mockTagService.delete).toHaveBeenCalledWith('t1');
  });
});
