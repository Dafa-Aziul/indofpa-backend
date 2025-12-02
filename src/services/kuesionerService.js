import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

/* ======================================================
   GET ALL KUESIONER (pagination, search, filter)
====================================================== */
export const getKuesionerService = async ({
  search,
  status,
  kategori,
  page,
  limit,
}) => {

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? { judul: { contains: search, } }
        : undefined,

      status ? { status } : undefined,

      kategori ? { kategoriId: Number(kategori) } : undefined,
    ].filter(Boolean),
  };

  const items = await prisma.kuesioner.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      kategori: true,
      pembuat: { select: { userId: true, nama: true, email: true } },
      _count: {
        select: { responden: true, indikator: true },
      },
    },
  });

  const total = await prisma.kuesioner.count({ where });

  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};



/* ======================================================
   GET DETAIL KUESIONER (indikator + pertanyaan)
====================================================== */
export const getKuesionerByIdService = async (id) => {
  const kuesionerId = Number(id);

  await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId },
  });

  const kuesioner = await prisma.kuesioner.findUnique({
    where: { kuesionerId },
    include: {
      kategori: true,
      pembuat: { select: { userId: true, nama: true, email: true } },
      distribusi: true,
      _count: { select: { responden: true } },
    },
  });

  const indikator = await prisma.indikator.findMany({
    where: { kuesionerId },
    orderBy: { indikatorId: "asc" },
  });

  const pertanyaan = await prisma.pertanyaan.findMany({
    where: {
      indikator: { kuesionerId },
    },
    orderBy: { urutan: "asc" },
  });

  return { kuesioner, indikator, pertanyaan };
};



/* ======================================================
   CREATE KUESIONER
====================================================== */
export const createKuesionerService = async (data, userId) => {
  const kategoriId = Number(data.kategoriId);

  await prisma.kategori.findUniqueOrThrow({
    where: { kategoriId },
  });

  return prisma.kuesioner.create({
    data: {
      pembuatId: userId,
      kategoriId,
      judul: data.judul,
      tujuan: data.tujuan ?? null,
      manfaat: data.manfaat ?? null,
      estimasiMenit: data.estimasiMenit ?? null,
      targetResponden: data.targetResponden ?? null,
      status: "Draft",
    },
  });
};



/* ======================================================
   UPDATE KUESIONER
====================================================== */
export const updateKuesionerService = async (id, updateData) => {
  const kuesionerId = Number(id);

  const kues = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId },
  });

  // ❌ Tidak boleh update kalau bukan Draft
  if (kues.status !== "Draft") {
    throw new ApiError(
      403,
      "Kuesioner tidak bisa diupdate karena status bukan Draft"
    );
  }

  // Field yang boleh diupdate
  const allowed = [
    "judul",
    "tujuan",
    "manfaat",
    "kategoriId",
    "estimasiMenit",
    "targetResponden",
  ];

  const dataToUpdate = {};

  for (const f of allowed) {
    if (updateData[f] !== undefined) {
      dataToUpdate[f] = updateData[f];
    }
  }

  // Validasi kategoriId
  if (dataToUpdate.kategoriId) {
    await prisma.kategori.findUniqueOrThrow({
      where: { kategoriId: Number(dataToUpdate.kategoriId) },
    });
  }

  return prisma.kuesioner.update({
    where: { kuesionerId },
    data: dataToUpdate,
  });
};



/* ======================================================
   DELETE KUESIONER (WITH TRANSACTION)
====================================================== */
export const deleteKuesionerService = async (id) => {
  const kuesionerId = Number(id);

  return prisma.$transaction(async (tx) => {
    const kues = await tx.kuesioner.findUniqueOrThrow({
      where: { kuesionerId },
    });

    if (kues.status !== "Draft") {
      throw new ApiError(403, "Kuesioner hanya bisa dihapus ketika status Draft");
    }

    // Cek responden
    const existResponden = await tx.respondenProfile.findFirst({
      where: { kuesionerId },
    });

    if (existResponden) {
      throw new ApiError(400, "Tidak bisa menghapus kuesioner karena memiliki responden");
    }

    // Cek score
    const existScore = await tx.respondenScore.findFirst({
      where: { kuesionerId },
    });

    if (existScore) {
      throw new ApiError(400, "Tidak bisa menghapus kuesioner karena memiliki data score");
    }

    // Cek distribusi
    const existDistribusi = await tx.distribusiKuesioner.findFirst({
      where: { kuesionerId },
    });

    if (existDistribusi) {
      throw new ApiError(400, "Tidak bisa menghapus kuesioner karena sudah didistribusi");
    }

    // Hapus
    return tx.kuesioner.delete({
      where: { kuesionerId },
    });
  });
};



/* ======================================================
   ARSIPKAN KUESIONER
====================================================== */
export const arsipKuesionerService = async (id) => {
  const kuesionerId = Number(id);

  const data = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId }
  });

  if (data.status === "Draft") {
    throw new ApiError(400, "Kuesioner Draft tidak bisa diarsipkan.");
  }

  if (data.status === "Arsip") {
    throw new ApiError(400, "Kuesioner sudah diarsipkan sebelumnya.");
  }

  return prisma.kuesioner.update({
    where: { kuesionerId },
    data: { status: "Arsip" }
  });
};
