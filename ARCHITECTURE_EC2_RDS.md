# 🏗️ Arquitetura: EC2 + RDS

```
┌─────────────────────────────────────────────────────────────┐
│                    SUA MÁQUINA LOCAL                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ ssh -i key.pem
                       ▼
        ┌──────────────────────────────┐
        │   EC2 (ubuntu@host)          │
        │                              │
        │ ┌────────────────────────┐   │
        │ │ Docker - API Container │   │
        │ │ (porta 5000)           │   │
        │ └────────────────────────┘   │
        │                              │
        │ ┌────────────────────────┐   │
        │ │ psql (ou postgres:15)  │   │
        │ │ (client PostgreSQL)    │   │
        │ └────────┬───────────────┘   │
        └──────────│──────────────────┘
                   │
                   │ Connection String
                   │ (tcp://rds-endpoint:5432)
                   ▼
        ┌─────────────────────────────────┐
        │  RDS PostgreSQL (AWS)           │
        │  - Gerenciado pela AWS          │
        │  - Em outro servidor            │
        │  - Múltiplas AZs (backup auto)  │
        │  - Backups automatizados        │
        └─────────────────────────────────┘
```

## 📍 Como Funciona o Reset

### Opção 1a: Com psql no EC2

```bash
# Seu computador
$ ssh -i key.pem ubuntu@host

# EC2 (dentro da máquina)
ubuntu@host:~/interceptor-system$ bash backend/reset_database_rds.sh

# O que o script faz:
# 1. Carrega .env (tem connection string do RDS)
# 2. Usa psql para conectar REMOTAMENTE ao RDS
# 3. Deleta tabelas no RDS
# 4. Re-aplica migrations no RDS
# 5. Valida resultado
```

### Opção 1b: Com Docker (se psql não tiver)

```bash
# Seu computador
$ ssh -i key.pem ubuntu@host

# EC2 (dentro da máquina)
ubuntu@host:~/interceptor-system$ docker run --rm \
  --network host \
  --env-file .env \
  -v $(pwd)/backend:/app \
  postgres:15 \
  bash /app/reset_database_rds.sh

# O que acontece:
# 1. Inicia container postgres:15 (tem psql)
# 2. Container lê .env da máquina host
# 3. Container se conecta REMOTAMENTE ao RDS
# 4. Executa reset
# 5. Container para
```

### Opção 2: Usando Container da API

```bash
# Seu computador
$ ssh -i key.pem ubuntu@host

# EC2
ubuntu@host:~/interceptor-system$ docker ps
# Achar container ID da API

ubuntu@host:~/interceptor-system$ docker exec -it <api-container-id> bash

# Dentro do container (tem psql + dotnet)
root@container:/app$ bash reset_database_rds.sh

# Container da API já tem psql + dotnet
# Se conecta remotamente ao RDS para fazer reset
```

## 🎯 O Que o Script reset_database_rds.sh Faz

```
┌─────────────────────────────────────────────┐
│ 1. Carrega .env                              │
│    └─ Pega ConnectionStrings__DefaultConnection
│       (aponta para RDS remoto)               │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 2. Testa conexão com RDS                     │
│    └─ psql "$ConnectionString" -c "SELECT 1"│
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 3. Lista tabelas no RDS                      │
│    └─ Mostra quais vão ser deletadas         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 4. Pede confirmação (SIM)                    │
│    └─ Para não deletar acidentalmente       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 5. Deleta tudo do RDS                        │
│    ├─ Foreign Keys                           │
│    ├─ Tabelas                                │
│    ├─ Sequences                              │
│    └─ Views                                  │
│                                              │
│ (usa SET session_replication_role = REPLICA)│
│  (melhor performance em RDS)                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 6. Re-aplica migrations EF Core               │
│    └─ dotnet ef database update               │
│       (recria schema do zero)                │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 7. Valida resultado                          │
│    ├─ Tabelas criadas: ~20                  │
│    ├─ Migrations aplicadas: ~15             │
│    └─ Schema está correto                   │
└─────────────────────────────────────────────┘
```

## ✅ Resumo

| Onde Está | Onde Conecta | Como |
|-----------|------------|------|
| **EC2** (sua máquina na AWS) | **RDS** (outro servidor AWS) | `psql` ou `postgres:15` container |
| Script roda no EC2 | Banco fica no RDS | via connection string TCP |
| Container da API no EC2 | RDS remoto | via .env connection string |

**Importante:** RDS NÃO é um container, é um serviço gerenciado da AWS em outro servidor!
