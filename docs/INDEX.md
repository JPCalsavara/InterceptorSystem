# 📚 ÍNDICE DA DOCUMENTAÇÃO - InterceptorSystem

**Última atualização:** 2026-01-14  
**Status:** ✅ ORGANIZADO

---

## 🗂️ ESTRUTURA ATUAL

```
docs/
├── backend/                           # Documentação do backend .NET
│   └── (vários arquivos de refatoração)
├── frontend/                          # Documentação do frontend Angular
│   ├── REFATORACAO_FRONTEND_RESUMO.md ⭐ PRINCIPAL
│   └── refatoração-front-1/           ⚠️ OBSOLETO (22 arquivos)
│       └── _ARQUIVOS_OBSOLETOS.md
├── guias/
│   └── QUICK_START.md                 # Guia de início rápido
├── problemas-corrigidos/
│   ├── ANALISE_TESTES_FALTANTES.md
│   ├── AUTENTICACAO_TESTES_CORRIGIDA.md
│   ├── BUGS_CRITICOS_RESOLVIDOS.md
│   ├── TESTES_REVISADOS_COMPLETO.md
│   └── TIPO_ESCALA_12X36_CORRIGIDO.md
├── ESTRUTURA_DOCUMENTACAO.md
├── INDEX.md
├── REFATORACAO_DOCS_COMPLETA.md
└── RESUMO_REFATORACAO.md
```

---

## 📋 DOCUMENTOS PRINCIPAIS (LEITURA OBRIGATÓRIA)

### **🎯 Para Novos Desenvolvedores:**

1. **Início Rápido**
   - 📄 `guias/QUICK_START.md`
   - 🐳 `/DOCKER_GUIDE.md` (raiz do projeto)
   - 📖 `/README.md` (raiz do projeto)

2. **Arquitetura do Sistema**
   - 🏗️ `ESTRUTURA_DOCUMENTACAO.md`
   - 📊 Diagrama MER (em desenvolvimento)

---

## 🔧 DOCUMENTAÇÃO TÉCNICA

### **Backend (.NET 8):**

#### **Refatoração (5 Fases):**
- 📄 `RESUMO_REFATORACAO.md` (resumo executivo)
- 📄 `REFATORACAO_DOCS_COMPLETA.md` (detalhado)
- 📂 `backend/` (arquivos específicos de cada fase)

#### **Testes:**
- 📄 `problemas-corrigidos/TESTES_REVISADOS_COMPLETO.md`
- 📄 `problemas-corrigidos/AUTENTICACAO_TESTES_CORRIGIDA.md`

#### **Bugs Corrigidos:**
- 📄 `problemas-corrigidos/BUGS_CRITICOS_RESOLVIDOS.md`
- 📄 `problemas-corrigidos/TIPO_ESCALA_12X36_CORRIGIDO.md`

---

### **Frontend (Angular 18):**

#### **⭐ ARQUIVO PRINCIPAL:**
- 📄 **`frontend/REFATORACAO_FRONTEND_RESUMO.md`** ← USE ESTE!

**Conteúdo:**
- ✅ Fase 1: Correções iniciais
- ✅ Fase 2: Integração com backend
- ✅ Fase 3: Visualizações de alocações (3 modos)
- ✅ Fase 4: Dashboard avançado
- ✅ Fase 5: Melhorias de UX
- ✅ Tema azul bebê (light mode)
- ✅ Estatísticas completas (31 arquivos, 3.800+ linhas)

#### **⚠️ PASTA OBSOLETA:**
- 📂 `frontend/refatoração-front-1/` (22 arquivos desatualizados)
- 📄 `frontend/refatoração-front-1/_ARQUIVOS_OBSOLETOS.md`

**NÃO USE** os arquivos desta pasta! Foram consolidados no resumo único.

---

## 🐳 DOCKER & INFRAESTRUTURA

### **Guias Docker:**
- 📄 `/DOCKER_GUIDE.md` ⭐ COMPLETO
- 📄 `/backend/src/compose.yaml` (configuração principal)
- 📄 `/backend/src/compose.override.yml` (dev mode)
- 📄 `/.env.example` (template de variáveis)

### **Serviços:**
1. PostgreSQL (banco de dados)
2. API .NET (backend)
3. Frontend Angular (novo!)
4. Nginx (reverse proxy)

---

## 🔐 SEGURANÇA & ARQUIVOS IGNORADOS

### **Documentação:**
- 📄 `/GITIGNORE_EXPLAINED.md` ⭐ GUIA COMPLETO
- 📄 `/.gitignore` (221 arquivos removidos)

### **Arquivos que NÃO devem ir para o GitHub:**
- ❌ `bin/`, `obj/` (build .NET)
- ❌ `*.dll`, `*.exe`, `*.pdb`
- ❌ `node_modules/`, `dist/` (Node/Angular)
- ❌ `.env` (senhas e conexões)
- ❌ Arquivos IDE (`.idea/`, `.vs/`)

