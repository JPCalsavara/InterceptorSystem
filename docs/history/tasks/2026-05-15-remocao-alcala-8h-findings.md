# Findings: Remoção de ALCALA_8H

## Impacto no Banco de Dados (⚠️ ATENÇÃO)

O enum `TipoEscala` no backend C# é **numérico**, e o EF Core persiste o inteiro no banco.

**Antes (valores antigos):**
| Valor int | Enum |
| --------- | ---- |
| 0 | DOZE_POR_TRINTA_SEIS |
| 1 | SEMANAL_COMERCIAL |
| 2 | ALCALA_8H |
| 3 | FOLGUISTA |
| 4 | OITO_HORAS_SEIS_POR_DOIS |

**Depois (novos valores):**
| Valor int | Enum |
| --------- | ---- |
| 0 | DOZE_POR_TRINTA_SEIS |
| 1 | SEMANAL_COMERCIAL |
| 2 | FOLGUISTA ← era ALCALA_8H! |
| 3 | OITO_HORAS_SEIS_POR_DOIS ← era FOLGUISTA! |

> **Risco:** Qualquer `Alocacao` no banco com `TipoEscala = 2` (ALCALA_8H) passará a ser lida como `FOLGUISTA`. Registros com `TipoEscala = 3` (FOLGUISTA antigo) passam a ser lidos como `OITO_HORAS_SEIS_POR_DOIS`. Isso é um **data corruption silencioso** se houver dados em produção.

**Ação necessária:** Verificar se o RDS em produção possui registros com TipoEscala = 2 ou 3 antes do deploy. Se houver, uma migration de UPDATE de dados é necessária.

---

## Mapeamento de Labels UI

| Antigo | Novo |
| ------ | ---- |
| `'Alcalá 8h'` | `'8h (6x2)'` |
| `'8 Horas (Diário)'` | `'8h (6x2)'` |
| `'8 Horas'` | `'8h (6x2)'` |

---

## Arquivo de Teste (AdicionalNoturnoTests.cs)

O teste `Alocacao_DeveIdentificarHorarioDiurno_8h` na linha 100 usa `TipoEscala.ALCALA_8H`.
- O enum foi apenas o tipo da escala, não afeta a lógica do teste (que é sobre horário noturno).
- Substituição direta por `TipoEscala.OITO_HORAS_SEIS_POR_DOIS` é segura.

---

## ClienteOrquestradorService.cs

Há um mapeamento string → TipoEscala:
```csharp
"ESCALA_8H_3TURNOS" => TipoEscala.ALCALA_8H
```
Substituir por:
```csharp
"ESCALA_8H_3TURNOS" => TipoEscala.OITO_HORAS_SEIS_POR_DOIS
```
As 4 outras ocorrências são criações de `AlocacaoPadrao` — mesma substituição direta.

## Templates HTML

Identificado durante o build que alguns templates referenciam `TipoEscala.ALCALA_8H` diretamente:
- `funcionario-list.component.html` (Filtro de escala)
