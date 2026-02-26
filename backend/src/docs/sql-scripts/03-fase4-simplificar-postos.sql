-- ========================================
-- FASE 4: Migration Manual - Remover QuantidadeIdealFuncionarios
-- Descrição: Remove colunas depreciadas de PostosDeTrabalho
-- Data: 2026-01-08
-- ========================================

BEGIN;

-- Remover colunas depreciadas (se existirem)
ALTER TABLE "PostosDeTrabalho" 
    DROP COLUMN IF EXISTS "QuantidadeIdealFuncionarios",
    DROP COLUMN IF EXISTS "QuantidadeMaximaFuncionarios",
    DROP COLUMN IF EXISTS "NumeroFaltasAcumuladas";

-- Adicionar nova coluna (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='PostosDeTrabalho' 
        AND column_name='QuantidadeMaximaFaltas'
    ) THEN
        ALTER TABLE "PostosDeTrabalho" 
            ADD COLUMN "QuantidadeMaximaFaltas" INTEGER NULL;
    END IF;
END $$;

-- Atualizar registro de migrations (se necessário)
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260108121709_Fase4RemoverQuantidadeIdealDePostoDeTrabalho', '8.0.8')
ON CONFLICT ("MigrationId") DO NOTHING;

COMMIT;

-- Verificar estrutura atualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PostosDeTrabalho'
ORDER BY ordinal_position;

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE '✅ FASE 4 aplicada com sucesso!';
    RAISE NOTICE '   - QuantidadeIdealFuncionarios: REMOVIDO (calculado do Condomínio)';
    RAISE NOTICE '   - QuantidadeMaximaFaltas: ADICIONADO';
END $$;

