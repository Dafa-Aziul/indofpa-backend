import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

/**
 * GET PERTANYAAN PER INDIKATOR
 */
export const getPertanyaanService = async (indikatorId) => {
  const id = Number(indikatorId);

  // pastikan indikator ada
  await prisma.indikator.findUniqueOrThrow({
    where: { indikatorId: id },
  });

  // ambil pertanyaan lengkap termasuk labelSkala
  return prisma.pertanyaan.findMany({
    where: { indikatorId: id },
    orderBy: { urutan: "asc" },
    select: {
      pertanyaanId: true,
      indikatorId: true,
      teksPertanyaan: true,
      urutan: true,
      labelSkala: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


/**
 * CREATE PERTANYAAN
 */
export const createPertanyaanService = async (indikatorId, data) => {
  const id = Number(indikatorId);

  // cari indikator + kuesioner
  const indikator = await prisma.indikator.findUniqueOrThrow({
    where: { indikatorId: id },
    include: { kuesioner: true },
  });

  // kuesioner harus draft
  if (indikator.kuesioner.status !== "Draft") {
    throw new ApiError(400, "Pertanyaan hanya bisa dibuat jika kuesioner Draft");
  }

  // validasi urutan
  if (data.urutan === undefined || Number.isNaN(Number(data.urutan))) {
    throw new ApiError(400, "Urutan pertanyaan wajib diisi dan harus angka");
  }

  // cek urutan tidak duplikat
  const existOrder = await prisma.pertanyaan.findFirst({
    where: { indikatorId: id, urutan: Number(data.urutan) },
  });

  if (existOrder) {
    throw new ApiError(400, "Urutan pertanyaan sudah digunakan");
  }

  // siapkan payload
  const payload = {
    indikatorId: id,
    teksPertanyaan: (data.teksPertanyaan || "").trim(),
    urutan: Number(data.urutan),
    labelSkala: null,
  };

  // jika labelSkala disertakan, validasi sederhana (harus object non-null)
  if (data.labelSkala !== undefined) {
    if (typeof data.labelSkala !== "object" || data.labelSkala === null || Array.isArray(data.labelSkala)) {
      throw new ApiError(400, "labelSkala harus berupa object JSON (contoh: {\"1\":\"Tidak\",\"5\":\"Sangat\"})");
    }
    payload.labelSkala = data.labelSkala;
  }

  return prisma.pertanyaan.create({
    data: payload,
  });
};


/**
 * UPDATE PERTANYAAN (PATCH)
 */
export const updatePertanyaanService = async (id, data) => {
  const pertanyaanId = Number(id);

  const pertanyaan = await prisma.pertanyaan.findUniqueOrThrow({
    where: { pertanyaanId },
    include: { indikator: { include: { kuesioner: true } } },
  });

  // Kuesioner harus draft
  if (pertanyaan.indikator.kuesioner.status !== "Draft") {
    throw new ApiError(400, "Pertanyaan hanya bisa diupdate jika kuesioner Draft");
  }

  const payload = {};

  if (data.teksPertanyaan !== undefined) {
    payload.teksPertanyaan = String(data.teksPertanyaan).trim();
  }

  if (data.urutan !== undefined) {
    const newUrutan = Number(data.urutan);
    if (Number.isNaN(newUrutan) || newUrutan < 1) {
      throw new ApiError(400, "Urutan tidak valid");
    }

    // cek urutan tidak bentrok
    const existOrder = await prisma.pertanyaan.findFirst({
      where: {
        indikatorId: pertanyaan.indikatorId,
        urutan: newUrutan,
        pertanyaanId: { not: pertanyaanId },
      },
    });

    if (existOrder) throw new ApiError(400, "Urutan pertanyaan sudah digunakan");

    payload.urutan = newUrutan;
  }

  if (data.labelSkala !== undefined) {
    if (data.labelSkala === null) {
      // allow explicitly clearing labelSkala
      payload.labelSkala = null;
    } else {
      if (typeof data.labelSkala !== "object" || Array.isArray(data.labelSkala)) {
        throw new ApiError(400, "labelSkala harus berupa object JSON atau null");
      }
      payload.labelSkala = data.labelSkala;
    }
  }

  // jika tidak ada field untuk diupdate, return object awal (atau throw?)
  if (Object.keys(payload).length === 0) {
    return pertanyaan; // tidak ada perubahan
  }

  return prisma.pertanyaan.update({
    where: { pertanyaanId },
    data: payload,
  });
};


/**
 * DELETE PERTANYAAN
 */
export const deletePertanyaanService = async (id) => {
  const pertanyaanId = Number(id);

  return prisma.$transaction(async (tx) => {
    const pertanyaan = await tx.pertanyaan.findUniqueOrThrow({
      where: { pertanyaanId },
      include: { indikator: { include: { kuesioner: true } } },
    });

    // Kuesioner harus draft
    if (pertanyaan.indikator.kuesioner.status !== "Draft") {
      throw new ApiError(400, "Pertanyaan hanya bisa dihapus jika kuesioner Draft");
    }

    // Tidak boleh delete jika sudah ada jawaban
    const hasJawaban = await tx.jawaban.findFirst({
      where: { pertanyaanId },
    });

    if (hasJawaban) {
      throw new ApiError(400, "Pertanyaan tidak bisa dihapus karena sudah memiliki jawaban");
    }

    return tx.pertanyaan.delete({
      where: { pertanyaanId },
    });
  });
};
