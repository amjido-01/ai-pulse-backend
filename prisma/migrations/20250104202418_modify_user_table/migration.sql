/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `UserNotifications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "UserNotifications_userId_productId_key" ON "UserNotifications"("userId", "productId");
