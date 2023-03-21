/*
  Warnings:

  - Made the column `oemId` on table `Catalog` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Catalog" DROP CONSTRAINT "Catalog_oemId_fkey";

-- AlterTable
ALTER TABLE "Catalog" ALTER COLUMN "oemId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_oemId_fkey" FOREIGN KEY ("oemId") REFERENCES "OEM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
