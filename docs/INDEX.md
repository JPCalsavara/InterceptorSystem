# Documentação — InterceptorSystem

**Última atualização:** 2026-02-26

---

## Estrutura

```
docs/
├── guias/
│   └── QUICK_START.md   # Comandos essenciais de desenvolvimento
└── INDEX.md             # Este arquivo
```

## Documentos Principais

| Arquivo                     | Descrição                                                        |
| --------------------------- | ---------------------------------------------------------------- |
| `/README.md`                | Visão geral, regras de negócio, arquitetura, Docker, tecnologias |
| `/CHANGELOG.md`             | Histórico de versões (v1.0 → v2.2)                               |
| `docs/guias/QUICK_START.md` | Referência rápida: Docker, migrations, testes, payloads          |

## Versões

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
