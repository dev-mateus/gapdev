-- Add granular learning sub-skills inside each study plan module.

BEGIN;

-- CreateTable
CREATE TABLE IF NOT EXISTS "study_plan_item_skills" (
  "id" TEXT NOT NULL,
  "study_plan_item_id" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "reason" TEXT,
  "status" "StudyPlanItemStatus" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "study_plan_item_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "study_plan_item_skills_study_plan_item_id_idx" ON "study_plan_item_skills"("study_plan_item_id");
CREATE INDEX IF NOT EXISTS "study_plan_item_skills_skill_id_idx" ON "study_plan_item_skills"("skill_id");
CREATE UNIQUE INDEX IF NOT EXISTS "study_plan_item_skills_item_skill_key" ON "study_plan_item_skills"("study_plan_item_id", "skill_id");

-- AddForeignKey
ALTER TABLE "study_plan_item_skills" DROP CONSTRAINT IF EXISTS "study_plan_item_skills_study_plan_item_id_fkey";
ALTER TABLE "study_plan_item_skills" ADD CONSTRAINT "study_plan_item_skills_study_plan_item_id_fkey"
  FOREIGN KEY ("study_plan_item_id") REFERENCES "study_plan_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_plan_item_skills" DROP CONSTRAINT IF EXISTS "study_plan_item_skills_skill_id_fkey";
ALTER TABLE "study_plan_item_skills" ADD CONSTRAINT "study_plan_item_skills_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
