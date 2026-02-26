-- FASE 3: Remover colunas de salário da tabela Funcionarios
-- Migration: 20260108022216_Fase3RemoverCamposSalarioFuncionario

BEGIN;

-- Remover colunas depreciadas
ALTER TABLE "Funcionarios" DROP COLUMN IF EXISTS "SalarioMensal";
ALTER TABLE "Funcionarios" DROP COLUMN IF EXISTS "ValorDiariasFixas";
ALTER TABLE "Funcionarios" DROP COLUMN IF EXISTS "ValorTotalBeneficiosMensal";

-- Atualizar tabela de migrations do EF Core
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260108022216_Fase3RemoverCamposSalarioFuncionario', '8.0.0')
ON CONFLICT DO NOTHING;

COMMIT;

-- Verificar estrutura atualizada
\d "Funcionarios"

