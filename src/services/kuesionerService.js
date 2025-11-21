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
    const total =  await prisma.kuesioner.count({ where });

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