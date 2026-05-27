-- Fix legacy user_skills schema to match the application models.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_skills' AND column_name = 'userId'
  ) THEN
    ALTER TABLE "user_skills" RENAME COLUMN "userId" TO "user_id";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_skills' AND column_name = 'skillName'
  ) THEN
    ALTER TABLE "user_skills" RENAME COLUMN "skillName" TO "legacy_skill_name";
  END IF;
END $$;

ALTER TABLE "user_skills"
  ADD COLUMN IF NOT EXISTS "skill_id" TEXT;

WITH source_skills AS (
  SELECT DISTINCT
    TRIM("legacy_skill_name") AS legacy_skill_name,
    REGEXP_REPLACE(LOWER(TRIM("legacy_skill_name")), '[^a-z0-9]+', '', 'g') AS normalized_name
  FROM "user_skills"
  WHERE "legacy_skill_name" IS NOT NULL AND TRIM("legacy_skill_name") <> ''
),
resolved_skills AS (
  SELECT
    source_skills.legacy_skill_name,
    COALESCE(canonical.id, slug.id, alias.skill_id) AS skill_id,
    source_skills.normalized_name
  FROM source_skills
  LEFT JOIN "skills" canonical
    ON LOWER(canonical."canonical_name") = LOWER(source_skills.legacy_skill_name)
  LEFT JOIN "skills" slug
    ON LOWER(slug."slug") = source_skills.normalized_name
  LEFT JOIN "skill_aliases" alias
    ON alias."normalized_alias" = source_skills.normalized_name
)
INSERT INTO "skills" ("id", "canonical_name", "slug", "active")
SELECT
  gen_random_uuid()::text,
  source_skills.legacy_skill_name,
  source_skills.normalized_name || '-' || SUBSTRING(md5(source_skills.legacy_skill_name), 1, 8),
  true
FROM source_skills
WHERE NOT EXISTS (
  SELECT 1
  FROM resolved_skills resolved
  WHERE resolved.legacy_skill_name = source_skills.legacy_skill_name
    AND resolved.skill_id IS NOT NULL
)
ON CONFLICT ("slug") DO NOTHING;

WITH source_skills AS (
  SELECT DISTINCT
    TRIM("legacy_skill_name") AS legacy_skill_name,
    REGEXP_REPLACE(LOWER(TRIM("legacy_skill_name")), '[^a-z0-9]+', '', 'g') AS normalized_name
  FROM "user_skills"
  WHERE "legacy_skill_name" IS NOT NULL AND TRIM("legacy_skill_name") <> ''
),
resolved_skills AS (
  SELECT
    source_skills.legacy_skill_name,
    COALESCE(canonical.id, slug.id, alias.skill_id) AS skill_id
  FROM source_skills
  LEFT JOIN "skills" canonical
    ON LOWER(canonical."canonical_name") = LOWER(source_skills.legacy_skill_name)
  LEFT JOIN "skills" slug
    ON LOWER(slug."slug") = source_skills.normalized_name
  LEFT JOIN "skill_aliases" alias
    ON alias."normalized_alias" = source_skills.normalized_name
)
UPDATE "user_skills" AS us
SET "skill_id" = resolved_skills.skill_id
FROM resolved_skills
WHERE TRIM(us."legacy_skill_name") = TRIM(resolved_skills.legacy_skill_name)
  AND us."skill_id" IS NULL
  AND resolved_skills.skill_id IS NOT NULL;

DELETE FROM "user_skills" a
USING "user_skills" b
WHERE a.ctid < b.ctid
  AND a."user_id" = b."user_id"
  AND a."skill_id" = b."skill_id";

ALTER TABLE "user_skills"
  ALTER COLUMN "skill_id" SET NOT NULL;

ALTER TABLE "user_skills"
  DROP COLUMN IF EXISTS "legacy_skill_name",
  DROP COLUMN IF EXISTS "job_id",
  DROP COLUMN IF EXISTS "priority";

ALTER TABLE "user_skills" DROP CONSTRAINT IF EXISTS "user_skills_user_id_fkey";
ALTER TABLE "user_skills" DROP CONSTRAINT IF EXISTS "user_skills_skill_id_fkey";

ALTER TABLE "user_skills"
  ADD CONSTRAINT "user_skills_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "user_skills"
  ADD CONSTRAINT "user_skills_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS "user_skills_user_id_idx" ON "user_skills" ("user_id");
CREATE INDEX IF NOT EXISTS "user_skills_skill_id_idx" ON "user_skills" ("skill_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_skills_user_id_skill_id_key" ON "user_skills" ("user_id", "skill_id");

COMMIT;