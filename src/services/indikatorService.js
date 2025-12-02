import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";


/**
 * GET ALL INDICATOR BY KUESIONER (list)
 */
export const getIndikatorService = async (kuesionerId) => {
  const id = Number(kuesionerId);

  // Pastikan kuesioner ada
  await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id },
  });

  const items = await prisma.indikator.findMany({
    where: { kuesionerId: id },
    orderBy: { indikatorId: "asc" },
  });

  return items;
};


/**
 * CREATE INDICATOR
 */
export const createIndikatorService = async (kuesionerId, data) => {
  const id = Number(kuesionerId);

  // Ambil kuesioner
  const kues = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id },
  });

  // Tidak boleh create kalau tidak draft
  if (kues.status !== "Draft") {
    throw new ApiError(400, "Indikator hanya bisa dibuat jika kuesioner berstatus Draft");
  }

  // Cek nama unik
  const existName = await prisma.indikator.findFirst({
    where: { kuesionerId: id, nama: data.nama.trim() },
  });
  if (existName) throw new ApiError(400, "Nama indikator sudah digunakan");

  // Cek kode unik
  const existKode = await prisma.indikator.findFirst({
    where: { kuesionerId: id, kode: data.kode.trim() },
  });
  if (existKode) throw new ApiError(400, "Kode indikator sudah digunakan");

  const newIndikator = await prisma.indikator.create({
    data: {
      kuesionerId: id,
      nama: data.nama.trim(),
      kode: data.kode.trim(),
    },
  });

  return newIndikator;
};


/**
 * UPDATE INDICATOR (PATCH)
 */
export const updateIndikatorService = async (id, updateData) => {
  const indikatorId = Number(id);

  // ambil indikator
  const indikator = await prisma.indikator.findUniqueOrThrow({
    where: { indikatorId },
    include: { kuesioner: true },
  });

  // Kuesioner harus Draft
  if (indikator.kuesioner.status !== "Draft") {
    throw new ApiError(400, "Indikator hanya bisa diperbarui jika kuesioner berstatus Draft");
  }

  const dataToUpdate = {};

  if (updateData.nama) {
    const existName = await prisma.indikator.findFirst({
      where: {
        kuesionerId: indikator.kuesionerId,
        nama: updateData.nama.trim(),
        indikatorId: { not: indikatorId },
      },
    });
    if (existName) throw new ApiError(400, "Nama indikator sudah digunakan");
    dataToUpdate.nama = updateData.nama.trim();
  }

  if (updateData.kode) {
    const existKode = await prisma.indikator.findFirst({
      where: {
        kuesionerId: indikator.kuesionerId,
        kode: updateData.kode.trim(),
        indikatorId: { not: indikatorId },
      },
    });
    if (existKode) throw new ApiError(400, "Kode indikator sudah digunakan");
    dataToUpdate.kode = updateData.kode.trim();
  }

  const updated = await prisma.indikator.update({
    where: { indikatorId },
    data: dataToUpdate,
  });

  return updated;
};


/**
 * DELETE INDICATOR
 */
export const deleteIndikatorService = async (id) => {
  const indikatorId = Number(id);

  return prisma.$transaction(async (tx) => {
    const indikator = await tx.indikator.findUniqueOrThrow({
      where: { indikatorId },
      include: { kuesioner: true },
    });

    // hanya draft yang boleh hapus
    if (indikator.kuesioner.status !== "Draft") {
      throw new ApiError(400, "Indikator hanya bisa dihapus jika kuesioner berstatus Draft");
    }

    // cek pertanyaan
    const hasPertanyaan = await tx.pertanyaan.findFirst({
      where: { indikatorId },
    });

    if (hasPertanyaan) {
      throw new ApiError(400, "Indikator tidak bisa dihapus karena memiliki pertanyaan");
    }

    // cek score/responden
    const hasScore = await tx.respondenScore.findFirst({
      where: { indikatorId },
    });
    if (hasScore) {
      throw new ApiError(400, "Indikator tidak bisa dihapus karena memiliki data score");
    }

    return tx.indikator.delete({
      where: { indikatorId },
    });
  });
};
