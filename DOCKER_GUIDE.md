# 🐳 Docker Compose - Guia Completo

## 📁 Nova Estrutura do Projeto

```
InterceptorSystem/
├── backend/
│   └── src/                    # Código .NET
│       ├── compose.yaml        # Docker Compose principal
│       ├── compose.override.yml # Override para desenvolvimento
│       ├── nginx.conf          # Configuração Nginx
│       ├── InterceptorSystem.Api/
│       ├── InterceptorSystem.Application/
│       ├── InterceptorSystem.Domain/
│       ├── InterceptorSystem.Infrastructure/
│       └── InterceptorSystem.Tests/
├── frontend/                   # Código Angular
│   ├── Dockerfile              # Multi-stage: dev e prod
│   ├── nginx-frontend.conf     # Config nginx do frontend
│   ├── src/
│   └── package.json
├── docs/                       # Documentação
├── .env                        # Variáveis de ambiente (NÃO commitar!)
└── .env.example                # Template de .env
```

---

## 🚀 Como Usar

### **1. Configurar Variáveis de Ambiente**

```bash
# Copiar template
cp .env.example .env

# Editar com suas configurações
nano .env
```

### **2. Subir Aplicação Completa (Desenvolvimento)**

```bash
cd backend/src

# Subir todos os serviços (DB + API + Frontend + Nginx)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Apenas logs da API
docker-compose logs -f api

# Apenas logs do Frontend
docker-compose logs -f frontend
```

### **3. Acessar Aplicação**

- **Frontend:** http://localhost
- **API (via Nginx):** http://localhost/api
- **Swagger:** http://localhost/swagger
- **Frontend (direto - dev):** http://localhost:4200 (com hot-reload)

---

## 🛠️ Serviços Configurados

### **1. Database (PostgreSQL)**
- **Container:** `interceptor_db`
- **Porta:** 5432
- **Volume:** `postgres_data` (persistência)
- **Healthcheck:** Verifica se está pronto antes de subir a API

### **2. API (.NET 8)**
- **Container:** `interceptor_api`
- **Porta interna:** 8080 (não exposta, apenas via Nginx)
- **Modo Dev:** `dotnet watch run` (hot-reload)
- **Volume montado:** código local em `/src`

### **3. Frontend (Angular 18)**
- **Container:** `interceptor_frontend`
- **Porta dev:** 4200 (exposta apenas em dev)
- **Porta prod:** 80 (servida pelo nginx interno)
- **Modo Dev:** `npm start` com hot-reload
- **Volume montado:** código local em `/app`

### **4. Nginx (Reverse Proxy)**
- **Container:** `interceptor_nginx`
- **Porta:** 80 (única porta exposta ao mundo externo)
- **Roteamento:**
  - `/` → Frontend Angular
  - `/api/*` → API .NET
  - `/swagger` → Swagger UI
  - Assets estáticos → Cache de 1 ano

---

## 🔄 Modos de Operação

### **Desenvolvimento (com compose.override.yml)**

Quando você roda `docker-compose up`, ele automaticamente aplica o `compose.override.yml`:

- **API:** Hot-reload com `dotnet watch`
- **Frontend:** Hot-reload com `npm start`
- **Volumes:** Código local montado
- **Porta 4200:** Exposta para debug direto do Angular

### **Produção (sem override)**

```bash
# Build e subir em modo produção
docker-compose -f compose.yaml up -d --build

# Ou explicitamente
docker-compose --profile production up -d
```

- **API:** Build otimizado (sem watch)
- **Frontend:** Build de produção (AOT, minificado)
- **Sem volumes:** Código copiado para o container
- **Performance máxima**

---

## 📋 Comandos Úteis

### **Gerenciamento de Containers**

```bash
# Ver status
docker-compose ps

# Parar todos
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar e remover TUDO (incluindo volumes)
docker-compose down -v

# Rebuild forçado
docker-compose up -d --build --force-recreate
```

### **Logs e Debug**

```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f nginx

# Últimas 100 linhas
docker-compose logs --tail=100 -f
```

### **Executar Comandos Dentro dos Containers**

```bash
# Entrar no container da API
docker-compose exec api bash

# Rodar migrations
docker-compose exec api dotnet ef database update

# Entrar no container do frontend
docker-compose exec frontend sh

# Instalar nova dependência
docker-compose exec frontend npm install nome-pacote
```

