/*
  Warnings:

  - Added the required column `productName` to the `UserNotifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserNotifications" ADD COLUMN     "productName" TEXT NOT NULL;