---

## 🧪 CI/CD

### **GitHub Actions:**
- 📄 `/.github/workflows/ci.yml`

**Jobs:**
1. ✅ Backend (.NET) - Build + Testes
2. ✅ Frontend (Angular) - Build + Testes ⭐ NOVO!
3. ✅ Docker Build - Validação

---

## 📊 REGRAS DE NEGÓCIO

### **Entidades Principais:**
1. **Condomínio**
   - Quantidade de funcionários ideal
   - Horário de troca de turno
   - Email gestor, telefone emergência

2. **Contrato**
   - Valores calculados no backend
   - Status: ATIVO, PENDENTE, FINALIZADO
   - Margem de lucro e cobertura de faltas

3. **Funcionário**
   - Tipo: CLT, Terceirizado, Freelance
   - Escala: 12x36, 6x1, 5x2, Diurno, Noturno
   - Vinculado a contrato

4. **Posto de Trabalho**
   - Horário início e fim (diferença de 12h)
   - Permite dobrar escala
   - Capacidade máxima por dobras

5. **Alocação**
   - Status: CONFIRMADA, CANCELADA, FALTA_REGISTRADA
   - Tipo: REGULAR, DOBRA_PROGRAMADA, SUBSTITUICAO
   - Regras de duplicação (não consecutivas)

### **Documentação Detalhada:**
- 📄 `frontend/REFATORACAO_FRONTEND_RESUMO.md` (seção Regras)
- 📄 `README.md` (seção Cenários de Uso)

---

## 🗺️ ROADMAP

### **✅ Concluído (v2.0):**
- ✅ Refatoração backend (5 fases)
- ✅ Refatoração frontend (5 fases)
- ✅ Docker Compose completo
- ✅ CI/CD com testes
- ✅ Documentação consolidada

### **🔄 Em Andamento:**
- 🔄 Wizard de criação de condomínio
- 🔄 Testes E2E
- 🔄 Relatórios em PDF

### **📋 Backlog:**
- [ ] Autenticação e autorização
- [ ] Multi-tenancy
- [ ] Notificações em tempo real
- [ ] Gráficos e dashboards avançados
- [ ] App mobile

---

## 📝 COMO CONTRIBUIR

### **1. Antes de Codificar:**
- Leia `README.md`
- Leia `DOCKER_GUIDE.md`
- Configure ambiente com `.env.example`

### **2. Padrões de Código:**

**Backend:**
- Clean Architecture
- SOLID principles
- Unit + Integration tests
- Migrations com Entity Framework

**Frontend:**
- Standalone components
- Signals (Angular 18)
- Reactive forms
- SCSS modular

### **3. Commits:**
```bash
# Formato
tipo(escopo): mensagem

# Exemplos
feat(condominio): adicionar wizard de criação
fix(alocacao): corrigir cálculo de dobras
docs(readme): atualizar guia de instalação
chore(deps): atualizar dependências Angular
```

### **4. Pull Requests:**
- Criar branch: `feature/nome-da-feature`
- CI deve passar (backend + frontend + docker)
- Revisar documentação se necessário

---

## 🆘 TROUBLESHOOTING

### **Problema: Documentação confusa/duplicada**
✅ **Solução:** Use SEMPRE os arquivos principais marcados com ⭐

### **Problema: Arquivos de build no Git**
✅ **Solução:** Leia `GITIGNORE_EXPLAINED.md`

### **Problema: Docker não sobe**
✅ **Solução:** Leia `DOCKER_GUIDE.md` seção Troubleshooting

### **Problema: Testes falhando no CI**
✅ **Solução:** Verifique:
1. PostgreSQL está configurado? (backend)
2. Build de produção passa? (frontend)
3. Migrations estão atualizadas?

---

## 📧 CONTATO

**Arquiteto do Projeto:** GitHub Copilot  
**Documentação:** Mantida pela equipe de desenvolvimento  

---

## ✅ CHECKLIST DE LEITURA

### **Para Novos Desenvolvedores:**
- [ ] Li o `README.md` principal
- [ ] Li o `DOCKER_GUIDE.md`
- [ ] Configurei o `.env` local
- [ ] Subi o ambiente com Docker
- [ ] Li `frontend/REFATORACAO_FRONTEND_RESUMO.md`
- [ ] Entendi a estrutura do projeto

### **Para Code Review:**
- [ ] CI passou (verde)
- [ ] Documentação atualizada (se necessário)
- [ ] Testes adicionados/atualizados
- [ ] Sem arquivos de build commitados
- [ ] `.gitignore` respeitado

---

**Última atualização:** 2026-01-14  
**Versão:** 2.0  
**Status:** ✅ DOCUMENTAÇÃO CONSOLIDADA

