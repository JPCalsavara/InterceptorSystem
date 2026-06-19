import { Component, Input, inject } from '@angular/core';
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
  template: `
    <div class="form-group">
      @if (label) {
        <label class="form-label" [for]="id">
          {{ label }} @if (required) { <span class="required">*</span> }
        </label>
      }
      
      @if (mask) {
        <input
          [id]="id"
          [type]="type"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          [attr.step]="step"
          [attr.min]="min"
          [attr.max]="max"
          [attr.maxlength]="maxlength"
          [attr.data-cy]="dataCy"
          [mask]="mask"
          [class.error]="hasError"
          class="form-input"
        />
      } @else {
        <input
          [id]="id"
          [type]="type"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          [attr.step]="step"
          [attr.min]="min"
          [attr.max]="max"
          [attr.maxlength]="maxlength"
          [attr.data-cy]="dataCy"
          [class.error]="hasError"
          class="form-input"
        />
      }

      @if (hasError) {
        <span class="error-message">{{ errorMessage }}</span>
      }
      @if (helpText && !hasError) {
        <span class="help-text">{{ helpText }}</span>
      }
    </div>
  `,
  styleUrls: ['./form-input.component.scss']
})
export class FormInputComponent {
  @Input({ required: true }) controlName!: string;
  @Input() label = '';
  @Input() id = `input-${Math.random().toString(36).substr(2, 9)}`;
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
    return this.controlContainer?.control?.get(this.controlName);
  }

  get hasError(): boolean {
    return !!(this.control?.invalid && (this.control?.touched || this.control?.dirty));
  }

  get errorMessage(): string {
    if (!this.control?.errors) return '';
    if (this.customErrorMessage) return this.customErrorMessage;
    if (this.control.errors['required']) return 'Este campo é obrigatório.';
    if (this.control.errors['min']) return `Valor mínimo: ${this.control.errors['min'].min}`;
    if (this.control.errors['email']) return 'Email inválido.';
    if (this.control.errors['mask']) return 'Formato inválido.';
    if (this.control.errors['cpfCnpj']) return 'Documento inválido.';
    return 'Campo inválido.';
  }
}
