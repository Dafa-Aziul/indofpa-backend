/*
  Warnings:

  - Made the column `updatedAt` on table `kategori` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `kategori` MODIFY `updatedAt` DATETIME(3) NOT NULL;
