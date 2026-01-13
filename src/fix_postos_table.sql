-- Script para corrigir a tabela PostosDeTrabalho
-- Remove colunas que não deveriam existir conforme FASE 4

-- 1. Remover QuantidadeIdealFuncionarios (FASE 4: agora é propriedade calculada)
ALTER TABLE "PostosDeTrabalho" 
DROP COLUMN IF EXISTS "QuantidadeIdealFuncionarios";

-- 2. Remover QuantidadeMaximaFaltas (nunca deveria ter existido)
ALTER TABLE "PostosDeTrabalho" 
DROP COLUMN IF EXISTS "QuantidadeMaximaFaltas";

-- 3. Remover CapacidadeMaximaPorDobras (calculado automaticamente)
ALTER TABLE "PostosDeTrabalho" 
DROP COLUMN IF EXISTS "CapacidadeMaximaPorDobras";

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'PostosDeTrabalho'
ORDER BY ordinal_position;

