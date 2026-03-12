import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { FuncionarioService } from '../../../services/funcionario.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { TagService } from '../../../services/tag.service';
import {
  StatusFuncionario,
  TipoFuncionario,
  TipoEscala,
  Contrato,
  StatusContrato,
  Tag,
} from '../../../models';

@Component({
  selector: 'app-funcionario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './funcionario-form.component.html',
  styleUrl: './funcionario-form.component.scss',
})
export class FuncionarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(FuncionarioService);
  private clienteService = inject(ClienteService);
  private contratoService = inject(ContratoService);
  private tagService = inject(TagService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  funcionarioId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  clientes = signal<any[]>([]);
  contratos = signal<Contrato[]>([]);
  tags = signal<Tag[]>([]);
  defaultTag = signal<Tag | null>(null);
  additionalTags = signal<Tag[]>([]);
  showPresetSelection = signal(false);

  StatusFuncionario = StatusFuncionario;
  TipoFuncionario = TipoFuncionario;
  TipoEscala = TipoEscala;

  statusOptions = [
    { value: StatusFuncionario.ATIVO, label: 'Ativo' },
    { value: StatusFuncionario.FERIAS, label: 'Férias' },
    { value: StatusFuncionario.AFASTADO, label: 'Afastado' },
    { value: StatusFuncionario.DEMITIDO, label: 'Demitido' },
  ];

  tipoOptions = [
    { value: TipoFuncionario.CLT, label: 'CLT' },
    { value: TipoFuncionario.FREELANCER, label: 'Freelancer' },
    { value: TipoFuncionario.TERCEIRIZADO, label: 'Terceirizado' },
  ];

  escalaOptions = [
    {
      value: TipoEscala.DOZE_POR_TRINTA_SEIS,
      label: '12x36 (12 horas trabalhadas, 36 de descanso)',
    },
    { value: TipoEscala.SEMANAL_COMERCIAL, label: 'Semanal Comercial (44h semanais)' },
    { value: TipoEscala.ALCALA_8H, label: 'Alcalá 8h (Segunda a Sábado)' },
    { value: TipoEscala.FOLGUISTA, label: 'Folguista' },
    { value: TipoEscala.OITO_HORAS_SEIS_POR_DOIS, label: '8h (6x2)' },
  ];

  ngOnInit(): void {
    this.loadClientes();
    this.loadTags();
    this.buildForm();
    this.setupClienteChange();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.funcionarioId.set(id);
      this.isEdit.set(true);
      this.loadFuncionario(id);
    }
  }

  loadTags(): void {
    this.tagService.getAll().subscribe({
      next: (data) => {
        this.tags.set(data);
        // Find the default tag (valorDiaria)
        const defaultTag = data.find((t) => t.nome.toLowerCase() === 'valordiaria');
        this.defaultTag.set(defaultTag || null);

        // Get other tags (excluding default)
        const others = defaultTag ? data.filter((t) => t.id !== defaultTag.id) : data;
        this.additionalTags.set(others);

        // Show preset selection only if there are NO additional tags
        this.showPresetSelection.set(others.length === 0);

        // Keep form validators in sync with async tag-loading rules.
        this.updateTagValidators();

        // Ensure default tag stays selected when available.
        const tagIdsControl = this.form?.get('tagIds');
        if (tagIdsControl && defaultTag) {
          const currentTagIds: string[] = tagIdsControl.value || [];
          if (!currentTagIds.includes(defaultTag.id)) {
            tagIdsControl.setValue([...currentTagIds, defaultTag.id]);
          }
        }
      },
      error: (err) => console.error('Erro ao carregar tags:', err),
    });
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Erro ao carregar clientes:', err),
    });
  }

  setupClienteChange(): void {
    this.form.get('clienteId')?.valueChanges.subscribe((clienteId) => {
      if (clienteId) {
        this.loadContratos(clienteId);
      } else {
        this.contratos.set([]);
      }
    });
  }

  loadContratos(clienteId: string): void {
    this.contratoService.getAll().subscribe({
      next: (data) => {
        const contratosDoCliente = data.filter(
          (c) => c.clienteId === clienteId && c.status !== StatusContrato.FINALIZADO,
        );
        this.contratos.set(contratosDoCliente);
      },
      error: (err) => console.error('Erro ao carregar contratos:', err),
    });
  }

  buildForm(): void {
    const tagIdValidators = this.shouldRequireTagSelection() ? [Validators.required] : [];

    this.form = this.fb.group({
      clienteId: ['', Validators.required],
      contratoId: ['', Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      celular: ['', [Validators.required, this.celularValidator]],
      statusFuncionario: [StatusFuncionario.ATIVO, Validators.required],
      tipoFuncionario: [TipoFuncionario.CLT, Validators.required],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, Validators.required],
      tagIds: [this.defaultTag() ? [this.defaultTag()!.id] : [], tagIdValidators],
    });
  }

  private shouldRequireTagSelection(): boolean {
    return this.showPresetSelection() && this.additionalTags().length > 0;
  }

  private updateTagValidators(): void {
    const tagIdsControl = this.form?.get('tagIds');
    if (!tagIdsControl) return;

    if (this.shouldRequireTagSelection()) {
      tagIdsControl.setValidators([Validators.required]);
    } else {
      tagIdsControl.clearValidators();
    }
    tagIdsControl.updateValueAndValidity({ emitEvent: false });
  }

  private cpfValidator(control: any) {
    if (!control.value) return null;
    if (control.value.length !== 11) {
      return { cpfInvalid: true };
    }
    return null;
  }

  private celularValidator(control: any) {
    if (!control.value) return null;
    if (control.value.length < 10 || control.value.length > 11) {
      return { celularInvalid: true };
    }
    return null;
  }

  loadFuncionario(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data) => {
        const tagIds = (data.tags ?? []).map((tag) => tag.id);
        this.form.patchValue({
          ...data,
          tagIds,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar funcionário. Redirecionando...');
        console.error('Erro:', err);
        setTimeout(() => this.router.navigate(['/funcionarios']), 2000);
      },
    });
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    if (this.contratos().length === 0 && !this.isEdit()) {
      this.error.set(
        'Não há contratos ativos para o cliente selecionado. Cadastre um contrato primeiro.',
      );
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    let formValue = this.form.value;

    // Ensure default tag is always included
    const currentTagIds = formValue.tagIds || [];
    const defaultTagId = this.defaultTag()?.id;
    if (defaultTagId && !currentTagIds.includes(defaultTagId)) {
      formValue.tagIds = [...currentTagIds, defaultTagId];
    }

    const request = this.isEdit()
      ? this.service.update(this.funcionarioId()!, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/funcionarios']);
      },
      error: (err) => {
        this.error.set(
          this.isEdit()
            ? 'Erro ao atualizar funcionário. Tente novamente.'
            : 'Erro ao criar funcionário. Tente novamente.',
        );
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/funcionarios']);
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.touched || this.submitted()) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.submitted())) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['cpfInvalid']) return 'CPF deve conter 11 dígitos';
    if (errors['celularInvalid']) return 'Celular deve conter 10 ou 11 dígitos';

    return 'Campo inválido';
  }

  toggleTag(tagId: string): void {
    const tagIdsControl = this.form.get('tagIds');
    if (!tagIdsControl) return;

    const currentTagIds = tagIdsControl.value || [];
    const index = currentTagIds.indexOf(tagId);

    if (index > -1) {
      currentTagIds.splice(index, 1);
    } else {
      currentTagIds.push(tagId);
    }

    tagIdsControl.setValue([...currentTagIds]);
    tagIdsControl.markAsTouched();
  }
}
