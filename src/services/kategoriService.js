import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";


// GET KATEGORI (list + search + pagination)
export const getKategoriService = async ({ search, page, limit }) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
      nama: {
        contains: search,  // ❗ tanpa mode
      },
    }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.kategori.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.kategori.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      search: search || null,
    },
  };
};



// CREATE KATEGORI
export const createKategoriService = async ({ nama }) => {
  const exist = await prisma.kategori.findFirst({
    where: { nama: nama.trim() },
  });

  if (exist) {
    throw new ApiError(400, "Nama kategori sudah digunakan");
  }

  return prisma.kategori.create({
    data: { nama },
  });
};


// UPDATE KATEGORI
export const updateKategoriService = async (id, { nama }) => {
  const kategoriId = Number(id);

  await prisma.kategori.findUniqueOrThrow({
    where: { kategoriId },
  });


  const exist = await prisma.kategori.findFirst({
    where: {
      nama: nama.trim(),
      kategoriId: { not: kategoriId },
    },
  });

  if (exist) {
    throw new ApiError(400, "Nama kategori sudah digunakan kategori lain");
  }

  return prisma.kategori.update({
    where: { kategoriId },
    data: { nama },
  });
};


// DELETE KATEGORI (WAJIB TRANSACTION)
export const deleteKategoriService = async (id) => {
  return prisma.$transaction(async (tx) => {
    const kategoriId = Number(id);

    await tx.kategori.findUniqueOrThrow({
      where: { kategoriId },
    });

    const used = await tx.kuesioner.findFirst({
      where: { kategoriId },
    });

    if (used) {
      throw new ApiError(
        400,
        "Kategori tidak bisa dihapus karena masih digunakan kuesioner."
      );
    }

    return tx.kategori.delete({
      where: { kategoriId },
    });
  });
};
