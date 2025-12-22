import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { generateAccessCode, generatePublicLink } from "../utils/generator.js";


// ======================================================
// GET DISTRIBUSI
// ======================================================
export const getDistribusiService = async (kuesionerId) => {
  const id = Number(kuesionerId);

  await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id }
  });

  return prisma.distribusiKuesioner.findMany({
    where: { kuesionerId: id },
    orderBy: { distribusiId: "desc" }
  });
};



// ======================================================
// CREATE DISTRIBUSI (FINAL VERSION)
// ======================================================
export const createDistribusiService = async (kuesionerId, data) => {
  const id = Number(kuesionerId);

  const kuesioner = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id },
  });

  // ❌ Tidak boleh buat distribusi jika kuesioner arsip
  if (kuesioner.status === "Arsip") {
    throw new ApiError(400, "Kuesioner arsip tidak bisa dibuatkan distribusi.");
  }

  const now = new Date();

  const start = data.tanggalMulai ? new Date(data.tanggalMulai) : now;
  const end = data.tanggalSelesai ? new Date(data.tanggalSelesai) : null;

  // ❌ tanggal mulai > tanggal selesai
  if (end && start > end) {
    throw new ApiError(400, "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.");
  }

  // ❌ tanggal selesai tidak boleh di masa lalu
  if (end && end < now) {
    throw new ApiError(400, "Tanggal selesai tidak boleh di masa lalu.");
  }

  // ❌ Single wave rule: Tidak boleh ada distribusi aktif
  const aktif = await prisma.distribusiKuesioner.findFirst({
    where: {
      kuesionerId: id,
      OR: [
        {
          AND: [
            { tanggalMulai: { lte: now } },
            { tanggalSelesai: { gte: now } },
          ],
        },
        {
          AND: [
            { tanggalMulai: { lte: now } },
            { tanggalSelesai: null },
          ],
        },
      ],
    },
  });

  if (aktif) {
    throw new ApiError(400, "Masih ada distribusi aktif. Tidak dapat membuat distribusi baru.");
  }

  // 🔑 generate kode akses unik
  let kodeAkses = generateAccessCode(8);
  let exist = await prisma.distribusiKuesioner.findFirst({ where: { kodeAkses } });

  while (exist) {
    kodeAkses = generateAccessCode(8);
    exist = await prisma.distribusiKuesioner.findFirst({ where: { kodeAkses } });
  }

  const urlLink = generatePublicLink(kodeAkses);

  // 🚀 TRANSACTION
  return prisma.$transaction(async (tx) => {
    // Jika status draft → ubah ke publish
    if (kuesioner.status === "Draft") {
      await tx.kuesioner.update({
        where: { kuesionerId: id },
        data: { status: "Publish" },
      });
    }

    return tx.distribusiKuesioner.create({
      data: {
        kuesionerId: id,
        kodeAkses,
        urlLink,
        tanggalMulai: start,
        tanggalSelesai: end,
        catatan: data.catatan || null,
      },
    });
  });
};



// ======================================================
// UPDATE DISTRIBUSI (FINAL VERSION)
// ======================================================
export const updateDistribusiService = async (id, data) => {
  const distribusiId = Number(id);

  const distribusi = await prisma.distribusiKuesioner.findUniqueOrThrow({
    where: { distribusiId },
  });

  const now = new Date();

  const start = data.tanggalMulai
    ? new Date(data.tanggalMulai)
    : distribusi.tanggalMulai;

  const end = data.tanggalSelesai
    ? new Date(data.tanggalSelesai)
    : distribusi.tanggalSelesai;

  // ❌ Validasi tanggal
  if (end && start > end) {
    throw new ApiError(400, "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.");
  }

  if (end && end < now) {
    throw new ApiError(400, "Tanggal selesai tidak boleh di masa lalu.");
  }

  // ✅ PERBAIKAN DI SINI:
  // Kita cek responden berdasarkan kuesionerId, karena tabel Jawaban/Responden 
  // di schema Abang tidak punya link langsung ke distribusiId.
  if (data.tanggalMulai) {
    const hasResponden = await prisma.respondenProfile.findFirst({
      where: { kuesionerId: distribusi.kuesionerId }
    });

    if (hasResponden) {
      throw new ApiError(
        400,
        "Tanggal mulai tidak bisa diubah karena sudah ada responden yang mengisi kuesioner ini."
      );
    }
  }

  return prisma.distribusiKuesioner.update({
    where: { distribusiId },
    data: {
      tanggalMulai: start,
      tanggalSelesai: end,
      catatan: data.catatan ?? distribusi.catatan,
    },
  });
};


export const deleteDistribusiService = async (id) => {
  const distribusiId = Number(id);

  // Pastikan distribusi ada
  const distribusi = await prisma.distribusiKuesioner.findUniqueOrThrow({
    where: { distribusiId },
  });

  const kuesionerId = distribusi.kuesionerId;

  // CEK: Apakah sudah ada responden terkait kuesioner ini?
  const used = await prisma.respondenProfile.findFirst({
    where: { kuesionerId },
  });

  if (used) {
    throw new ApiError(
      400,
      "Distribusi tidak dapat dihapus karena sudah ada responden yang mengisi kuesioner ini."
    );
  }

  // Hapus distribusi
  return prisma.distribusiKuesioner.delete({
    where: { distribusiId },
  });
};

