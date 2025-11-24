import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

export const getPertanyaanByKuesionerService = async (kuesionerId) => {
    const result = await prisma.pertanyaan.findMany({
        where: {
            indikator: {
                kuesionerId,
            },
        },
        orderBy: { urutan: "asc" },
    });
    return result;
}

export const createPertanyaanService = async (data, kuesionerId) => {
    await prisma.indikator.findFirstOrThrow({
        where: {
            indikatorId: data.indikatorId,
            kuesionerId: Number(kuesionerId),
        },
    });

    const result = await prisma.pertanyaan.create({
        data: {
            indikatorId: Number(data.indikatorId),
            teksPertanyaan: data.teksPertanyaan,
            urutan : data.urutan
        }
    })

    return result;
}

export const updatePertanyaanService = async (id, updatedData) => {
    const pertanyaanId = Number(id);

    // 1. Pastikan pertanyaan ada
    const existing = await prisma.pertanyaan.findUniqueOrThrow({
        where: { pertanyaanId },
        include: { indikator: true },
    });

    // 2. Anti manipulasi — hanya field tertentu
    const allowedFields = ["teksPertanyaan", "urutan", "indikatorId"];
    const invalidFields = Object.keys(updatedData).filter(
        (f) => !allowedFields.includes(f)
    );

    if (invalidFields.length > 0) {
        throw new ApiError(400, `Field tidak diizinkan: ${invalidFields.join(", ")}`);
    }

    // 3. PUT → semua wajib dikirim
    const requiredFields = ["teksPertanyaan", "urutan", "indikatorId"];
    for (const field of requiredFields) {
        if (updatedData[field] === undefined) {
            throw new ApiError(400, `Field ${field} wajib dikirim`);
        }
    }

    // 4. Validasi indikator baru
    const indikatorId = Number(updatedData.indikatorId);
    const indikator = await prisma.indikator.findUnique({
        where: { indikatorId },
    });

    if (!indikator) {
        throw new ApiError(404, "Indikator tidak ditemukan");
    }

    // 5. Pastikan indikator baru masih di kuesioner yg sama
    if (indikator.kuesionerId !== existing.indikator.kuesionerId) {
        throw new ApiError(403, "Indikator tidak berada dalam kuesioner yang sama");
    }

    // 6. Update pertanyaan
    const result = await prisma.pertanyaan.update({
        where: { pertanyaanId },
        data: {
            teksPertanyaan: updatedData.teksPertanyaan.trim(),
            urutan: Number(updatedData.urutan),
            indikatorId: indikatorId,
        },
    });

    return result;
};


export const deletePertanyaanService = async (id, updatedData) => {
    const pertanyaanId = Number(id);

    // 1. Pastikan pertanyaan ada + include indikator
    const existing = await prisma.pertanyaan.findUniqueOrThrow({
        where: { pertanyaanId },
        include: { indikator: true }
    });

    // 2. Ambil indikatorId dari pertanyaan
    const indikatorId = existing.indikatorId;

    // 3. Validasi indikator terkait (opsional)
    const indikator = await prisma.indikator.findUnique({
        where: { indikatorId }
    }); 

    if (!indikator) {
        throw new ApiError(404, "Indikator tidak ditemukan");
    }

    // 4. Hapus pertanyaan
    const result = await prisma.pertanyaan.delete({
        where: { pertanyaanId }
    });

    return result;
};
