import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormInputComponent } from "../../../../../shared/components/form-input/form-input.component";
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { IbgeService } from '../../../../../services/ibge.service';

@Component({
  selector: 'app-wizard-step-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, FormInputComponent],
  templateUrl: './wizard-step-cliente.component.html',
  styleUrls: ['./wizard-step-cliente.component.scss'],
})
export class WizardStepClienteComponent implements OnInit {
  @Input({ required: true }) formCliente!: FormGroup;

  estados = signal<string[]>([]);
  cidadesDisponiveis = signal<string[]>([]);

  private ibgeService = inject(IbgeService);

  ngOnInit(): void {
    this.carregarEstados();
    this.setupLocationWatcher();
  }

  private carregarEstados(): void {
    this.ibgeService.getEstados().subscribe((estadosObj) => {
      this.estados.set(estadosObj.map((e) => e.sigla));
    });
  }

  private setupLocationWatcher(): void {
    const estadoControl = this.formCliente.get('estado');
    const cidadeControl = this.formCliente.get('cidade');

    estadoControl?.valueChanges.subscribe((uf: string) => {
      const estado = String(uf ?? '').toUpperCase();
      if (estadoControl.value !== estado) {
        estadoControl.setValue(estado, { emitEvent: false });
      }

      if (estado) {
        this.ibgeService.getMunicipiosPorEstado(estado).subscribe((municipios) => {
          const cidadesDoEstado = municipios.map((m) => m.nome);
          this.cidadesDisponiveis.set(cidadesDoEstado);

          const cidadeAtual = String(cidadeControl?.value ?? '');
          if (cidadeAtual && !cidadesDoEstado.includes(cidadeAtual)) {
            cidadeControl?.setValue('');
          }
        });
      } else {
        this.cidadesDisponiveis.set([]);
        cidadeControl?.setValue('');
      }
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.formCliente.get(fieldName);
    if (!field) return false;
    return field.invalid && field.touched;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.formCliente.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['cnpjInvalido']) return 'CNPJ inválido';
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['email']) return 'E-mail inválido';

    return 'Campo inválido';
  }
}
