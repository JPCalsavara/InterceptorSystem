import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TagService } from '../../../services/tag.service';
import { Tag } from '../../../models/index';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss',
})
export class TagListComponent implements OnInit {
  private service = inject(TagService);
  private fb = inject(FormBuilder);

  tags = signal<Tag[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  filtroNome = signal('');
  showModal = signal(false);
  editingTag = signal<Tag | null>(null);
  saving = signal(false);
  deleteTarget = signal<Tag | null>(null);
  deleting = signal(false);

  tagsFiltradas = computed(() => {
    const filtro = this.filtroNome().toLowerCase();
    if (!filtro) return this.tags();
    return this.tags().filter(
      (t) =>
        t.nome.toLowerCase().includes(filtro) || (t.descricao ?? '').toLowerCase().includes(filtro),
    );
  });

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    descricao: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.loadTags();
  }

  limparFiltros(): void {
    this.filtroNome.set('');
  }

  loadTags(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: (data) => {
        this.tags.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar tags. Tente novamente.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  openCreate(): void {
    this.editingTag.set(null);
    this.form.reset();
    this.showModal.set(true);
  }

  openEdit(tag: Tag): void {
    this.editingTag.set(tag);
    this.form.setValue({ nome: tag.nome, descricao: tag.descricao ?? '' });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTag.set(null);
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const dto = { nome: val.nome!, descricao: val.descricao || undefined };
    this.saving.set(true);
    const editing = this.editingTag();

    const request$ = editing ? this.service.update(editing.id, dto) : this.service.create(dto);

    request$.subscribe({
      next: () => {
        this.showSuccess(editing ? 'Tag atualizada com sucesso!' : 'Tag criada com sucesso!');
        this.closeModal();
        this.loadTags();
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Erro ao salvar tag.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(tag: Tag): void {
    this.deleteTarget.set(tag);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  executeDelete(): void {
    const tag = this.deleteTarget();
    if (!tag) return;
    this.deleting.set(true);
    this.service.delete(tag.id).subscribe({
      next: () => {
        this.showSuccess('Tag excluída com sucesso!');
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.loadTags();
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Erro ao excluir tag.');
        this.deleteTarget.set(null);
        this.deleting.set(false);
      },
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
