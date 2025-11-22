import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

/**
 * GET ALL KUESIONER (dengan pagination & filter)
 */
export const getKuesionerService = async ({
  search,
  status,
  kategori,
  page,
  limit,
}) => {
  const skip = (page - 1) * limit;

  const where = {
    OR: search
      ? [
          {
            judul: {
              contains: search,
              mode: "insensitive",
            },
          },
        ]
      : undefined,

    status: status || undefined,
    kategoriId: kategori ? Number(kategori) : undefined,
  };

  const items = await prisma.kuesioner.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.kuesioner.count({ where });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * GET DETAIL KUESIONER
 */
export const getKuesionerByIdService = async (id) => {
  await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: Number(id) },
  });

  const data = await prisma.kuesioner.findUnique({
    where: { kuesionerId: Number(id) },
    include: {
      kategori: true,
      indikator: {
        include: {
          pertanyaan: {
            orderBy: { urutan: "asc" },
          },
        },
      },
      distribusi: true,
      _count: {
        select: { responden: true },
      },
    },
  });

  return data;
};

/**
 * CREATE KUESIONER
 */
export const createKuesionerService = async (data, userId) => {
  // Validasi kategori
  await prisma.kategori.findUniqueOrThrow({
    where: { kategoriId: Number(data.kategoriId) },
  });

  const newKuesioner = await prisma.kuesioner.create({
    data: {
      pembuatId: userId,
      kategoriId: Number(data.kategoriId),
      judul: data.judul,
      tujuan: data.tujuan,
      manfaat: data.manfaat,
      status: data.status || "Draft",
    },
  });

  return newKuesioner;
};

/**
 * UPDATE KUESIONER
 */
export const updateKuesionerService = async (id, updateData) => {
  await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: Number(id) },
  });

  const allowedFields = ["judul", "tujuan", "manfaat", "status", "kategoriId"];
  const dataToUpdate = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      dataToUpdate[key] = updateData[key];
    }
  }

  // Jika kategoriId ingin diupdate → check valid
  if (updateData.kategoriId !== undefined) {
    await prisma.kategori.findUniqueOrThrow({
      where: { kategoriId: Number(updateData.kategoriId) },
    });
  }

  const updated = await prisma.kuesioner.update({
    where: { kuesionerId: Number(id) },
    data: dataToUpdate,
  });

  return updated;
};

/**
 * DELETE KUESIONER
 */
export const deleteKuesionerService = async (id) => {
  const kuesioner = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: Number(id) },
  });

  if (kuesioner.status !== "Draft") {
    throw new ApiError(
      403,
      "Kuesioner hanya bisa dihapus jika status Draft",
      { status: kuesioner.status }
    );
  }

  const data = await prisma.kuesioner.delete({
    where: { kuesionerId: Number(id) },
  });

  return data;
};
