# 🚀 Roadmap: InterceptorSystem Angular Frontend

## 📐 Arquitetura Proposta

### Stack Tecnológico

- **Frontend**: Angular 18+ (Standalone Components + Signals)
- **Estado**: RxJS + Signals (híbrido para aprendizado)
- **UI**: Angular Material ou PrimeNG (sugestão: PrimeNG para tabelas complexas)
- **Testes Unitários**: Jest (mais rápido que Karma)
- **Testes E2E**: Cypress
- **Build/CI**: GitHub Actions + Docker
- **Backend**: .NET 8 (já existente)

### Estrutura de Pastas (Angular)

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services (Auth, HTTP, Tenant)
│   │   │   ├── interceptors/
│   │   │   │   ├── tenant.interceptor.ts
│   │   │   │   └── error-handler.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── tenant.service.ts
│   │   │   └── guards/
│   │   │       └── auth.guard.ts
│   │   │
│   │   ├── shared/                  # Componentes/Pipes/Directives reutilizáveis
│   │   │   ├── components/
│   │   │   │   ├── data-table/
│   │   │   │   ├── form-field-error/
│   │   │   │   └── loading-spinner/
│   │   │   ├── models/              # Interfaces TypeScript (DTOs)
│   │   │   │   ├── condominio.model.ts
│   │   │   │   ├── funcionario.model.ts
│   │   │   │   └── api-response.model.ts
│   │   │   └── pipes/
│   │   │       └── cpf.pipe.ts
│   │   │
│   │   ├── features/                # Módulos de negócio
│   │   │   ├── condominios/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── condominio-list/
│   │   │   │   │   ├── condominio-form/
│   │   │   │   │   └── condominio-detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── condominio.service.ts
│   │   │   │   └── condominio.routes.ts
│   │   │   │
│   │   │   ├── funcionarios/
│   │   │   │   ├── pages/
│   │   │   │   ├── services/
│   │   │   │   └── funcionarios.routes.ts
│   │   │   │
│   │   │   ├── postos/
│   │   │   ├── alocacoes/
│   │   │   └── contratos/
│   │   │
│   │   ├── app.config.ts            # Providers (Standalone API)
│   │   ├── app.routes.ts
│   │   └── app.component.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── assets/
│
├── cypress/                         # Testes E2E
│   ├── e2e/
│   │   ├── condominios.cy.ts
│   │   └── auth.cy.ts
│   └── support/
│
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
│
├── angular.json
├── package.json
├── jest.config.js
└── Dockerfile
```

---

## 📅 FASE 1: Setup Inicial (Dias 1-2)

### 1.1 Criar Workspace Angular

```bash
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem
npx @angular/cli@latest new frontend --routing --style=scss --standalone --ssr=false

# Durante a criação, escolher:
# - Routing: Yes
# - Stylesheet: SCSS
# - SSR: No
```

### 1.2 Instalar Dependências Essenciais

```bash
cd frontend

# UI Library (escolha UMA)
npm install primeng primeicons      # OU
npm install @angular/material @angular/cdk

# Estado e utilitários
npm install rxjs@latest
npm install date-fns               # Manipulação de datas

# Testes
npm install --save-dev jest @types/jest jest-preset-angular
npm install --save-dev @testing-library/angular
npm install --save-dev cypress

# HTTP Mock para testes
npm install --save-dev msw          # Mock Service Worker
```

### 1.3 Configurar Jest (Substituir Karma)

**jest.config.js**

```javascript
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/cypress/"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/main.ts",
    "!src/environments/**",
  ],
  moduleNameMapper: {
    "@app/(.*)": "<rootDir>/src/app/$1",
    "@shared/(.*)": "<rootDir>/src/app/shared/$1",
    "@core/(.*)": "<rootDir>/src/app/core/$1",
  },
};
```

**package.json** (adicionar scripts)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "e2e": "cypress open",
    "e2e:ci": "cypress run"
  }
}
```

### 1.4 Configurar CORS no Backend .NET

**Program.cs** (adicionar antes de `app.Run()`)

```csharp
// Após var app = builder.Build();

app.UseCors(policy =>
    policy.WithOrigins("http://localhost:4200")
          .AllowAnyMethod()
          .AllowAnyHeader()
          .AllowCredentials());

app.UseHttpsRedirection();
```

---

## 📅 FASE 2: Core Module (Dias 3-4)

### 2.1 Criar Models (TypeScript) baseados nos DTOs .NET

**src/app/shared/models/condominio.model.ts**

