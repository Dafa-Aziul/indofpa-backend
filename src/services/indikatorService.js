import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

export const getIndikatorByKuesionerService = async ({ page, limit, kuesionerId }) => {
    const skip = (page - 1) * limit;

    const items = await prisma.indikator.findMany({
        where: { kuesionerId: Number(kuesionerId) },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
    });

    const total = await prisma.indikator.count({
        where: { kuesionerId: Number(kuesionerId) },
    });

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


export const createIndikatorService = async (data, kuesionerId) => {
    // pastikan kuesionernya ada
    await prisma.kuesioner.findUniqueOrThrow({
        where: { kuesionerId: Number(kuesionerId) },
    });

    // buat indikator baru
    const result = await prisma.indikator.create({
        data: {
            nama: data.nama,
            kode: data.kode,
            kuesionerId: Number(kuesionerId),
        },
    });

    return result;
};


export const updateIndikatorService = async (id, updatedData) => {
    const indikator = await prisma.indikator.findUniqueOrThrow({
        where: { indikatorId: Number(id) }
    });

    if (!indikator) {
        throw new ApiError(404, "Indikator tidak ditemukan");
    }
    
    const allowedFields = ["nama", "kode"];
    const dataToUpdate = {};

    for (const field of allowedFields) {
        if (updatedData[field] !== undefined) {
            dataToUpdate[field] = updatedData[field];
        };
    }

    const result = await prisma.indikator.update({
        where: { indikatorId: Number(id) },
        data: dataToUpdate,
    });

    return result;
}


export const deleteIndikatorService = async (id) => {
    // Cek indikator ada
    const indikator = await prisma.indikator.findUniqueOrThrow({
        where: { indikatorId: Number(id) }
    });

    if (!indikator) {
        throw new ApiError(404, "Indikator tidak ditemukan");
    }
    // Cek apakah indikator dipakai pertanyaan
    const used = await prisma.pertanyaan.count({
        where: { indikatorId: Number(id) },
    });

    if (used > 0) {
        throw new ApiError(
            403,
            "Indikator sudah memiliki pertanyaan, tidak bisa dihapus"
        );
    }

    // Hapus indikator
    const result = await prisma.indikator.delete({
        where: { indikatorId: Number(id) },
    });

    return result;
};
