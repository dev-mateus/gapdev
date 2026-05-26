-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('Beginner', 'Basic', 'Intermediate', 'Advanced', 'Specialist');

-- CreateEnum
CREATE TYPE "SkillPriority" AS ENUM ('desirable', 'required');

-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('Intern', 'Junior', 'MidLevel', 'Senior');

-- AlterTable user_skills
ALTER TABLE "user_skills" 
ADD COLUMN "job_id" TEXT,
ADD COLUMN "priority" "SkillPriority" NOT NULL DEFAULT 'desirable',
ALTER COLUMN "level" DROP DEFAULT,
ALTER COLUMN "level" TYPE "SkillLevel" USING CASE 
    WHEN "level" = 1 THEN 'Beginner'::"SkillLevel"
    WHEN "level" = 2 THEN 'Basic'::"SkillLevel"
    WHEN "level" = 3 THEN 'Intermediate'::"SkillLevel"
    WHEN "level" = 4 THEN 'Advanced'::"SkillLevel"
    WHEN "level" = 5 THEN 'Specialist'::"SkillLevel"
    ELSE 'Beginner'::"SkillLevel"
END,
ALTER COLUMN "level" SET DEFAULT 'Beginner'::"SkillLevel";

-- AddForeignKey for job_id
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_job_id_fkey" 
FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE;

-- CreateIndex
CREATE INDEX "user_skills_job_id_idx" ON "user_skills"("job_id");

-- AlterTable jobs
ALTER TABLE "jobs" 
ADD COLUMN "level" "JobLevel" NOT NULL DEFAULT 'Junior';