```typescript
export interface Condominio {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  empresaId: string;
  dataCriacao: Date;
}

export interface CreateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
}

export interface UpdateCondominioDto extends CreateCondominioDto {
  id: string;
}
```

**src/app/shared/models/funcionario.model.ts**

```typescript
export enum StatusFuncionario {
  ATIVO = "ATIVO",
  AFASTADO = "AFASTADO",
  FERIAS = "FERIAS",
  DESLIGADO = "DESLIGADO",
}

export enum TipoFuncionario {
  VIGILANTE = "VIGILANTE",
  PORTEIRO = "PORTEIRO",
  SUPERVISOR = "SUPERVISOR",
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  status: StatusFuncionario;
  tipo: TipoFuncionario;
  salario: number;
  dataAdmissao: Date;
  empresaId: string;
}

export interface CreateFuncionarioDto {
  nome: string;
  cpf: string;
  telefone: string;
  status: StatusFuncionario;
  tipo: TipoFuncionario;
  salario: number;
  dataAdmissao: string; // ISO String
}
```

### 2.2 Criar Tenant Interceptor

**src/app/core/interceptors/tenant.interceptor.ts**

```typescript
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { TenantService } from "../services/tenant.service";

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const empresaId = tenantService.getCurrentTenant();

  if (empresaId && !req.headers.has("X-Tenant-Id")) {
    req = req.clone({
      setHeaders: {
        "X-Tenant-Id": empresaId,
      },
    });
  }

  return next(req);
};
```

**src/app/core/services/tenant.service.ts**

```typescript
import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class TenantService {
  private tenantId = signal<string>("00000000-0000-0000-0000-000000000001"); // Mock inicial

  getCurrentTenant(): string {
    return this.tenantId();
  }

  setTenant(id: string): void {
    this.tenantId.set(id);
    localStorage.setItem("tenantId", id);
  }
}
```

### 2.3 Configurar Interceptors e Providers

**src/app/app.config.ts**

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { routes } from "./app.routes";
import { tenantInterceptor } from "./core/interceptors/tenant.interceptor";
import { errorHandlerInterceptor } from "./core/interceptors/error-handler.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([tenantInterceptor, errorHandlerInterceptor])
    ),
  ],
};
```

---

## 📅 FASE 3: Primeiro Módulo - Condominios (Dias 5-7)

### 3.1 Criar Service com RxJS

**src/app/features/condominios/services/condominio.service.ts**

```typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import {
  Condominio,
  CreateCondominioDto,
} from "@shared/models/condominio.model";

@Injectable({ providedIn: "root" })
export class CondominioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/condominios`;

  getAll(): Observable<Condominio[]> {
    return this.http.get<Condominio[]>(this.apiUrl);
  }

  getById(id: string): Observable<Condominio> {
    return this.http.get<Condominio>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCondominioDto): Observable<Condominio> {
    return this.http.post<Condominio>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateCondominioDto): Observable<Condominio> {
    return this.http.put<Condominio>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### 3.2 Criar Componente de Listagem com Signals

**src/app/features/condominios/pages/condominio-list/condominio-list.component.ts**

```typescript
import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CondominioService } from "../../services/condominio.service";
import { Condominio } from "@shared/models/condominio.model";

