import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tag } from '../../../models';

@Component({
  selector: 'app-tag-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-picker.component.html',
  styleUrl: './tag-picker.component.scss',
})
export class TagPickerComponent {
  readonly tags = input<Tag[]>([]);
  readonly selectedIds = input<string[]>([]);
  readonly lockedIds = input<string[]>([]);
  readonly disabled = input(false);
  readonly label = input('Funções');
  readonly helperText = input<string | null>(null);
  readonly emptyText = input('Nenhuma tag disponível.');
  readonly searchPlaceholder = input('Buscar por nome ou descrição...');

  readonly selectionChange = output<string[]>();

  readonly searchTerm = signal('');

  readonly filteredTags = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.tags();

    return this.tags().filter((tag) => {
      const nome = tag.nome.toLowerCase();
      const descricao = (tag.descricao ?? '').toLowerCase();
      return nome.includes(term) || descricao.includes(term);
    });
  });

  readonly selectedTags = computed(() => {
    const selected = new Set(this.selectedIds());
    return this.tags().filter((tag) => selected.has(tag.id));
  });

  isSelected(tagId: string): boolean {
    return this.selectedIds().includes(tagId);
  }

  isLocked(tagId: string): boolean {
    return this.lockedIds().includes(tagId);
  }

  toggle(tagId: string): void {
    if (this.disabled() || this.isLocked(tagId)) return;

    const current = [...this.selectedIds()];
    const index = current.indexOf(tagId);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(tagId);
    }

    this.selectionChange.emit(current);
  }
}
