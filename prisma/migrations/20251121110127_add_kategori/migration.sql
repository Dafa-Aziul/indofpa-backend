/*
  Warnings:

  - Added the required column `idKategori` to the `Kuesioner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kuesioner` ADD COLUMN `idKategori` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kuesioner` ADD CONSTRAINT `Kuesioner_idKategori_fkey` FOREIGN KEY (`idKategori`) REFERENCES `Kategori`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
