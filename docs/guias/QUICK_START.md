# 🚀 Guia Rápido de Desenvolvimento

---

## 📋 Comandos Essenciais

### **Rodar Testes**
```bash
cd src
dotnet test InterceptorSystem.Tests/
```

### **Subir Ambiente Docker**
```bash
cd src
docker compose up -d
```

### **Criar Migration**
```bash
cd src/InterceptorSystem.Infrastructure
dotnet ef migrations add NomeDaMigracao --startup-project ../InterceptorSystem.Api
dotnet ef database update --startup-project ../InterceptorSystem.Api
```

### **Acessar Swagger**
```
http://localhost/swagger
```

---

## 🏗️ Estrutura do Projeto

```
src/
├── InterceptorSystem.Api/              # Controllers, Endpoints
├── InterceptorSystem.Application/      # Services, DTOs
├── InterceptorSystem.Domain/           # Entidades, Regras
├── InterceptorSystem.Infrastructure/   # EF, Repositories
└── InterceptorSystem.Tests/            # Testes
    ├── Unity/                          # Testes unitários
    └── Integration/                    # Testes de integração
```

---

## ✅ Regras de Negócio Principais

### **Condomínio**
- CNPJ único por empresa
- Define quantidade ideal de funcionários e horário de troca

### **Funcionário**
- CPF único global
- DEVE estar vinculado a contrato vigente
- Salários calculados automaticamente do contrato

### **PostoDeTrabalho**
- Turnos de **exatamente 12 horas**
- Quantidade de funcionários calculada do condomínio

### **Alocação**
- NÃO permite dias consecutivos (exceto DOBRA_PROGRAMADA)
- Descanso obrigatório após dobra
- Um funcionário = uma alocação por vez

### **Contrato**
- Apenas 1 contrato vigente por condomínio
- Auto-finaliza quando `DataFim` < hoje
- Margens de lucro e faltas DEVEM ser consideradas

---

## 🎯 Endpoints Principais

### **Criação Completa (FASE 5)**
```http
POST /api/condominios-completos
POST /api/condominios-completos/validar
```

### **Cálculo de Contrato**
```http
POST /api/contratos/calculos/calcular-valor-total
```

### **CRUD Básico**
```http
GET/POST/PUT/DELETE /api/condominios
GET/POST/PUT/DELETE /api/contratos
GET/POST/PUT/DELETE /api/funcionarios
GET/POST/PUT/DELETE /api/postos-de-trabalho
GET/POST/PUT/DELETE /api/alocacoes
```

---

## 🧪 Testes

**Rodar todos:**
```bash
dotnet test
```

**Rodar apenas unitários:**
```bash
dotnet test --filter "FullyQualifiedName~Unity"
```

**Rodar apenas integração:**
```bash
dotnet test --filter "FullyQualifiedName~Integration"
```

---

## 📁 Payloads de Teste

Localizados em: `src/docs/test-payloads/`

- `condominios.json`
- `contratos.json`
- `funcionarios.json`
- `postos-de-trabalho.json`
- `alocacoes.json`
- `condominio-completo.json` (FASE 5)

---

## 🐛 Troubleshooting

### **Testes falhando?**
1. Verificar se migrations estão aplicadas
2. Verificar se banco está rodando (Docker)
3. Limpar bin/obj: `dotnet clean`

### **Erro de tenant?**
Todo request precisa estar no contexto de uma empresa (`EmpresaId`).

### **Erro de contrato expirado?**
Verificar se `DataFim` >= hoje.

---

## 📚 Documentação Completa

- `README.md` - Visão geral
- `docs/refatoracao/` - Guias das 5 fases
- `docs/problemas-corrigidos/` - Bugs resolvidos
- `docs/guias/` - Este arquivo

---

**Última Atualização:** 2026-01-08

