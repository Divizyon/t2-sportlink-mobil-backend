-- AlterTable
ALTER TABLE "event" ADD COLUMN     "invitation_code" TEXT,
ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false;
