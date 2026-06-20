import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { SvgIconComponent } from "../../svg/svg-icon.component";
import { FormInputComponent } from "../../../../../shared/components/form-input/form-input.component";
import { TipoFuncionario, StatusFuncionario, TipoEscala } from '../../../../../models/index';
import { cpfValidator, telefoneValidator } from '../../../../../shared/validators/br-documents.validators';

@Component({
  selector: 'app-wizard-step-funcionarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SvgIconComponent, FormInputComponent],
  templateUrl: './wizard-step-funcionarios.component.html',
  styleUrls: ['../../cliente-wizard.component.scss']
})
export class WizardStepFuncionariosComponent {
  private fb = inject(FormBuilder);

  @Input({ required: true }) formFuncionarios!: FormGroup;

  get funcionarios(): FormArray {
    return this.formFuncionarios.get('funcionarios') as FormArray;
  }

  addFuncionario(): void {
    const funcionarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, cpfValidator]],
      celular: ['', [telefoneValidator]],
      tipoFuncionario: [TipoFuncionario.CLT, [Validators.required]],
      statusFuncionario: [StatusFuncionario.ATIVO, [Validators.required]],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, [Validators.required]],
    });

    this.funcionarios.push(funcionarioForm);
  }

  removeFuncionario(index: number): void {
    this.funcionarios.removeAt(index);
  }

  contarFuncionariosPorStatus(status: string): number {
    return this.funcionarios.controls.filter(
      (func) => func.get('statusFuncionario')?.value === status,
    ).length;
  }

  contarFuncionariosPorTipo(tipo: string): number {
    return this.funcionarios.controls.filter((func) => func.get('tipoFuncionario')?.value === tipo)
      .length;
  }
}
