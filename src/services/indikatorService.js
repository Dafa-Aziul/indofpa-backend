import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

// get all indikator by variabels
export const getIndikatorService = async (variabelId) => {
  const id = Number(variabelId);

  await prisma.variabel.findUniqueOrThrow({
    where: { variabelId: id },
  });

  const items = await prisma.indikator.findMany({
    where: { variabelId: id },
    orderBy: { indikatorId: "asc" },
  });

  return items;
};

// create indikator
export const createIndikatorService = async (variabelId, data) => {
  const id = Number(variabelId);

  const variabel = await prisma.variabel.findUniqueOrThrow({
    where: { variabelId: id },
    include: { kuesioner: true },
  });

  if (variabel.kuesioner.status !== "Draft") {
    throw new ApiError(400, "Indikator hanya bisa dibuat jika kuesioner berstatus Draft");
  }

  // cek nama unik
  const existName = await prisma.indikator.findFirst({
    where: {
      variabelId: id,
      nama: data.nama.trim(),
    },
  });
  if (existName) throw new ApiError(400, "Nama indikator sudah digunakan");

  // cek kode unik
  const existKode = await prisma.indikator.findFirst({
    where: {
      variabelId: id,
      kode: data.kode.trim(),
    },
  });
  if (existKode) throw new ApiError(400, "Kode indikator sudah digunakan");

  return prisma.indikator.create({
    data: {
      variabelId: id,
      nama: data.nama.trim(),
      kode: data.kode.trim(),
    },
  });
};


// update indikator (PATCH)
export const updateIndikatorService = async (id, data) => {
  const indikatorId = Number(id);

  const indikator = await prisma.indikator.findUniqueOrThrow({
    where: { indikatorId },
    include: { variabel: { include: { kuesioner: true } } },
  });

  if (indikator.variabel.kuesioner.status !== "Draft") {
    throw new ApiError(400, "Indikator hanya bisa diperbarui jika kuesioner berstatus Draft");
  }

  const updateData = {};

  if (data.nama) {
    const existName = await prisma.indikator.findFirst({
      where: {
        variabelId: indikator.variabelId,
        nama: data.nama.trim(),
        indikatorId: { not: indikatorId },
      },
    });
    if (existName) throw new ApiError(400, "Nama indikator sudah digunakan");
    updateData.nama = data.nama.trim();
  }

  if (data.kode) {
    const existKode = await prisma.indikator.findFirst({
      where: {
        variabelId: indikator.variabelId,
        kode: data.kode.trim(),
        indikatorId: { not: indikatorId },
      },
    });
    if (existKode) throw new ApiError(400, "Kode indikator sudah digunakan");
    updateData.kode = data.kode.trim();
  }

  return prisma.indikator.update({
    where: { indikatorId },
    data: updateData,
  });
};


// delete indikator
export const deleteIndikatorService = async (id) => {
  const indikatorId = Number(id);

  return prisma.$transaction(async (tx) => {
    const indikator = await tx.indikator.findUniqueOrThrow({
      where: { indikatorId },
      include: { variabel: { include: { kuesioner: true } } },
    });

    if (indikator.variabel.kuesioner.status !== "Draft") {
      throw new ApiError(400, "Indikator hanya bisa dihapus jika kuesioner berstatus Draft");
    }

    const hasPertanyaan = await tx.pertanyaan.findFirst({
      where: { indikatorId },
    });
    if (hasPertanyaan) throw new ApiError(400, "Indikator memiliki pertanyaan, tidak bisa dihapus");

    const hasScore = await tx.respondenScore.findFirst({
      where: { indikatorId },
    });
    if (hasScore) throw new ApiError(400, "Indikator memiliki data score, tidak bisa dihapus");

    return tx.indikator.delete({
      where: { indikatorId },
    });
  });
};
