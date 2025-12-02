import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

export const getMonitoringListService = async ({
    search,
    status,
    kategori,
    page,
    limit,
}) => {
    const skip = (page - 1) * limit;

    // ========== FILTER BUILDER ==========
    const where = {
        AND: [
            search
                ? { judul: { contains: search } } // MySQL collation → already insensitive
                : undefined,

            status ? { status } : undefined,

            kategori ? { kategoriId: Number(kategori) } : undefined,
        ].filter(Boolean),
    };

    // ========== QUERY DATA ==========
    const [items, total] = await Promise.all([
        prisma.kuesioner.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                kuesionerId: true,
                judul: true,
                kategori: { select: { nama: true } },
                status: true,
                targetResponden: true,
                createdAt: true,
                _count: { select: { responden: true } },
            },
        }),
        prisma.kuesioner.count({ where }),
    ]);

    // ========== FORMAT OUTPUT ==========
    const formatted = items.map((k) => {
        const masuk = k._count.responden;
        const target = k.targetResponden ?? 0;

        const progress =
            target > 0
                ? Number(((masuk / target) * 100).toFixed(1)) // min 1 digit koma
                : null;

        return {
            kuesionerId: k.kuesionerId,
            judul: k.judul,
            kategori: k.kategori?.nama || null,
            status: k.status,
            targetResponden: target,
            responMasuk: masuk,
            progress,
            createdAt: k.createdAt,
        };
    });

    // ========== RETURN STRUCTURE ==========
    return {
        items: formatted,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit),
            filters: {
                search: search || null,
                status: status || null,
                kategori: kategori || null,
            },

            // UI helper metric: berapa kuesioner status Publish
            totalActive: formatted.filter((k) => k.status === "Publish").length,
        },
    };
};




export const getRespondenListService = async (
    kuesionerId,
    { page = 1, limit = 20, search }
) => {
    const id = Number(kuesionerId);
    const skip = (Number(page) - 1) * Number(limit);

    // 🔍 Ambil data kuesioner + total responden
    const kuesioner = await prisma.kuesioner.findUniqueOrThrow({
        where: { kuesionerId: id },
        select: {
            kuesionerId: true,
            judul: true,
            status: true,
            targetResponden: true,
            createdAt: true,
            kategori: { select: { nama: true } },
            _count: { select: { responden: true } }
        }
    });

    const masuk = kuesioner._count.responden;
    const target = kuesioner.targetResponden || 0;

    // 🎯 Hitung progress pencapaian
    const progress =
        target > 0
            ? Number(((masuk / target) * 100).toFixed(1)) // 1 angka belakang koma
            : null;

    // 🔍 Filter responden list
    const where = {
        kuesionerId: id,
        ...(search
            ? {
                OR: [
                    { nama: { contains: search, } },
                    { email: { contains: search, } },
                ],
            }
            : {}),
    };

    const [rawItems, total] = await Promise.all([
        prisma.respondenProfile.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            select: {
                respondenId: true,
                nama: true,
                email: true,
                waktuMulai: true,
                waktuSelesai: true,
            },
        }),
        prisma.respondenProfile.count({ where }),
    ]);
    const items = rawItems.map((r) => {
        let durasiDetik = null;

        if (r.waktuMulai && r.waktuSelesai) {
            durasiDetik = Math.round(
                (new Date(r.waktuSelesai) - new Date(r.waktuMulai)) / 1000
            );
        }

        return {
            respondenId: r.respondenId,
            nama: r.nama,
            email: r.email,
            waktuMulai: r.waktuMulai,
            waktuSelesai: r.waktuSelesai,
            durasiDetik,
        };
    });

    return {
        kuesioner: {
            ...kuesioner,
            totalResponden: masuk,
            progress, // ← ⭐ DITAMBAHKAN DI SINI
        },
        items,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
        },
    };
};



export const getRespondenDetailService = async (kuesionerId, respondenId) => {
    const kId = Number(kuesionerId);
    const rId = Number(respondenId);

    // pastikan kuesioner ada
    await prisma.kuesioner.findUniqueOrThrow({
        where: { kuesionerId: kId },
    });

    // ambil responden
    const responden = await prisma.respondenProfile.findFirst({
        where: { respondenId: rId, kuesionerId: kId },
        select: {
            respondenId: true,
            nama: true,
            email: true,
            usiaKategori: true,
            jenisKelamin: true,
            tingkatPendidikan: true,
            agama: true,
            pekerjaan: true,
            waktuMulai: true,
            waktuSelesai: true,
        },
    });

    if (!responden) {
        throw new ApiError(404, "Responden tidak ditemukan pada kuesioner ini");
    }

    // perhitungan durasi (detik)
    let durasiDetik = null;
    if (responden.waktuMulai && responden.waktuSelesai) {
        durasiDetik = Math.floor(
            (responden.waktuSelesai - responden.waktuMulai) / 1000
        );
    }

    // ambil jawaban lengkap (termasuk labelSkala)
    const jawabanRaw = await prisma.jawaban.findMany({
        where: { respondenId: rId },
        include: {
            pertanyaan: {
                select: {
                    teksPertanyaan: true,
                    urutan: true,
                    labelSkala: true,
                },
            },
        },
        orderBy: {
            pertanyaan: { urutan: "asc" },
        },
    });

    // format jawaban simpel
    const jawaban = jawabanRaw.map((j) => ({
        pertanyaanId: j.pertanyaanId,
        teksPertanyaan: j.pertanyaan.teksPertanyaan,
        urutan: j.pertanyaan.urutan,
        labelSkala: j.pertanyaan.labelSkala,
        nilai: j.nilai,
        labelDipilih: j.pertanyaan.labelSkala?.[j.nilai] || null,
    }));

    return {
        responden: {
            ...responden,
            durasiDetik,
        },
        jawaban,
    };
};
