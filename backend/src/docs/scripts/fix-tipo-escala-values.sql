-- Script de correção para valores de TipoEscala no banco de dados
-- Data: 2026-01-08
-- Problema: Valores '12x36' e '5x2' precisam ser convertidos para os nomes dos enums

-- Verificar quantos registros precisam ser corrigidos
SELECT 
    TipoEscala,
    COUNT(*) as Quantidade
FROM "Funcionarios"
WHERE TipoEscala IN ('12x36', '5x2')
GROUP BY TipoEscala;

-- Corrigir valores de TipoEscala
UPDATE "Funcionarios"
SET TipoEscala = 'DOZE_POR_TRINTA_SEIS'
WHERE TipoEscala = '12x36';

UPDATE "Funcionarios"
SET TipoEscala = 'SEMANAL_COMERCIAL'
WHERE TipoEscala = '5x2';

-- Verificar se ainda existem valores inválidos
SELECT 
    TipoEscala,
    COUNT(*) as Quantidade
FROM "Funcionarios"
WHERE TipoEscala NOT IN ('DOZE_POR_TRINTA_SEIS', 'SEMANAL_COMERCIAL')
GROUP BY TipoEscala;

-- Verificar todos os valores após correção
SELECT 
    TipoEscala,
    COUNT(*) as Quantidade
FROM "Funcionarios"
GROUP BY TipoEscala
ORDER BY TipoEscala;

