-- AlterTable jobs
ALTER TABLE "jobs"
ADD COLUMN "compatibility" INTEGER NOT NULL DEFAULT 0;