@Component({
  selector: "app-condominio-list",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Condomínios</h1>

      <button routerLink="/condominios/novo">Novo Condomínio</button>

      @if (loading()) {
      <p>Carregando...</p>
      } @else if (error()) {
      <p class="error">{{ error() }}</p>
      } @else {
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          @for (cond of condominios(); track cond.id) {
          <tr>
            <td>{{ cond.nome }}</td>
            <td>{{ cond.cnpj }}</td>
            <td>{{ cond.telefone }}</td>
            <td>
              <button [routerLink]="['/condominios', cond.id]">Ver</button>
              <button [routerLink]="['/condominios', cond.id, 'editar']">
                Editar
              </button>
              <button (click)="delete(cond.id)">Excluir</button>
            </td>
          </tr>
          }
        </tbody>
      </table>
      }
    </div>
  `,
})
export class CondominioListComponent implements OnInit {
  private service = inject(CondominioService);

  condominios = signal<Condominio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCondominios();
  }

  loadCondominios(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.condominios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set("Erro ao carregar condomínios");
        this.loading.set(false);
      },
    });
  }

  delete(id: string): void {
    if (confirm("Deseja realmente excluir?")) {
      this.service.delete(id).subscribe({
        next: () => this.loadCondominios(),
        error: (err) => this.error.set("Erro ao excluir"),
      });
    }
  }
}
```

### 3.3 Criar Formulário Reativo

**src/app/features/condominios/pages/condominio-form/condominio-form.component.ts**

```typescript
import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { CondominioService } from "../../services/condominio.service";

@Component({
  selector: "app-condominio-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>{{ isEdit ? "Editar" : "Novo" }} Condomínio</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="nome">Nome *</label>
          <input id="nome" formControlName="nome" />
          @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
          <span class="error">Nome é obrigatório</span>
          }
        </div>

        <div class="form-field">
          <label for="cnpj">CNPJ *</label>
          <input id="cnpj" formControlName="cnpj" />
        </div>

        <div class="form-field">
          <label for="endereco">Endereço *</label>
          <input id="endereco" formControlName="endereco" />
        </div>

        <div class="form-field">
          <label for="telefone">Telefone *</label>
          <input id="telefone" formControlName="telefone" />
        </div>

        <div class="form-field">
          <label for="email">Email *</label>
          <input id="email" type="email" formControlName="email" />
        </div>

        <button type="submit" [disabled]="form.invalid">Salvar</button>
        <button type="button" (click)="cancel()">Cancelar</button>
      </form>
    </div>
  `,
})
export class CondominioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CondominioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = false;
  condominioId?: string;

  ngOnInit(): void {
    this.buildForm();
    this.condominioId = this.route.snapshot.paramMap.get("id") || undefined;

    if (this.condominioId) {
      this.isEdit = true;
      this.loadCondominio(this.condominioId);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      nome: ["", [Validators.required]],
      cnpj: ["", [Validators.required]],
      endereco: ["", [Validators.required]],
      telefone: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
    });
  }

  loadCondominio(id: string): void {
    this.service.getById(id).subscribe({
      next: (data) => this.form.patchValue(data),
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const request = this.isEdit
        ? this.service.update(this.condominioId!, this.form.value)
        : this.service.create(this.form.value);

      request.subscribe({
        next: () => this.router.navigate(["/condominios"]),
        error: (err) => alert("Erro ao salvar"),
      });
    }
  }

  cancel(): void {
    this.router.navigate(["/condominios"]);
  }
}
```

---

## 📅 FASE 4: Testes Unitários com Jest (Dia 8)

### 4.1 Testar Service com Mocks

**condominio.service.spec.ts**

```typescript
import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { CondominioService } from "./condominio.service";
import { Condominio } from "@shared/models/condominio.model";

describe("CondominioService", () => {
  let service: CondominioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CondominioService],
    });
    service = TestBed.inject(CondominioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("deve listar condominios", () => {
    const mockCondominios: Condominio[] = [
      {
        id: "1",
        nome: "Condomínio Teste",
        cnpj: "12345678000190",
        endereco: "Rua Teste, 123",
        telefone: "11999999999",
        email: "teste@teste.com",
        empresaId: "1",
        dataCriacao: new Date(),
      },
    ];

    service.getAll().subscribe((condominios) => {
      expect(condominios.length).toBe(1);
      expect(condominios[0].nome).toBe("Condomínio Teste");
    });

    const req = httpMock.expectOne("http://localhost:5000/api/condominios");
    expect(req.request.method).toBe("GET");
    req.flush(mockCondominios);
  });

  it("deve criar condominio", () => {
    const newCondominio = {
      nome: "Novo Condomínio",
      cnpj: "12345678000190",
      endereco: "Rua Nova, 456",
      telefone: "11888888888",
      email: "novo@teste.com",
    };

    service.create(newCondominio).subscribe((result) => {
      expect(result.id).toBeDefined();
      expect(result.nome).toBe("Novo Condomínio");
    });

    const req = httpMock.expectOne("http://localhost:5000/api/condominios");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(newCondominio);
    req.flush({
      id: "2",
      ...newCondominio,
      empresaId: "1",
      dataCriacao: new Date(),
    });
  });
});
```

### 4.2 Testar Componente

**condominio-list.component.spec.ts**

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CondominioListComponent } from "./condominio-list.component";
import { CondominioService } from "../../services/condominio.service";

describe("CondominioListComponent", () => {
  let component: CondominioListComponent;
  let fixture: ComponentFixture<CondominioListComponent>;
  let mockService: jest.Mocked<CondominioService>;

  beforeEach(async () => {
    mockService = {
      getAll: jest.fn(),
      delete: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [CondominioListComponent],
      providers: [{ provide: CondominioService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CondominioListComponent);
    component = fixture.componentInstance;
  });

  it("deve carregar condominios no init", () => {
    const mockData = [
      {
        id: "1",
        nome: "Teste",
        cnpj: "123",
        endereco: "End",
        telefone: "11",
        email: "a@a.com",
        empresaId: "1",
        dataCriacao: new Date(),
      },
    ];
    mockService.getAll.mockReturnValue(of(mockData));

    fixture.detectChanges();

    expect(component.condominios()).toEqual(mockData);
    expect(component.loading()).toBe(false);
  });

  it("deve mostrar erro ao falhar no carregamento", () => {
    mockService.getAll.mockReturnValue(throwError(() => new Error("Erro")));

    fixture.detectChanges();

    expect(component.error()).toBe("Erro ao carregar condomínios");
    expect(component.loading()).toBe(false);
  });

  it("deve excluir condominio", () => {
    mockService.delete.mockReturnValue(of(void 0));
    mockService.getAll.mockReturnValue(of([]));
    jest.spyOn(window, "confirm").mockReturnValue(true);

    component.delete("1");

    expect(mockService.delete).toHaveBeenCalledWith("1");
  });
});
```

