# Documentação — InterceptorSystem

**Última atualização:** 2026-03-23

---

## Estrutura

```
docs/
├── design-system/       # Tokens visuais, regras e padrões de refatoração do UI
├── guias/               # Referências de desenvolvimento e regras de negócio
├── refactory/           # Planos e tarefas de refatoração em andamento
├── reviews/             # Code reviews e análises de qualidade
└── INDEX.md             # Este arquivo
```

## Diretórios e Documentos Principais

| Diretório/Arquivo | Descrição |
| --- | --- |
| `/README.md` | Visão geral, arquitetura, domínio, Docker, infra, APIs |
| `/CHANGELOG.md` | Histórico de versões do sistema |
| `docs/design-system/` | Padrões de CSS, tokens (`DESIGN_PATTERN.md`) e plano de refatoração UI |
| `docs/guias/` | Guias de desenvolvimento, deploy, payload (`QUICK_START.md`) e regras (`analise_regras_negocio.md`) |
| `docs/refactory/` | Planos técnicos, lógicas backend/frontend e roadmap de evolução |
| `docs/reviews/` | Relatórios das reviews conduzidas (ex: Angular components styling/UI standardization) |

## Versões

- **v3.0** — Autenticação JWT, gestão de contas SaaS (FREE/BASIC/PRO), notificações por e-mail (SMTP), integração WhatsApp Bot (Meta API)
- **v2.2** — Refatoração `QuantidadeFuncionarios`: agora calculado (`QuantidadeIdealPorTurno × NumeroDePostos`)
- **v2.1** — Correção Adicional Noturno: baseado no horário do posto (CLT Art. 73)
- **v2.0** — Refatoração completa em 5 fases (criação em cascata, salários automáticos, vínculo contrato)
- **v1.0** — CRUD inicial, multi-tenant, Docker

## Troubleshooting

**Testes falhando no CI:**

1. PostgreSQL configurado no ambiente de testes?
2. Migration aplicada? (`dotnet ef database update`)
3. Build de produção passa? (`ng build --configuration=production`)

**Docker não sobe:**
Consulte a seção "Docker Compose" no `README.md` e verifique o `.env`.