### **Banco de Dados**

```bash
# Conectar ao PostgreSQL
docker-compose exec db psql -U admin -d interceptor_db

# Backup do banco
docker-compose exec db pg_dump -U admin interceptor_db > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U admin interceptor_db < backup.sql
```

---

## 🔧 Troubleshooting

### **Problema: Frontend não carrega**

```bash
# Verificar logs
docker-compose logs frontend

# Rebuild do frontend
docker-compose up -d --build frontend

# Limpar cache do npm
docker-compose exec frontend npm cache clean --force
docker-compose restart frontend
```

### **Problema: API não conecta ao banco**

```bash
# Verificar se o banco está saudável
docker-compose ps

# Ver logs do banco
docker-compose logs db

# Testar conexão
docker-compose exec api dotnet ef database update
```

### **Problema: Mudanças não aparecem (hot-reload não funciona)**

```bash
# Reiniciar serviço
docker-compose restart api
docker-compose restart frontend

# Verificar se volumes estão montados
docker-compose exec api ls -la /src
docker-compose exec frontend ls -la /app
```

### **Problema: Porta 80 já está em uso**

```bash
# Ver o que está usando a porta
sudo lsof -i :80

# Mudar porta no compose.yaml
# De: - "80:80"
# Para: - "8080:80"
# Acessar: http://localhost:8080
```

---

## 🎯 Fluxo de Desenvolvimento Típico

```bash
# 1. Iniciar ambiente
cd backend/src
docker-compose up -d

# 2. Verificar se tudo subiu
docker-compose ps

# 3. Desenvolver normalmente
# As mudanças serão detectadas automaticamente!

# 4. Ver logs se necessário
docker-compose logs -f api

# 5. Ao finalizar o dia
docker-compose stop

# 6. No dia seguinte
docker-compose start
```

---

## 🧪 Testes

### **Backend**

```bash
# Rodar testes dentro do container
docker-compose exec api dotnet test

# Rodar testes localmente (sem Docker)
cd backend/src
dotnet test
```

### **Frontend**

```bash
# Rodar testes dentro do container
docker-compose exec frontend npm test

# Rodar testes localmente (sem Docker)
cd frontend
npm test
```

---

## 🌐 Arquitetura de Rede

```
┌─────────────────────────────────────────────────┐
│ Host Machine (localhost)                       │
│                                                 │
│  Port 80                                        │
│    │                                            │
│    v                                            │
│ ┌─────────────────────────────────────────┐   │
│ │ Nginx (Reverse Proxy)                    │   │
│ │  - Routes /api/* → API                   │   │
│ │  - Routes /* → Frontend                  │   │
│ └─────┬──────────────────────┬─────────────┘   │
│       │                      │                  │
│       v                      v                  │
│ ┌───────────┐          ┌──────────────┐        │
│ │ API .NET  │          │ Frontend     │        │
│ │ (port 8080)│         │ Angular      │        │
│ │           │          │ (port 80/4200)│       │
│ └─────┬─────┘          └──────────────┘        │
│       │                                         │
│       v                                         │
│ ┌────────────┐                                 │
│ │ PostgreSQL │                                 │
│ │ (port 5432)│                                 │
│ └────────────┘                                 │
└─────────────────────────────────────────────────┘

Network: interceptor-network (bridge)
```

---

## 📝 Variáveis de Ambiente (.env)

```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=SuaSenhaForte123!
POSTGRES_DB=interceptor_db

# API
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=interceptor_db;Username=admin;Password=SuaSenhaForte123!
```

---

## 🚀 CI/CD

O GitHub Actions automaticamente:

1. ✅ **Testa Backend:** Build + Testes com PostgreSQL
2. ✅ **Testa Frontend:** Build de produção + Testes
3. ✅ **Testa Docker:** Verifica se os Dockerfiles fazem build

**Arquivo:** `.github/workflows/ci.yml`

---

## 📚 Recursos Adicionais

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [.NET Docker](https://docs.microsoft.com/en-us/dotnet/core/docker/)
- [Angular Docker](https://angular.io/guide/deployment#docker)
- [Nginx Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

---

**Última atualização:** 2026-01-14

