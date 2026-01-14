# 📋 Arquivos Ignorados pelo Git

Este documento explica quais arquivos e diretórios **NÃO devem** ser enviados ao repositório GitHub.

## ✅ Arquivos Removidos do Repositório

### 🔧 .NET / C# (Backend)
Todos os arquivos de **build** e **compilação** foram removidos:

#### **Diretórios:**
- `bin/` - Executáveis e DLLs compiladas
- `obj/` - Arquivos intermediários de compilação
- `.vs/` - Configurações do Visual Studio
- `.idea/` - Configurações do JetBrains Rider
- `TestResults/` - Resultados de testes

#### **Arquivos:**
- `*.dll` - Bibliotecas compiladas (ex: `InterceptorSystem.Api.dll`)
- `*.exe` - Executáveis
- `*.pdb` - Símbolos de debug
- `*.cache` - Arquivos de cache do compilador
- `*.user` - Configurações pessoais do usuário
- `*.AssemblyInfo.cs` - Informações de assembly (auto-geradas)
- `*.AssemblyInfoInputs.cache` - Cache de assembly
- `rider.project.model.nuget.info` - Informações do Rider
- `project.packagespec.json` - Especificações de pacotes

#### **Por que remover?**
- ✅ Arquivos gerados automaticamente pelo compilador
- ✅ Específicos de cada máquina/desenvolvedor
- ✅ Podem causar conflitos entre diferentes ambientes
- ✅ Aumentam desnecessariamente o tamanho do repositório
- ✅ Podem conter informações sensíveis (paths absolutos)

---

### 🎨 Angular / Node.js (Frontend)
Arquivos de dependências e build do frontend:

#### **Diretórios:**
- `node_modules/` - Dependências do NPM (milhares de arquivos!)
- `dist/` - Build de produção do Angular
- `.angular/` - Cache do Angular CLI
- `tmp/` - Arquivos temporários

#### **Arquivos:**
- `package-lock.json` - Lock file do NPM (opcional)
- `npm-debug.log` - Logs de erro do NPM
- `*.log` - Logs diversos

#### **Por que remover?**
- ✅ `node_modules/` sozinho tem **milhares de arquivos** e pode ter **centenas de MB**
- ✅ Podem ser recriados com `npm install`
- ✅ O `package.json` já contém todas as informações necessárias
- ✅ Builds de produção não devem estar no repositório de código

---

### 🔐 Arquivos Sensíveis

#### **Environment:**
- `.env` - Variáveis de ambiente (SENHAS, CONEXÕES)
- `.env.*` - Variações do .env
- `appsettings.*.local.json` - Configurações locais
- `launchSettings.json` - Configurações de launch

#### **Por que remover?**
- ⚠️ **SEGURANÇA**: Contém senhas, connection strings, secrets
- ⚠️ Específicos de cada ambiente (dev, staging, prod)
- ✅ Use `.env.example` como template

---

### 🗄️ Database
- `*.sqlite` / `*.db` - Bancos de dados locais
- `*.mdf` / `*.ldf` - SQL Server data files

---

## 📦 O Que DEVE Estar no Repositório

### ✅ Código Fonte:
- `*.cs` - Código C#
- `*.ts` / `*.html` / `*.scss` - Código Angular
- `*.csproj` - Arquivos de projeto .NET
- `*.sln` - Solução do Visual Studio

### ✅ Configurações:
- `package.json` - Dependências do NPM
- `angular.json` - Configuração do Angular
- `tsconfig.json` - Configuração do TypeScript
- `appsettings.json` - Configurações base (SEM senhas)
- `Dockerfile` / `docker-compose.yml` - Configurações Docker
- `.env.example` - Template de variáveis de ambiente

### ✅ Documentação:
- `README.md` - Documentação principal
- `docs/` - Documentação adicional
- SQL scripts de exemplo

---

## 🚀 Como Usar Após Clonar

### Backend (.NET):
```bash
cd src
dotnet restore  # Restaura pacotes NuGet
dotnet build    # Compila o projeto (cria bin/ e obj/)
```

### Frontend (Angular):
```bash
cd frontend
npm install     # Instala dependências (cria node_modules/)
npm start       # Inicia servidor de desenvolvimento
```

### Docker:
```bash
# Copiar .env.example para .env e configurar
cp .env.example .env
nano .env  # Editar com suas configurações

# Subir containers
docker-compose up -d
```

---

## 📊 Estatísticas

### Arquivos Removidos do Git:
- **147 arquivos** de build (.dll, .cache, .pdb, AssemblyInfo, etc.)
- Diretórios `bin/` e `obj/` de todos os projetos
- Configurações IDE específicas

### Benefícios:
- ✅ Repositório **muito mais leve**
- ✅ **Sem conflitos** de merge em arquivos de build
- ✅ **Mais seguro** (sem arquivos sensíveis)
- ✅ **Builds limpos** em cada clone
- ✅ CI/CD mais eficiente

---

## 🛡️ Checklist de Segurança

Antes de fazer commit, verifique:

- [ ] Nenhum arquivo `.env` está sendo commitado
- [ ] Nenhuma senha ou API key no código
- [ ] `bin/` e `obj/` não estão no staging
- [ ] `node_modules/` não está sendo rastreado
- [ ] Arquivos `.user` e `.cache` ignorados
- [ ] Connection strings sem senhas reais

---

## 📝 Comandos Úteis Git

```bash
# Ver arquivos ignorados
git status --ignored

# Remover arquivo do tracking (mas manter local)
git rm --cached arquivo.txt

# Verificar tamanho do repositório
git count-objects -vH

# Limpar cache do git
git rm -r --cached .
git add .
```

---

## 🔄 Atualização do .gitignore

O `.gitignore` foi atualizado com regras abrangentes para:
- ✅ .NET 8
- ✅ Angular 18
- ✅ JetBrains Rider
- ✅ Visual Studio Code
- ✅ Docker
- ✅ Node.js
- ✅ Arquivos de ambiente

**Total de regras:** 150+ padrões ignorados

---

**Última atualização:** 2026-01-14

