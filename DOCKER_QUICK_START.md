# 🐳 Docker Quick Start - InterceptorSystem

## ✅ Status do Ambiente

Todos os containers foram testados e estão funcionando corretamente!

## 📦 Containers em Execução

| Serviço | Container | Porta | Status |
|---------|-----------|-------|--------|
| **PostgreSQL** | `interceptor_db` | `5432` | ✅ Healthy |
| **API .NET** | `interceptor_api` | `8080` (interno) | ✅ Running |
| **Frontend Angular** | `interceptor_frontend` | `4201:80` | ✅ Running |
| **Nginx** | `interceptor_nginx` | `80` | ✅ Running |

## 🌐 URLs de Acesso

### Backend (via Nginx)
- **API**: http://localhost/api
- **Swagger**: http://localhost/swagger

### Frontend
- **Angular App**: http://localhost:4201

### Banco de Dados
- **PostgreSQL**: `localhost:5432`
  - Usuário: `admin`
  - Senha: `password123`
  - Database: `interceptor_db`

## 🚀 Comandos Úteis

### Iniciar o Ambiente
```bash
cd backend/src
docker compose up -d
```

### Parar o Ambiente
```bash
docker compose down
```

### Ver Logs
```bash
# Todos os serviços
docker compose logs -f

# Serviço específico
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f nginx
```

### Rebuild (após mudanças no código)
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Ver Status dos Containers
```bash
docker compose ps
```

## 🧪 Testes Rápidos

### Testar API
```bash
# Listar clientes (vazio inicialmente)
curl http://localhost/api/clientes

# Acessar Swagger no navegador
xdg-open http://localhost/swagger
```

### Testar Frontend
```bash
# Abrir frontend no navegador
xdg-open http://localhost:4201
```

## 📝 Notas Importantes

1. **Modo de Desenvolvimento**: O ambiente está configurado para desenvolvimento com hot-reload tanto no backend quanto no frontend.

2. **Porta do Frontend**: Temporariamente na porta `4201` devido a um conflito com a porta `4200`.

3. **Separação de Responsabilidades**:
   - Nginx roteia **apenas** a API (rotas `/api` e `/swagger`)
   - Frontend é servido **separadamente** na porta `4201`
   - Esta configuração facilita o desenvolvimento e debugging

4. **Banco de Dados**: Os dados são persistidos no volume `postgres_data`. Use `docker compose down -v` para remover o volume e limpar os dados.

## 🔧 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker compose logs [service-name]

# Rebuild forçado
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Porta em uso
```bash
# Verificar processos usando a porta
sudo ss -tulpn | grep [porta]

# Parar todos os containers
docker compose down

# Reiniciar Docker
sudo systemctl restart docker
```

### Migrations não aplicadas
```bash
# Acessar container da API
docker exec -it interceptor_api bash

# Aplicar migrations
dotnet ef database update --project InterceptorSystem.Infrastructure --startup-project InterceptorSystem.Api
```

## ✨ Arquitetura

```
┌─────────────┐
│  Frontend   │ ──► http://localhost:4201
│  (Angular)  │
└─────────────┘

┌─────────────┐
│   Nginx     │ ──► http://localhost:80
│ (Proxy API) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API .NET   │ ──► Container interno (8080)
│  (Backend)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │ ──► localhost:5432
│   (Banco)   │
└─────────────┘
```

## 📚 Próximos Passos

1. Acessar o frontend em http://localhost:4201
2. Explorar a API através do Swagger em http://localhost/swagger
3. Cadastrar dados de teste
4. Verificar a comunicação entre frontend e backend

---

**Data do Teste**: 2026-01-14  
**Status**: ✅ Todos os serviços funcionando corretamente

