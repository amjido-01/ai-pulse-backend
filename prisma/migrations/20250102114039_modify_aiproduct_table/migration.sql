/*
  Warnings:

  - You are about to drop the column `source` on the `Aiproducts` table. All the data in the column will be lost.
  - Added the required column `website` to the `Aiproducts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aiproducts" DROP COLUMN "source",
ADD COLUMN     "website" TEXT NOT NULL;
