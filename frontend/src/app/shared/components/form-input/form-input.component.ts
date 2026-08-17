import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss']
})
export class FormInputComponent {
  @Input() controlName?: string;
  @Input() value: any = '';
  @Output() valueChange = new EventEmitter<any>();
  @Output() blurEvent = new EventEmitter<void>();
  @Output() focusEvent = new EventEmitter<void>();
  @Input() disabled = false;
  @Input() label = '';
  @Input() id = `input-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() step?: string;
  @Input() min?: string;
  @Input() max?: string;
  @Input() maxlength?: string;
  @Input() dataCy?: string;
  @Input() mask: string = '';
  @Input() required = false;
  @Input() helpText = '';
  @Input() customErrorMessage?: string;
  
  private controlContainer = inject(ControlContainer, { optional: true });

  get control() {
    if (!this.controlName) return null;
    return this.controlContainer?.control?.get(this.controlName);
  }

  onInputChange(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  onBlur() {
    this.blurEvent.emit();
  }

  onFocus() {
    this.focusEvent.emit();
  }

  get hasError(): boolean {
    return !!(this.control?.invalid && (this.control?.touched || this.control?.dirty));
  }

  get errorMessage(): string {
    if (!this.control?.errors) return '';
    if (this.customErrorMessage) return this.customErrorMessage;
    
    // Erros padronizados
    if (this.control.errors['required']) return 'Este campo é obrigatório.';
    if (this.control.errors['min']) return `Valor mínimo: ${this.control.errors['min'].min}`;
    if (this.control.errors['max']) return `Valor máximo: ${this.control.errors['max'].max}`;
    if (this.control.errors['minlength']) return `Mínimo de ${this.control.errors['minlength'].requiredLength} caracteres.`;
    if (this.control.errors['maxlength']) return `Máximo de ${this.control.errors['maxlength'].requiredLength} caracteres.`;
    if (this.control.errors['email']) return 'Email inválido.';
    if (this.control.errors['mask']) return 'Formato inválido.';
    
    // Nossos Custom Validators do br-documents
    if (this.control.errors['cpfInvalid']) return 'CPF inválido (verifique o formato e os dígitos)';
    if (this.control.errors['cnpjInvalid']) return 'CNPJ inválido (ex: 12.345.678/0001-90)';
    if (this.control.errors['cpfCnpj']) return 'Documento inválido.';
    if (this.control.errors['celularInvalid']) return 'Celular inválido (ex: 11999999999)';
    if (this.control.errors['telefoneInvalid']) return 'Telefone inválido (ex: 1133334444)';
    if (this.control.errors['cepNotFound']) return 'CEP não encontrado.';

    return 'Campo inválido.';
  }
}
