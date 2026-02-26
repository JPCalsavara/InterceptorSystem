-- ========================================
-- SCRIPT: Reset Database
-- Descrição: Limpa todas as tabelas para testes
-- Data: 2026-01-07
-- FASE 2: Vínculo Funcionário ↔ Contrato
-- ========================================

-- Desabilitar constraints temporariamente
SET session_replication_role = 'replica';

-- Limpar todas as tabelas na ordem correta (das dependências para as principais)
TRUNCATE TABLE "Alocacoes" CASCADE;
TRUNCATE TABLE "Funcionarios" CASCADE;
TRUNCATE TABLE "PostosDeTrabalho" CASCADE;
TRUNCATE TABLE "Contratos" CASCADE;
TRUNCATE TABLE "Condominios" CASCADE;

-- Reabilitar constraints
SET session_replication_role = 'origin';

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados resetado com sucesso! Todas as tabelas foram limpas.';
END $$;

