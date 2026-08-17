import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormInputComponent } from "../../../../../shared/components/form-input/form-input.component";
import { FormSelectComponent } from "../../../../../shared/components/form-select/form-select.component";
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { IbgeService } from '../../../../../services/ibge.service';

@Component({
  selector: 'app-wizard-step-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, FormInputComponent, FormSelectComponent],
  templateUrl: './wizard-step-cliente.component.html',
  styleUrls: ['./wizard-step-cliente.component.scss'],
})
export class WizardStepClienteComponent implements OnInit {
  @Input({ required: true }) formCliente!: FormGroup;

  estados = signal<{value: string, label: string}[]>([]);
  cidadesDisponiveis = signal<{value: string, label: string}[]>([]);

  private ibgeService = inject(IbgeService);

  ngOnInit(): void {
    this.carregarEstados();
    this.setupLocationWatcher();
  }

  private carregarEstados(): void {
    this.ibgeService.getEstados().subscribe((estadosObj) => {
      this.estados.set(estadosObj.map((e) => ({ value: e.sigla, label: e.sigla })));
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
          this.cidadesDisponiveis.set(cidadesDoEstado.map(c => ({ value: c, label: c })));

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

}
