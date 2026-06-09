-- Add a user-facing title to study plans so the user can identify each plan
-- (default named "Plano para {Cargo} - {Empresa}" when generated).

BEGIN;

ALTER TABLE "study_plans" ADD COLUMN IF NOT EXISTS "title" VARCHAR(200);

COMMIT;
