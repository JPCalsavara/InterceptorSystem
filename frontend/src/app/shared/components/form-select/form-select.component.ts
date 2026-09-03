import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  [key: string]: any;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss']
})
export class FormSelectComponent {
  @Input() controlName?: string;
  @Input() value: any = '';
  @Output() valueChange = new EventEmitter<any>();
  @Input() disabled = false;
  @Input() label = '';
  @Input() inputId = `select-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  @Input() options: SelectOption[] = [];
  @Input() required = false;
  @Input() dataCy?: string;
  @Input() helpText = '';
  @Input() customErrorMessage?: string;
  @Input() valueKey = 'value';
  @Input() labelKey = 'label';

  private controlContainer = inject(ControlContainer, { optional: true });

  get control() {
    if (!this.controlName) return null;
    return this.controlContainer?.control?.get(this.controlName);
  }

  onSelectChange(event: Event) {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }

  get hasError(): boolean {
    return !!(this.control?.invalid && (this.control?.touched || this.control?.dirty));
  }

  get errorMessage(): string {
    if (!this.control?.errors) return '';
    if (this.customErrorMessage) return this.customErrorMessage;
    
    if (this.control.errors['required']) return 'Este campo é obrigatório.';

    return 'Seleção inválida.';
  }
}
