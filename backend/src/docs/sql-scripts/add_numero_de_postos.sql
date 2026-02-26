-- Migration: Adicionar coluna NumeroDePostos na tabela Contratos
-- Data: 2026-01-17
-- Descrição: Adiciona a coluna para armazenar número de postos/turnos do contrato

-- Adicionar coluna com valor padrão 2 (12x36 é o padrão)
ALTER TABLE "Contratos" 
ADD COLUMN "NumeroDePostos" integer NOT NULL DEFAULT 2;

-- Remover o default após popular (boa prática)
ALTER TABLE "Contratos" 
ALTER COLUMN "NumeroDePostos" DROP DEFAULT;

-- Adicionar constraint de validação (2 a 4 postos)
ALTER TABLE "Contratos"
ADD CONSTRAINT "CK_Contratos_NumeroDePostos" 
CHECK ("NumeroDePostos" >= 2 AND "NumeroDePostos" <= 4);

-- Comentário na coluna para documentação
COMMENT ON COLUMN "Contratos"."NumeroDePostos" IS 'Número de postos/turnos: 2=12x36, 3=8h, 4=6h';
