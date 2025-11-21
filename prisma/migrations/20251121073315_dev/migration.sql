-- CreateTable
CREATE TABLE `User` (
    `idUser` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogAktivitas` (
    `idLog` INTEGER NOT NULL AUTO_INCREMENT,
    `idUser` INTEGER NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `waktu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idLog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kuesioner` (
    `idKuesioner` INTEGER NOT NULL AUTO_INCREMENT,
    `idPembuat` INTEGER NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `tujuan` VARCHAR(191) NULL,
    `manfaat` VARCHAR(191) NULL,
    `status` ENUM('Draft', 'Publish', 'Arsip') NOT NULL DEFAULT 'Draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Kuesioner_idPembuat_idx`(`idPembuat`),
    PRIMARY KEY (`idKuesioner`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Indikator` (
    `idIndikator` INTEGER NOT NULL AUTO_INCREMENT,
    `idKuesioner` INTEGER NOT NULL,
    `namaIndikator` VARCHAR(191) NOT NULL,
    `kodeIndikator` VARCHAR(191) NOT NULL,

    INDEX `Indikator_idKuesioner_idx`(`idKuesioner`),
    PRIMARY KEY (`idIndikator`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pertanyaan` (
    `idPertanyaan` INTEGER NOT NULL AUTO_INCREMENT,
    `idIndikator` INTEGER NOT NULL,
    `teksPertanyaan` VARCHAR(191) NOT NULL,
    `bobot` INTEGER NOT NULL,
    `urutan` INTEGER NOT NULL,

    INDEX `Pertanyaan_idIndikator_idx`(`idIndikator`),
    PRIMARY KEY (`idPertanyaan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespondenProfile` (
    `idResponden` INTEGER NOT NULL AUTO_INCREMENT,
    `idKuesioner` INTEGER NOT NULL,
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

    INDEX `RespondenProfile_idKuesioner_idx`(`idKuesioner`),
    UNIQUE INDEX `RespondenProfile_email_idKuesioner_key`(`email`, `idKuesioner`),
    PRIMARY KEY (`idResponden`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jawaban` (
    `idJawaban` INTEGER NOT NULL AUTO_INCREMENT,
    `idResponden` INTEGER NOT NULL,
    `idPertanyaan` INTEGER NOT NULL,
    `nilai` INTEGER NOT NULL,

    INDEX `Jawaban_idResponden_idx`(`idResponden`),
    INDEX `Jawaban_idPertanyaan_idx`(`idPertanyaan`),
    UNIQUE INDEX `Jawaban_idResponden_idPertanyaan_key`(`idResponden`, `idPertanyaan`),
    PRIMARY KEY (`idJawaban`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespondenScore` (
    `idRespondenScore` INTEGER NOT NULL AUTO_INCREMENT,
    `idKuesioner` INTEGER NOT NULL,
    `idResponden` INTEGER NOT NULL,
    `idIndikator` INTEGER NOT NULL,
    `scoreRaw` DOUBLE NOT NULL,
    `scoreNormalized` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RespondenScore_idKuesioner_idx`(`idKuesioner`),
    INDEX `RespondenScore_idResponden_idx`(`idResponden`),
    INDEX `RespondenScore_idIndikator_idx`(`idIndikator`),
    PRIMARY KEY (`idRespondenScore`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DistribusiKuesioner` (
    `idDistribusi` INTEGER NOT NULL AUTO_INCREMENT,
    `idKuesioner` INTEGER NOT NULL,
    `kodeAkses` VARCHAR(191) NOT NULL,
    `urlLink` VARCHAR(191) NOT NULL,
    `tanggalMulai` DATETIME(3) NULL,
    `tanggalSelesai` DATETIME(3) NULL,
    `catatan` VARCHAR(191) NULL,

    INDEX `DistribusiKuesioner_idKuesioner_idx`(`idKuesioner`),
    PRIMARY KEY (`idDistribusi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LogAktivitas` ADD CONSTRAINT `LogAktivitas_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kuesioner` ADD CONSTRAINT `Kuesioner_idPembuat_fkey` FOREIGN KEY (`idPembuat`) REFERENCES `User`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Indikator` ADD CONSTRAINT `Indikator_idKuesioner_fkey` FOREIGN KEY (`idKuesioner`) REFERENCES `Kuesioner`(`idKuesioner`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pertanyaan` ADD CONSTRAINT `Pertanyaan_idIndikator_fkey` FOREIGN KEY (`idIndikator`) REFERENCES `Indikator`(`idIndikator`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenProfile` ADD CONSTRAINT `RespondenProfile_idKuesioner_fkey` FOREIGN KEY (`idKuesioner`) REFERENCES `Kuesioner`(`idKuesioner`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_idResponden_fkey` FOREIGN KEY (`idResponden`) REFERENCES `RespondenProfile`(`idResponden`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_idPertanyaan_fkey` FOREIGN KEY (`idPertanyaan`) REFERENCES `Pertanyaan`(`idPertanyaan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenScore` ADD CONSTRAINT `RespondenScore_idKuesioner_fkey` FOREIGN KEY (`idKuesioner`) REFERENCES `Kuesioner`(`idKuesioner`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenScore` ADD CONSTRAINT `RespondenScore_idResponden_fkey` FOREIGN KEY (`idResponden`) REFERENCES `RespondenProfile`(`idResponden`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespondenScore` ADD CONSTRAINT `RespondenScore_idIndikator_fkey` FOREIGN KEY (`idIndikator`) REFERENCES `Indikator`(`idIndikator`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DistribusiKuesioner` ADD CONSTRAINT `DistribusiKuesioner_idKuesioner_fkey` FOREIGN KEY (`idKuesioner`) REFERENCES `Kuesioner`(`idKuesioner`) ON DELETE RESTRICT ON UPDATE CASCADE;
