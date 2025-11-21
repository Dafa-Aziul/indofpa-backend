/*
  Warnings:

  - Added the required column `updatedAt` to the `Indikator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Kuesioner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pertanyaan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `indikator` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `kuesioner` ADD COLUMN `estimasiMenit` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `pertanyaan` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