---

## 📅 FASE 5: Testes E2E com Cypress (Dia 9)

**cypress/e2e/condominios.cy.ts**

```typescript
describe("Condominios CRUD", () => {
  beforeEach(() => {
    cy.visit("/condominios");
  });

  it("deve listar condominios", () => {
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
  });

  it("deve criar novo condominio", () => {
    cy.contains("Novo Condomínio").click();

    cy.get("#nome").type("Condomínio Cypress");
    cy.get("#cnpj").type("12345678000190");
    cy.get("#endereco").type("Rua Cypress, 100");
    cy.get("#telefone").type("11999887766");
    cy.get("#email").type("cypress@test.com");

    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/condominios");
    cy.contains("Condomínio Cypress").should("be.visible");
  });

  it("deve validar campos obrigatórios", () => {
    cy.contains("Novo Condomínio").click();
    cy.get('button[type="submit"]').click();

    cy.contains("Nome é obrigatório").should("be.visible");
  });

  it("deve editar condominio existente", () => {
    cy.get("table tbody tr").first().contains("Editar").click();

    cy.get("#nome").clear().type("Nome Editado");
    cy.get('button[type="submit"]').click();

    cy.contains("Nome Editado").should("be.visible");
  });
});
```

---

## 📅 FASE 6: CI/CD (Dias 10-11)

### 6.1 Backend CI/CD (.NET)

**.github/workflows/backend-ci.yml**

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "src/**"
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "8.0.x"

      - name: Restore dependencies
        run: dotnet restore src/InterceptorSystem.sln

      - name: Build
        run: dotnet build src/InterceptorSystem.sln --no-restore --configuration Release

      - name: Run Unit Tests
        run: dotnet test src/InterceptorSystem.Tests/InterceptorSystem.Tests.csproj --no-build --configuration Release --verbosity normal --filter "FullyQualifiedName~Unity"

      - name: Run Integration Tests
        run: dotnet test src/InterceptorSystem.Tests/InterceptorSystem.Tests.csproj --no-build --configuration Release --verbosity normal --filter "FullyQualifiedName~Integration"

  build-docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Image
        run: |
          cd src
          docker build -f InterceptorSystem.Api/Dockerfile -t interceptor-api:${{ github.sha }} .

      - name: Push to Registry (exemplo AWS ECR)
        run: |
          # aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
          # docker tag interceptor-api:${{ github.sha }} <account>.dkr.ecr.us-east-1.amazonaws.com/interceptor-api:latest
          # docker push <account>.dkr.ecr.us-east-1.amazonaws.com/interceptor-api:latest
          echo "Simulando push para registry"
```

### 6.2 Frontend CI/CD (Angular)

**.github/workflows/frontend-ci.yml**

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "frontend/**"
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Lint
        working-directory: frontend
        run: npm run lint

      - name: Unit Tests
        working-directory: frontend
        run: npm run test:coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./frontend/coverage/lcov.info

      - name: Build
        working-directory: frontend
        run: npm run build -- --configuration production

      - name: E2E Tests
        working-directory: frontend
        run: npm run e2e:ci

  build-docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Image
        working-directory: frontend
        run: docker build -t interceptor-frontend:${{ github.sha }} .

      - name: Deploy to S3 + CloudFront (exemplo AWS)
        working-directory: frontend
        run: |
          # aws s3 sync dist/frontend s3://interceptor-app --delete
          # aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
          echo "Simulando deploy para S3/CloudFront"
```

### 6.3 Dockerfile para Angular

