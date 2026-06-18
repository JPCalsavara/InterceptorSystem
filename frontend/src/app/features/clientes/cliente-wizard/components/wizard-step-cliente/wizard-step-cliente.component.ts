import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-wizard-step-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './wizard-step-cliente.component.html',
  styleUrls: ['./wizard-step-cliente.component.scss'],
})
export class WizardStepClienteComponent {
  @Input({ required: true }) formCliente!: FormGroup;
  @Input({ required: true }) estados!: string[];
  @Input({ required: true }) cidadesDisponiveis!: string[];

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
