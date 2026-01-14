-- Adicionar coluna QuantidadeMaximaFaltas à tabela PostosDeTrabalho
ALTER TABLE "PostosDeTrabalho" ADD COLUMN IF NOT EXISTS "QuantidadeMaximaFaltas" integer;

-- Registrar migration no histórico
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260110022115_AddQuantidadeMaximaFaltasToPostoDeTrabalho', '8.0.8')
ON CONFLICT DO NOTHING;

