import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";


// get all variabel by kuesioner
export const getVariabelService = async (kuesionerId) => {

  kuesionerId = Number(kuesionerId);

  await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId }
  });

  return prisma.variabel.findMany({
    where: { kuesionerId },
    orderBy: { variabelId: "asc" }
  });
};


// create variabel
export const createVariabelService = async (kuesionerId, data) => {

  kuesionerId = Number(kuesionerId);

  const kues = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId }
  });

  // hanya boleh tambah saat draft
  if (kues.status !== "Draft") {
    throw new ApiError(403, "Tidak dapat menambah variabel karena kuesioner bukan Draft.");
  }

  // normalisasi
  const payload = {
    kuesionerId,
    kode: data.kode.trim(),
    nama: data.nama.trim(),
    deskripsi: data.deskripsi?.trim() ?? null,
  };

  try {
    return await prisma.variabel.create({ data: payload });
  } catch (err) {
    // error kode duplikat
    if (err.code === "P2002") {
      throw new ApiError(400, "Kode variabel sudah digunakan.");
    }
    throw err;
  }
};


// update variabel
export const updateVariabelService = async (id, data) => {

  const variabelId = Number(id);

  const variabel = await prisma.variabel.findUniqueOrThrow({
    where: { variabelId },
    include: { kuesioner: true }
  });

  // hanya boleh update saat draft
  if (variabel.kuesioner.status !== "Draft") {
    throw new ApiError(403, "Variabel tidak dapat diupdate karena kuesioner bukan Draft.");
  }

  // field yang boleh diupdate
  const allowed = ["kode", "nama", "deskripsi"];
  const updateData = {};

  for (const key of allowed) {
    if (data[key] !== undefined) {
      updateData[key] = typeof data[key] === "string" ? data[key].trim() : data[key];
    }
  }

  // tidak ada perubahan
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Tidak ada data yang valid untuk diperbarui.");
  }

  try {
    return await prisma.variabel.update({
      where: { variabelId },
      data: updateData
    });
  } catch (err) {
    // error kode duplikat
    if (err.code === "P2002") {
      throw new ApiError(400, "Kode variabel sudah digunakan.");
    }
    throw err;
  }
};


// delete variabel
export const deleteVariabelService = async (id) => {

  const variabelId = Number(id);

  return prisma.$transaction(async (tx) => {

    const variabel = await tx.variabel.findUniqueOrThrow({
      where: { variabelId },
      include: { kuesioner: true }
    });

    // hanya boleh hapus saat draft
    if (variabel.kuesioner.status !== "Draft") {
      throw new ApiError(403, "Variabel tidak dapat dihapus karena kuesioner bukan Draft.");
    }

    // cek indikator
    const existIndikator = await tx.indikator.findFirst({
      where: { variabelId }
    });

    if (existIndikator) {
      throw new ApiError(400, "Tidak dapat menghapus variabel karena masih memiliki indikator.");
    }

    return tx.variabel.delete({
      where: { variabelId }
    });
  });
};
