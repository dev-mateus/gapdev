-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "SkillSource" AS ENUM ('self_assessed', 'imported', 'inferred');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "StudyPlanStatus" AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "StudyPlanItemStatus" AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Required for data migration ids created inside PostgreSQL.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE IF NOT EXISTS "skills" (
  "id" TEXT NOT NULL,
  "canonical_name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" TEXT,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "skill_aliases" (
  "id" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "alias" TEXT NOT NULL,
  "normalized_alias" TEXT NOT NULL,

  CONSTRAINT "skill_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_skills" (
  "id" TEXT NOT NULL,
  "job_id" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "raw_name" TEXT,
  "required_level" "SkillLevel" NOT NULL DEFAULT 'Basic',
  "priority" "SkillPriority" NOT NULL DEFAULT 'desirable',
  "evidence" TEXT,
  "recommendation" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "job_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "study_plans" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "job_id" TEXT NOT NULL,
  "status" "StudyPlanStatus" NOT NULL DEFAULT 'draft',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "study_plan_items" (
  "id" TEXT NOT NULL,
  "study_plan_id" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "current_level" "SkillLevel",
  "target_level" "SkillLevel" NOT NULL,
  "priority" "SkillPriority" NOT NULL DEFAULT 'desirable',
  "reason" TEXT,
  "status" "StudyPlanItemStatus" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "study_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "skills_slug_key" ON "skills"("slug");
CREATE INDEX IF NOT EXISTS "skills_category_idx" ON "skills"("category");
CREATE UNIQUE INDEX IF NOT EXISTS "skill_aliases_normalized_alias_key" ON "skill_aliases"("normalized_alias");
CREATE INDEX IF NOT EXISTS "skill_aliases_skill_id_idx" ON "skill_aliases"("skill_id");
CREATE UNIQUE INDEX IF NOT EXISTS "job_skills_job_id_skill_id_key" ON "job_skills"("job_id", "skill_id");

-- AlterTable
ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Seed the base technology catalog used by profile, job analysis, and study plans.
WITH seed("slug", "canonical_name", "category", "description") AS (
  VALUES
    ('javascript', 'JavaScript', 'Linguagens', 'Linguagem de programacao para web'),
    ('typescript', 'TypeScript', 'Linguagens', 'Superset tipado de JavaScript'),
    ('python', 'Python', 'Linguagens', 'Linguagem versatil para backend, dados e IA'),
    ('html', 'HTML', 'Frontend', 'Linguagem de marcacao para web'),
    ('css', 'CSS', 'Frontend', 'Linguagem de estilos para web'),
    ('react', 'React', 'Frontend', 'Biblioteca JavaScript para interfaces'),
    ('nextjs', 'Next.js', 'Frontend', 'Framework React para aplicacoes web'),
    ('nodejs', 'Node.js', 'Backend', 'Runtime JavaScript para backend'),
    ('fastapi', 'FastAPI', 'Backend', 'Framework Python para APIs'),
    ('react-native', 'React Native', 'Mobile', 'Framework mobile multiplataforma'),
    ('flutter', 'Flutter', 'Mobile', 'Framework para aplicativos moveis'),
    ('postgresql', 'PostgreSQL', 'Banco de Dados', 'Banco de dados relacional'),
    ('mongodb', 'MongoDB', 'Banco de Dados', 'Banco de dados NoSQL'),
    ('docker', 'Docker', 'DevOps & Cloud', 'Ferramenta de containers'),
    ('aws', 'AWS', 'DevOps & Cloud', 'Servicos em nuvem'),
    ('cicd', 'CI/CD', 'DevOps & Cloud', 'Integracao e entrega continua'),
    ('postman', 'Postman', 'Ferramentas', 'Teste e documentacao de APIs'),
    ('insomnia', 'Insomnia', 'Ferramentas', 'Cliente para APIs REST'),
    ('jest', 'Jest', 'Testes', 'Framework de testes JavaScript'),
    ('cypress', 'Cypress', 'Testes', 'Testes end-to-end'),
    ('figma', 'Figma', 'UI/UX', 'Design de interfaces'),
    ('design-system', 'Design System', 'UI/UX', 'Sistema visual reutilizavel'),
    ('machine-learning', 'Machine Learning', 'IA', 'Modelos inteligentes e preditivos'),
    ('tensorflow', 'TensorFlow', 'IA', 'Framework para IA'),
    ('jwt', 'JWT', 'Ciberseguranca', 'Autenticacao baseada em tokens'),
    ('oauth', 'OAuth', 'Ciberseguranca', 'Autorizacao segura'),
    ('pandas', 'Pandas', 'Dados', 'Manipulacao de dados em Python'),
    ('power-bi', 'Power BI', 'Dados', 'Visualizacao de dados'),
    ('unity', 'Unity', 'Game Dev', 'Engine para jogos'),
    ('unreal-engine', 'Unreal Engine', 'Game Dev', 'Engine grafica para jogos'),
    ('bubble', 'Bubble', 'Low Code', 'Plataforma low code'),
    ('flutterflow', 'FlutterFlow', 'Low Code', 'Construcao visual de apps'),
    ('rest', 'REST', 'APIs', 'Arquitetura para APIs'),
    ('graphql', 'GraphQL', 'APIs', 'Linguagem de consulta para APIs'),
    ('wordpress', 'WordPress', 'CMS', 'CMS para sites'),
    ('strapi', 'Strapi', 'CMS', 'CMS Headless'),
    ('git', 'Git', 'Versionamento', 'Controle de versao'),
    ('github', 'GitHub', 'Versionamento', 'Hospedagem de repositorios'),
    ('clean-architecture', 'Clean Architecture', 'Arquitetura', 'Arquitetura escalavel de software'),
    ('microservices', 'Microservices', 'Arquitetura', 'Arquitetura distribuida')
)
INSERT INTO "skills" ("id", "slug", "canonical_name", "category", "description")
SELECT gen_random_uuid()::text, "slug", "canonical_name", "category", "description"
FROM seed
ON CONFLICT ("slug") DO UPDATE SET
  "canonical_name" = EXCLUDED."canonical_name",
  "category" = EXCLUDED."category",
  "description" = EXCLUDED."description",
  "active" = true,
  "updated_at" = CURRENT_TIMESTAMP;

WITH alias_seed("skill_slug", "alias", "normalized_alias") AS (
  VALUES
    ('javascript', 'JavaScript', 'javascript'),
    ('javascript', 'JS', 'js'),
    ('javascript', 'ECMAScript', 'ecmascript'),
    ('typescript', 'TypeScript', 'typescript'),
    ('typescript', 'TS', 'ts'),
    ('python', 'Python', 'python'),
    ('python', 'Py', 'py'),
    ('html', 'HTML', 'html'),
    ('css', 'CSS', 'css'),
    ('react', 'React', 'react'),
    ('react', 'React.js', 'reactjs'),
    ('nextjs', 'Next.js', 'nextjs'),
    ('nextjs', 'Next', 'next'),
    ('nodejs', 'Node.js', 'nodejs'),
    ('nodejs', 'Node', 'node'),
    ('fastapi', 'FastAPI', 'fastapi'),
    ('react-native', 'React Native', 'reactnative'),
    ('flutter', 'Flutter', 'flutter'),
    ('postgresql', 'PostgreSQL', 'postgresql'),
    ('postgresql', 'Postgres', 'postgres'),
    ('postgresql', 'Postgre', 'postgre'),
    ('mongodb', 'MongoDB', 'mongodb'),
    ('mongodb', 'Mongo', 'mongo'),
    ('docker', 'Docker', 'docker'),
    ('aws', 'AWS', 'aws'),
    ('aws', 'Amazon Web Services', 'amazonwebservices'),
    ('cicd', 'CI/CD', 'cicd'),
    ('cicd', 'Continuous Integration', 'continuousintegration'),
    ('postman', 'Postman', 'postman'),
    ('insomnia', 'Insomnia', 'insomnia'),
    ('jest', 'Jest', 'jest'),
    ('cypress', 'Cypress', 'cypress'),
    ('figma', 'Figma', 'figma'),
    ('design-system', 'Design System', 'designsystem'),
    ('machine-learning', 'Machine Learning', 'machinelearning'),
    ('machine-learning', 'ML', 'ml'),
    ('tensorflow', 'TensorFlow', 'tensorflow'),
    ('jwt', 'JWT', 'jwt'),
    ('jwt', 'JSON Web Token', 'jsonwebtoken'),
    ('oauth', 'OAuth', 'oauth'),
    ('oauth', 'OAuth2', 'oauth2'),
    ('pandas', 'Pandas', 'pandas'),
    ('power-bi', 'Power BI', 'powerbi'),
    ('unity', 'Unity', 'unity'),
    ('unreal-engine', 'Unreal Engine', 'unrealengine'),
    ('bubble', 'Bubble', 'bubble'),
    ('flutterflow', 'FlutterFlow', 'flutterflow'),
    ('rest', 'REST', 'rest'),
    ('rest', 'REST API', 'restapi'),
    ('rest', 'API REST', 'apirest'),
    ('graphql', 'GraphQL', 'graphql'),
    ('wordpress', 'WordPress', 'wordpress'),
    ('strapi', 'Strapi', 'strapi'),
    ('git', 'Git', 'git'),
    ('github', 'GitHub', 'github'),
    ('clean-architecture', 'Clean Architecture', 'cleanarchitecture'),
    ('microservices', 'Microservices', 'microservices')
)
INSERT INTO "skill_aliases" ("id", "skill_id", "alias", "normalized_alias")
SELECT gen_random_uuid()::text, "skills"."id", alias_seed."alias", alias_seed."normalized_alias"
FROM alias_seed
JOIN "skills" ON "skills"."slug" = alias_seed."skill_slug"
ON CONFLICT ("normalized_alias") DO UPDATE SET
  "skill_id" = EXCLUDED."skill_id",
  "alias" = EXCLUDED."alias";

-- Preserve old analyzed skills as job requirements before repurposing user_skills.
WITH raw_skills AS (
  SELECT DISTINCT
    TRIM("skillName") AS "name",
    REGEXP_REPLACE(LOWER(TRIM("skillName")), '[^a-z0-9]+', '', 'g') AS "normalized_alias"
  FROM "user_skills"
  WHERE "skillName" IS NOT NULL AND TRIM("skillName") <> ''
),
unknown_skills AS (
  SELECT
    MIN("name") AS "canonical_name",
    "normalized_alias"
  FROM raw_skills
  WHERE "normalized_alias" <> ''
    AND NOT EXISTS (
      SELECT 1
      FROM "skill_aliases"
      WHERE "skill_aliases"."normalized_alias" = raw_skills."normalized_alias"
    )
  GROUP BY "normalized_alias"
)
INSERT INTO "skills" ("id", "canonical_name", "slug")
SELECT gen_random_uuid()::text, "canonical_name", "normalized_alias"
FROM unknown_skills
ON CONFLICT ("slug") DO NOTHING;

WITH raw_skills AS (
  SELECT DISTINCT
    TRIM("skillName") AS "name",
    REGEXP_REPLACE(LOWER(TRIM("skillName")), '[^a-z0-9]+', '', 'g') AS "normalized_alias"
  FROM "user_skills"
  WHERE "skillName" IS NOT NULL AND TRIM("skillName") <> ''
)
INSERT INTO "skill_aliases" ("id", "skill_id", "alias", "normalized_alias")
SELECT gen_random_uuid()::text, "skills"."id", raw_skills."name", raw_skills."normalized_alias"
FROM raw_skills
JOIN "skills" ON "skills"."slug" = raw_skills."normalized_alias"
WHERE raw_skills."normalized_alias" <> ''
ON CONFLICT ("normalized_alias") DO NOTHING;

INSERT INTO "job_skills" (
  "id",
  "job_id",
  "skill_id",
  "raw_name",
  "required_level",
  "priority",
  "created_at"
)
SELECT
  gen_random_uuid()::text,
  "user_skills"."job_id",
  "skill_aliases"."skill_id",
  "user_skills"."skillName",
  "user_skills"."level",
  "user_skills"."priority",
  CURRENT_TIMESTAMP
FROM "user_skills"
JOIN "skill_aliases"
  ON "skill_aliases"."normalized_alias" = REGEXP_REPLACE(LOWER(TRIM("user_skills"."skillName")), '[^a-z0-9]+', '', 'g')
WHERE "user_skills"."job_id" IS NOT NULL
ON CONFLICT ("job_id", "skill_id") DO UPDATE SET
  "required_level" = CASE
    WHEN ARRAY_POSITION(ENUM_RANGE(NULL::"SkillLevel"), EXCLUDED."required_level") >
         ARRAY_POSITION(ENUM_RANGE(NULL::"SkillLevel"), "job_skills"."required_level")
    THEN EXCLUDED."required_level"
    ELSE "job_skills"."required_level"
  END,
  "priority" = CASE
    WHEN EXCLUDED."priority" = 'required' THEN 'required'::"SkillPriority"
    ELSE "job_skills"."priority"
  END;

-- Repurpose user_skills to mean skills the user actually has.
ALTER TABLE "user_skills" DROP CONSTRAINT IF EXISTS "user_skills_job_id_fkey";
DROP INDEX IF EXISTS "user_skills_job_id_idx";

TRUNCATE TABLE "user_skills";

DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_skills' AND column_name = 'userId'
  ) THEN
    ALTER TABLE "user_skills" RENAME COLUMN "userId" TO "user_id";
  END IF;
END $$;

ALTER TABLE "user_skills" DROP CONSTRAINT IF EXISTS "user_skills_userId_fkey";
ALTER TABLE "user_skills" DROP CONSTRAINT IF EXISTS "user_skills_user_id_fkey";
DROP INDEX IF EXISTS "user_skills_userId_idx";

ALTER TABLE "user_skills"
  DROP COLUMN IF EXISTS "job_id",
  DROP COLUMN IF EXISTS "skillName",
  DROP COLUMN IF EXISTS "priority",
  ADD COLUMN IF NOT EXISTS "skill_id" TEXT,
  ADD COLUMN IF NOT EXISTS "years_experience" INTEGER,
  ADD COLUMN IF NOT EXISTS "source" "SkillSource" NOT NULL DEFAULT 'self_assessed',
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "user_skills"
  ALTER COLUMN "skill_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_skills_user_id_idx" ON "user_skills"("user_id");
CREATE INDEX IF NOT EXISTS "user_skills_skill_id_idx" ON "user_skills"("skill_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_skills_user_id_skill_id_key" ON "user_skills"("user_id", "skill_id");
CREATE INDEX IF NOT EXISTS "job_skills_job_id_idx" ON "job_skills"("job_id");
CREATE INDEX IF NOT EXISTS "job_skills_skill_id_idx" ON "job_skills"("skill_id");
CREATE INDEX IF NOT EXISTS "study_plans_user_id_idx" ON "study_plans"("user_id");
CREATE INDEX IF NOT EXISTS "study_plans_job_id_idx" ON "study_plans"("job_id");
CREATE UNIQUE INDEX IF NOT EXISTS "study_plans_user_id_job_id_key" ON "study_plans"("user_id", "job_id");
CREATE INDEX IF NOT EXISTS "study_plan_items_study_plan_id_idx" ON "study_plan_items"("study_plan_id");
CREATE INDEX IF NOT EXISTS "study_plan_items_skill_id_idx" ON "study_plan_items"("skill_id");
CREATE UNIQUE INDEX IF NOT EXISTS "study_plan_items_study_plan_id_skill_id_key" ON "study_plan_items"("study_plan_id", "skill_id");

-- AddForeignKey
ALTER TABLE "skill_aliases" ADD CONSTRAINT "skill_aliases_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_plan_items" ADD CONSTRAINT "study_plan_items_study_plan_id_fkey"
  FOREIGN KEY ("study_plan_id") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_plan_items" ADD CONSTRAINT "study_plan_items_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
