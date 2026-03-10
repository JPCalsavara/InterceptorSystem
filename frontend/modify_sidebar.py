import re

path = 'src/app/core/layout/sidebar.component.ts'
with open(path, 'r') as f:
    content = f.read()

# Make sure imports are present
if 'import { OnInit, inject, signal }' not in content:
    content = content.replace('import { Component } from \'@angular/core\';', 'import { Component, OnInit, inject, signal } from \'@angular/core\';')

if 'ClienteService' not in content:
    imports = """
import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import { StatusContrato, StatusDiaria, StatusFuncionario } from '../../models/index';
"""
    content = content.replace("import { RouterLink, RouterLinkActive } from '@angular/router';", "import { RouterLink, RouterLinkActive } from '@angular/router';" + imports)

# update NavItem
content = content.replace('icon: string;', 'icon: string;\n  countKey?: \'clientes\' | \'funcionarios\' | \'postos\' | \'diarias\' | \'contratos\';')

# update template
template_addition = """
            <span class="label">{{ item.label }}</span>
            @if (item.countKey && counts()[item.countKey] !== null) {
              <span class="nav-badge">{{ counts()[item.countKey] }}</span>
            }"""
content = re.sub(r'<span class="label">{{ item\.label }}</span>', template_addition, content)

# update styles
style_addition = """
      .nav-badge {
        margin-left: auto;
        background: var(--bg-tertiary);
        color: var(--primary-dark);
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.15rem 0.6rem;
        border-radius: 9999px;
      }
      .nav-item.active .nav-badge {
        background: var(--surface-card);
        color: var(--primary-color);
      }
"""
content = content.replace('.label {\n        font-size: var(--text-sm);\n      }', '.label {\n        font-size: var(--text-sm);\n      }' + style_addition)

class_content = """export class SidebarComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private diariaService = inject(DiariaService);
  private contratoService = inject(ContratoService);

  counts = signal<Record<string, number | null>>({
    clientes: null,
    funcionarios: null,
    postos: null,
    diarias: null,
    contratos: null
  });

  navItems: NavItem[] = [
    { label: 'Resumo', route: '/dashboard', icon: 'chart-bar' },
    { label: 'Clientes', route: '/clientes', icon: 'building-office', countKey: 'clientes' },
    { label: 'Contratos', route: '/contratos', icon: 'document-text', countKey: 'contratos' },
    { label: 'Funcionários', route: '/funcionarios', icon: 'user-group', countKey: 'funcionarios' },
    { label: 'Postos de Trabalho', route: '/postos', icon: 'map-pin', countKey: 'postos' },
    { label: 'Diárias', route: '/diarias', icon: 'calendar-days', countKey: 'diarias' },
  ];

  ngOnInit() {
    this.clienteService.getAll().subscribe({
      next: (data) => this.counts.update(c => ({ ...c, clientes: data.filter((x: any) => x.ativo).length }))
    });
    this.funcionarioService.getAll().subscribe({
      next: (data) => this.counts.update(c => ({ ...c, funcionarios: data.filter((x: any) => x.statusFuncionario === StatusFuncionario.ATIVO).length }))
    });
    this.postoService.getAll().subscribe({
      next: (data) => this.counts.update(c => ({ ...c, postos: data.length }))
    });
    this.diariaService.getAll().subscribe({
      next: (data) => this.counts.update(c => ({ ...c, diarias: data.filter((x: any) => x.statusDiaria === StatusDiaria.CONFIRMADA).length }))
    });
    this.contratoService.getAll().subscribe({
      next: (data) => this.counts.update(c => ({ ...c, contratos: data.filter((x: any) => x.status === StatusContrato.ATIVO).length }))
    });
  }
}
"""

content = re.sub(r'export class SidebarComponent \{[\s\S]*', class_content, content)

with open(path, 'w') as f:
    f.write(content)
