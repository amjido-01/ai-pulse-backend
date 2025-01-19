/*
  Warnings:

  - Added the required column `website` to the `UserNotifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserNotifications" ADD COLUMN     "website" TEXT NOT NULL;
