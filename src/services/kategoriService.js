import prisma from "../config/prisma.js"

export const getKategoriService = async ({
    search,
    page,
    limit,
}) => {
    const skip = (page - 1) * limit;

    const where = {
        OR: search
            ? [
                {
                    nama: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
            : undefined,
    };
    
    //Query utama
    const items = await prisma.kategori.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc"
        }
    });

    const total = await prisma.kategori.count({where});

    return {
        items, 
        pagination: {
            page,
            limit, 
            total, 
            pages: Math.ceil( total/limit),
        }
    }

};

export const createKategoriService = async ({ nama }) => {
    const newKategori = await prisma.kategori.create({
        data: { nama }
    });
    
    return newKategori;
};

export const updateKategoriService = async ( id ,{ nama }) => {
    const updated = await prisma.kategori.update({
        where: { id : Number(id)},
        data: { nama }
    });
    return updated;
}

export const deleteKategoriService = async ( id ) => {
    const data = await prisma.kategori.delete({
        where: {id: Number(id)}
    });
    return data;
}