/*
  Warnings:

  - You are about to drop the column `masterProductId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[partNumber]` on the table `MasterProduct` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `partNumber` to the `MasterProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_masterProductId_fkey";

-- AlterTable
ALTER TABLE "MasterProduct" ADD COLUMN     "partNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "masterProductId",
ADD COLUMN     "masterProductPartNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MasterProduct_partNumber_key" ON "MasterProduct"("partNumber");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_masterProductPartNumber_fkey" FOREIGN KEY ("masterProductPartNumber") REFERENCES "MasterProduct"("partNumber") ON DELETE SET NULL ON UPDATE CASCADE;
