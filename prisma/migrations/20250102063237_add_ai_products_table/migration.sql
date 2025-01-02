-- CreateTable
CREATE TABLE "Aiproducts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Aiproducts_id_key" ON "Aiproducts"("id");
