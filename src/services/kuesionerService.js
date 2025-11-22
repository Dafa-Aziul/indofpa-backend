import prisma from "../config/prisma.js";

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
                    }
                }
            ]
            : undefined,
        status: status || undefined,
        kategori: kategori ? Number(kategori) : undefined,
    };

    //Query utama 
    const items = await prisma.kuesioner.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc"
        }
    });

    // Hitung total pagination
    const total = await prisma.kuesioner.count({ where });

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        }
    };
};

export const getKuesionerByIdService = async (id) => {
    const data = await prisma.kuesioner.findUnique({
        where: { kuesionerId: Number(id) },
        include: {
            kategori: true,
            indikator: {
                include: {
                    pertanyaan: {
                        orderBy: {
                            urutan: "asc",
                        }
                    },
                },
            },

            distribusi: true,

            _count: {
                select: { responden: true }
            },
        },
    });
    return data;
}

export const createKuesionerService = async (data, userId) => {
    const newKuesioner = await prisma.kuesioner.create({
        data: {
            pembuatId: userId,
            kategoriId: data.kategoriId,
            judul: data.judul,
            tujuan: data.tujuan,
            manfaat: data.manfaat,
            status: data.status || "Draft",
        },
    });

    return newKuesioner;
};


export const updateKuesionerService = async (id, updateData) => {
    const allowedFields = ["judul", "tujuan", "manfaat", "status", "kategoriId"];


    const dataToUpdate = {};

    //hanya memasukan field yang ada dalam allowedFields
    for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
            dataToUpdate[key] = updateData[key];
        }
    }


    //eksekusi PATCH
    const updated = await prisma.kuesioner.update({
        where: { kuesionerId: Number(id) },
        data: dataToUpdate
    });

    return updated;
}

export const deleteKuesionerService = async (id) => {
    const data = await prisma.kuesioner.delete({
        where: { kuesionerId: Number(id) }
    });
    return data;
}