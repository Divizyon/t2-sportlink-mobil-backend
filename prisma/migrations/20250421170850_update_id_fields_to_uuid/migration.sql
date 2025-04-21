/*
  Warnings:

  - The primary key for the `admin_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `announcement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event_participant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event_rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `news` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_sport` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "admin_log" DROP CONSTRAINT "admin_log_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "announcement" DROP CONSTRAINT "announcement_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_sport_id_fkey";

-- DropForeignKey
ALTER TABLE "event_participant" DROP CONSTRAINT "event_participant_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_participant" DROP CONSTRAINT "event_participant_user_id_fkey";

-- DropForeignKey
ALTER TABLE "event_rating" DROP CONSTRAINT "event_rating_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_rating" DROP CONSTRAINT "event_rating_user_id_fkey";

-- DropForeignKey
ALTER TABLE "news" DROP CONSTRAINT "news_sport_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_event_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_event_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_reported_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_reporter_id_fkey";

-- DropForeignKey
ALTER TABLE "user_rating" DROP CONSTRAINT "user_rating_rated_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_rating" DROP CONSTRAINT "user_rating_rating_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_sport" DROP CONSTRAINT "user_sport_sport_id_fkey";

-- DropForeignKey
ALTER TABLE "user_sport" DROP CONSTRAINT "user_sport_user_id_fkey";

-- AlterTable
ALTER TABLE "admin_log" DROP CONSTRAINT "admin_log_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "admin_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "admin_log_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "admin_log_id_seq";

-- AlterTable
ALTER TABLE "announcement" DROP CONSTRAINT "announcement_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "creator_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "announcement_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "announcement_id_seq";

-- AlterTable
ALTER TABLE "event" DROP CONSTRAINT "event_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "creator_id" SET DATA TYPE TEXT,
ALTER COLUMN "sport_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "event_id_seq";

-- AlterTable
ALTER TABLE "event_participant" DROP CONSTRAINT "event_participant_pkey",
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_participant_pkey" PRIMARY KEY ("event_id", "user_id");

-- AlterTable
ALTER TABLE "event_rating" DROP CONSTRAINT "event_rating_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_rating_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "event_rating_id_seq";

-- AlterTable
ALTER TABLE "news" DROP CONSTRAINT "news_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sport_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "news_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "news_id_seq";

-- AlterTable
ALTER TABLE "notification" DROP CONSTRAINT "notification_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "notification_id_seq";

-- AlterTable
ALTER TABLE "report" DROP CONSTRAINT "report_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "reporter_id" SET DATA TYPE TEXT,
ALTER COLUMN "reported_id" SET DATA TYPE TEXT,
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "report_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "report_id_seq";

-- AlterTable
ALTER TABLE "sport" DROP CONSTRAINT "sport_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "sport_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "sport_id_seq";

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- AlterTable
ALTER TABLE "user_rating" DROP CONSTRAINT "user_rating_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "rated_user_id" SET DATA TYPE TEXT,
ALTER COLUMN "rating_user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_rating_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_rating_id_seq";

-- AlterTable
ALTER TABLE "user_sport" DROP CONSTRAINT "user_sport_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "sport_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_sport_pkey" PRIMARY KEY ("user_id", "sport_id");

-- AddForeignKey
ALTER TABLE "user_sport" ADD CONSTRAINT "user_sport_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sport" ADD CONSTRAINT "user_sport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rating" ADD CONSTRAINT "event_rating_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rating" ADD CONSTRAINT "event_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reported_id_fkey" FOREIGN KEY ("reported_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rating" ADD CONSTRAINT "user_rating_rated_user_id_fkey" FOREIGN KEY ("rated_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rating" ADD CONSTRAINT "user_rating_rating_user_id_fkey" FOREIGN KEY ("rating_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_log" ADD CONSTRAINT "admin_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
