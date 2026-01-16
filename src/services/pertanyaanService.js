import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";


// GET semua pertanyaan per indikator
export const getPertanyaanService = async (indikatorId) => {
  const id = Number(indikatorId);

  await prisma.indikator.findUniqueOrThrow({
    where: { indikatorId: id },
  });

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



// CREATE pertanyaan
export const createPertanyaanService = async (indikatorId, data) => {
  const id = Number(indikatorId);

  const indikator = await prisma.indikator.findUniqueOrThrow({
    where: { indikatorId: id },
    include: {
      variabel: {
        include: { kuesioner: true },
      },
    },
  });

  if (indikator.variabel.kuesioner.status !== "Draft") {
    throw new ApiError(400, "Pertanyaan hanya boleh dibuat jika kuesioner Draft");
  }

  if (data.urutan == null || Number.isNaN(Number(data.urutan))) {
    throw new ApiError(400, "Urutan pertanyaan wajib berupa angka");
  }

  const existOrder = await prisma.pertanyaan.findFirst({
    where: { indikatorId: id, urutan: Number(data.urutan) },
  });

  if (existOrder) {
    throw new ApiError(400, "Urutan sudah digunakan");
  }

  const payload = {
    indikatorId: id,
    teksPertanyaan: String(data.teksPertanyaan || "").trim(),
    urutan: Number(data.urutan),
    labelSkala: null,
  };

  if (data.labelSkala !== undefined) {
    if (typeof data.labelSkala !== "object" || data.labelSkala === null || Array.isArray(data.labelSkala)) {
      throw new ApiError(400, "labelSkala harus berupa object JSON");
    }
    payload.labelSkala = data.labelSkala;
  }

  return prisma.pertanyaan.create({ data: payload });
};




 // UPDATE pertanyaan
export const updatePertanyaanService = async (id, data) => {
  const pertanyaanId = Number(id);

  const pertanyaan = await prisma.pertanyaan.findUniqueOrThrow({
    where: { pertanyaanId },
    include: {
      indikator: {
        include: {
          variabel: { include: { kuesioner: true } }
        }
      }
    },
  });

  if (pertanyaan.indikator.variabel.kuesioner.status !== "Draft") {
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

    const existOrder = await prisma.pertanyaan.findFirst({
      where: {
        indikatorId: pertanyaan.indikatorId,
        urutan: newUrutan,
        pertanyaanId: { not: pertanyaanId },
      },
    });

    if (existOrder) throw new ApiError(400, "Urutan sudah digunakan");

    payload.urutan = newUrutan;
  }

  if (data.labelSkala !== undefined) {
    if (data.labelSkala === null) {
      payload.labelSkala = null;
    } else if (typeof data.labelSkala !== "object" || Array.isArray(data.labelSkala)) {
      throw new ApiError(400, "labelSkala harus JSON object atau null");
    } else {
      payload.labelSkala = data.labelSkala;
    }
  }

  if (Object.keys(payload).length === 0) {
    return pertanyaan; 
  }

  return prisma.pertanyaan.update({
    where: { pertanyaanId },
    data: payload,
  });
};




 //DELETE pertanyaan
 
export const deletePertanyaanService = async (id) => {
  const pertanyaanId = Number(id);

  return prisma.$transaction(async (tx) => {
    const pertanyaan = await tx.pertanyaan.findUniqueOrThrow({
      where: { pertanyaanId },
      include: {
        indikator: {
          include: {
            variabel: { include: { kuesioner: true } }
          }
        }
      },
    });

    if (pertanyaan.indikator.variabel.kuesioner.status !== "Draft") {
      throw new ApiError(400, "Pertanyaan hanya bisa dihapus jika kuesioner Draft");
    }

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