**frontend/Dockerfile**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve com NGINX
FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📅 FASE 7: Docker Compose Full Stack (Dia 12)

**docker-compose.fullstack.yml** (raiz do projeto)

```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-interceptor_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./src
      dockerfile: InterceptorSystem.Api/Dockerfile
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__DefaultConnection: "Host=db;Database=${POSTGRES_DB:-interceptor_db};Username=${POSTGRES_USER:-postgres};Password=${POSTGRES_PASSWORD:-postgres}"
    ports:
      - "5000:8080"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - backend
    environment:
      API_URL: http://backend:5000

volumes:
  postgres_data:
```

**Comandos:**

```bash
# Subir full stack
docker compose -f docker-compose.fullstack.yml up --build

# Acessar aplicação
# Frontend: http://localhost:4200
# Backend: http://localhost:5000/swagger
```

---

## 🎯 Próximos Módulos (Após Condominios)

### Ordem Sugerida de Implementação:

1. ✅ **Condominios** (CRUD básico - fundação)
2. **Funcionários** (enums complexos, validação de CPF, máscaras)
3. **Postos de Trabalho** (relacionamento N:1 com Condomínios)
4. **Alocações** (relacionamentos múltiplos + regras de negócio complexas)
5. **Contratos** (ciclo de vida, status transitions)

### Para cada módulo, repetir:

- Service + Models
- Componentes (List, Form, Detail)
- Testes Unitários (Service + Components)
- Testes E2E
- Documentação

---

## 📊 Métricas de Qualidade

### Metas de Cobertura:

- **Unit Tests**: >= 80%
- **E2E**: Cenários críticos (Happy Path + 1 Sad Path por feature)
- **Lint**: 0 erros, <= 5 warnings

### Performance:

- **Lighthouse Score**: >= 90 (Performance, Accessibility, Best Practices)
- **Bundle Size**: <= 500KB (inicial gzipped)
- **First Contentful Paint**: <= 1.5s

---

## 🛠 Ferramentas Recomendadas

### VSCode Extensions:

- Angular Language Service
- Angular Schematics
- Jest Runner
- Prettier
- ESLint

### Chrome DevTools:

- Angular DevTools (extensão)
- Lighthouse

---

## 📚 Recursos de Aprendizado

1. **Angular Docs**: https://angular.dev
2. **RxJS Marbles**: https://rxmarbles.com
3. **Testing Library**: https://testing-library.com/docs/angular-testing-library/intro
4. **Cypress Best Practices**: https://docs.cypress.io/guides/references/best-practices

---

## 🚨 Boas Práticas & Pitfalls

### ✅ Fazer:

- Usar Signals para estado local simples
- RxJS para operações assíncronas e streams
- Standalone Components (padrão Angular 18+)
- Lazy Loading de módulos
- OnPush Change Detection quando possível
- Unsubscribe (usar `takeUntilDestroyed()`)

### ❌ Evitar:

- Lógica de negócio em componentes (use services)
- Subscriptions sem cleanup
- Usar `any` em TypeScript
- Mutations diretas de arrays/objetos (usar imutabilidade)

---

## 💡 Sugestões de Melhorias Futuras

1. **BFF Layer**: Agregar dados de múltiplas APIs
2. **NgRx/Signal Store**: Gerenciamento de estado global
3. **Autenticação JWT**: OAuth2 + Azure AD/Auth0
4. **Observabilidade**: Application Insights / Datadog
5. **Micro-frontends**: Module Federation (quando escalar)
6. **PWA**: Service Workers para offline-first
7. **Internacionalização**: i18n para PT/EN
8. **Design System**: Biblioteca de componentes customizada

---

## ✅ Checklist de Entrega

- [ ] Angular workspace configurado
- [ ] CORS habilitado no backend
- [ ] Módulo Core (Interceptors, Guards)
- [ ] Módulo Shared (Models, Pipes, Components)
- [ ] Módulo Condominios completo (CRUD + Testes)
- [ ] Jest configurado e >= 80% coverage
- [ ] Cypress com cenários críticos
- [ ] CI/CD Backend funcionando
- [ ] CI/CD Frontend funcionando
- [ ] Docker Compose Full Stack
- [ ] README atualizado com instruções

---

**Próximos Passos Imediatos:**

1. Executar `npx @angular/cli@latest new frontend`
2. Configurar CORS no [Program.cs](src/InterceptorSystem.Api/Program.cs)
3. Implementar primeiro endpoint (Condominios/GetAll)

Deseja que eu comece criando a estrutura inicial do Angular agora?
