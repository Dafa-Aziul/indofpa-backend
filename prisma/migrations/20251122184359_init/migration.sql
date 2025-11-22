-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogAktivitas` (
    `logId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `waktu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`logId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kuesioner` (
    `kuesionerId` INTEGER NOT NULL AUTO_INCREMENT,
    `pembuatId` INTEGER NOT NULL,
    `kategoriId` INTEGER NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `tujuan` VARCHAR(191) NULL,
    `manfaat` VARCHAR(191) NULL,
    `estimasiMenit` INTEGER NULL,
    `status` ENUM('Draft', 'Publish', 'Arsip') NOT NULL DEFAULT 'Draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Kuesioner_pembuatId_idx`(`pembuatId`),
    PRIMARY KEY (`kuesionerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Indikator` (
    `indikatorId` INTEGER NOT NULL AUTO_INCREMENT,
    `kuesionerId` INTEGER NOT NULL,
    `namaIndikator` VARCHAR(191) NOT NULL,
    `kodeIndikator` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Indikator_kuesionerId_idx`(`kuesionerId`),
    PRIMARY KEY (`indikatorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pertanyaan` (
    `pertanyaanId` INTEGER NOT NULL AUTO_INCREMENT,
    `indikatorId` INTEGER NOT NULL,
    `teksPertanyaan` VARCHAR(191) NOT NULL,
    `bobot` INTEGER NOT NULL,
    `urutan` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pertanyaan_indikatorId_idx`(`indikatorId`),
    PRIMARY KEY (`pertanyaanId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespondenProfile` (
    `respondenId` INTEGER NOT NULL AUTO_INCREMENT,
    `kuesionerId` INTEGER NOT NULL,
    `nama` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `usiaKategori` ENUM('18-24', '25-34', '35-44', '45-54', '55-64', '65+') NOT NULL,
    `jenisKelamin` ENUM('L', 'P') NOT NULL,
    `tingkatPendidikan` ENUM('Tidak tamat SD', 'SD', 'SMP', 'SMA', 'Diploma', 'S1', 'S2', 'S3') NOT NULL,
    `agama` ENUM('Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kepercayaan') NOT NULL,
    `pekerjaan` VARCHAR(191) NULL,
    `waktuMulai` DATETIME(3) NULL,
    `waktuSelesai` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RespondenProfile_kuesionerId_idx`(`kuesionerId`),
    UNIQUE INDEX `RespondenProfile_email_kuesionerId_key`(`email`, `kuesionerId`),
    PRIMARY KEY (`respondenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jawaban` (
    `jawabanId` INTEGER NOT NULL AUTO_INCREMENT,
    `respondenId` INTEGER NOT NULL,
    `pertanyaanId` INTEGER NOT NULL,
    `nilai` INTEGER NOT NULL,

    INDEX `Jawaban_respondenId_idx`(`respondenId`),
    INDEX `Jawaban_pertanyaanId_idx`(`pertanyaanId`),
    UNIQUE INDEX `Jawaban_respondenId_pertanyaanId_key`(`respondenId`, `pertanyaanId`),
    PRIMARY KEY (`jawabanId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespondenScore` (
    `respondenScoreId` INTEGER NOT NULL AUTO_INCREMENT,
    `kuesionerId` INTEGER NOT NULL,
    `respondenId` INTEGER NOT NULL,
    `indikatorId` INTEGER NOT NULL,
    `scoreRaw` DOUBLE NOT NULL,
    `scoreNormalized` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RespondenScore_kuesionerId_idx`(`kuesionerId`),
    INDEX `RespondenScore_respondenId_idx`(`respondenId`),
    INDEX `RespondenScore_indikatorId_idx`(`indikatorId`),
    PRIMARY KEY (`respondenScoreId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DistribusiKuesioner` (
    `distribusiId` INTEGER NOT NULL AUTO_INCREMENT,
    `kuesionerId` INTEGER NOT NULL,
    `kodeAkses` VARCHAR(191) NOT NULL,
    `urlLink` VARCHAR(191) NOT NULL,
    `tanggalMulai` DATETIME(3) NULL,
    `tanggalSelesai` DATETIME(3) NULL,
    `catatan` VARCHAR(191) NULL,

    INDEX `DistribusiKuesioner_kuesionerId_idx`(`kuesionerId`),
    PRIMARY KEY (`distribusiId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `refreshTokenId` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiredAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    PRIMARY KEY (`refreshTokenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kategori` (
    `kategoriId` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`kategoriId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LogAktivitas` ADD CONSTRAINT `LogAktivitas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kuesioner` ADD CONSTRAINT `Kuesioner_pembuatId_fkey` FOREIGN KEY (`pembuatId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kuesioner` ADD CONSTRAINT `Kuesioner_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `Kategori`(`kategoriId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Indikator` ADD CONSTRAINT `Indikator_kuesionerId_fkey` FOREIGN KEY (`kuesionerId`) REFERENCES `Kuesioner`(`kuesionerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pertanyaan` ADD CONSTRAINT `Pertanyaan_indikatorId_fkey` FOREIGN KEY (`indikatorId`) REFERENCES `Indikator`(`indikatorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenProfile` ADD CONSTRAINT `RespondenProfile_kuesionerId_fkey` FOREIGN KEY (`kuesionerId`) REFERENCES `Kuesioner`(`kuesionerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_respondenId_fkey` FOREIGN KEY (`respondenId`) REFERENCES `RespondenProfile`(`respondenId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_pertanyaanId_fkey` FOREIGN KEY (`pertanyaanId`) REFERENCES `Pertanyaan`(`pertanyaanId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenScore` ADD CONSTRAINT `RespondenScore_kuesionerId_fkey` FOREIGN KEY (`kuesionerId`) REFERENCES `Kuesioner`(`kuesionerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenScore` ADD CONSTRAINT `RespondenScore_respondenId_fkey` FOREIGN KEY (`respondenId`) REFERENCES `RespondenProfile`(`respondenId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenScore` ADD CONSTRAINT `RespondenScore_indikatorId_fkey` FOREIGN KEY (`indikatorId`) REFERENCES `Indikator`(`indikatorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DistribusiKuesioner` ADD CONSTRAINT `DistribusiKuesioner_kuesionerId_fkey` FOREIGN KEY (`kuesionerId`) REFERENCES `Kuesioner`(`kuesionerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
