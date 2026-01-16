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

    const where = {
        AND: [
            search
                ? { judul: { contains: search } } 
                : undefined,

            status ? { status } : undefined,

            kategori ? { kategoriId: Number(kategori) } : undefined,
        ].filter(Boolean),
    };

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

    const formatted = items.map((k) => {
        const masuk = k._count.responden;
        const target = k.targetResponden ?? 0;

        const progress =
            target > 0
                ? Number(((masuk / target) * 100).toFixed(1)) 
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

            totalActive: formatted.filter((k) => k.status === "Publish").length,
        },
    };
};






export const getRespondenListService = async (
    kuesionerId,
    { page = 1, limit = 20, search }
) => {
    const id = Number(kuesionerId);
    const parsedLimit = Number(limit) || 20;
    const parsedPage = Number(page) || 1;
    const skip = (parsedPage - 1) * parsedLimit;

    const kuesionerRaw = await prisma.kuesioner.findUniqueOrThrow({
        where: { kuesionerId: id },
        select: {
            kuesionerId: true,
            judul: true,
            status: true,
            targetResponden: true,
            createdAt: true,
            kategori: { select: { nama: true } },
            _count: { select: { responden: true } },
            distribusi: {
                select: {
                    tanggalMulai: true,
                    tanggalSelesai: true,
                },
                orderBy: { tanggalMulai: 'asc' },
            }
        },
    });

    const masuk = kuesionerRaw._count.responden;
    const target = kuesionerRaw.targetResponden || 0;

    const progress =
        target > 0
            ? Number(((masuk / target) * 100).toFixed(1))
            : 0;

    const distribusiTerakhir = kuesionerRaw.distribusi.length > 0
        ? kuesionerRaw.distribusi[kuesionerRaw.distribusi.length - 1]
        : null;

    const startDate = kuesionerRaw.distribusi[0]?.tanggalMulai;
    const endDate = distribusiTerakhir?.tanggalSelesai;


    const where = {
        kuesionerId: id,
        ...(search
            ? {
                OR: [
                    { nama: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {}),
    };

    const [rawItems, total] = await Promise.all([
        prisma.respondenProfile.findMany({
            where,
            skip,
            take: parsedLimit,
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
                (new Date(r.waktuSelesai).getTime() - new Date(r.waktuMulai).getTime()) / 1000
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

            kuesionerId: kuesionerRaw.kuesionerId,
            judul: kuesionerRaw.judul,
            status: kuesionerRaw.status,
            targetResponden: kuesionerRaw.targetResponden,
            createdAt: kuesionerRaw.createdAt,
            kategori: kuesionerRaw.kategori,


            totalResponden: masuk,
            progress,
            startDate,
            endDate,
        },
        items,
        meta: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            pages: Math.ceil(total / parsedLimit),
        },
    };
};


export const getRespondenDetailService = async (kuesionerId, respondenId) => {
    const kId = Number(kuesionerId);
    const rId = Number(respondenId);

    // 1. Ambil data kuesioner dan indikator untuk konteks skor
    const kuesioner = await prisma.kuesioner.findUniqueOrThrow({
        where: { kuesionerId: kId },
        select: {
            judul: true,
            variabel: {
                select: {
                    indikator: {
                        select: {
                            indikatorId: true,
                            nama: true,
                            pertanyaan: {
                                select: {
                                    pertanyaanId: true,
                                    labelSkala: true, // JSON
                                }
                            }
                        }
                    }
                }
            }
        },
    });

    // Flatten indicators and determine global max scale
    let indicators = kuesioner.variabel.flatMap(v => v.indikator);
    let maxNilaiPertanyaan = 5; // Default fallback

    // Tentukan skala maksimum dari labelSkala (diambil dari pertanyaan pertama)
    if (indicators.length > 0 && indicators[0].pertanyaan.length > 0 && indicators[0].pertanyaan[0].labelSkala) {
        const labels = indicators[0].pertanyaan[0].labelSkala;

        if (labels && typeof labels === 'object') {
            // ✅ PERBAIKAN: Menghapus 'as Record<string, string>'
            const keys = Object.keys(labels).map(Number);
            if (keys.length > 0) {
                maxNilaiPertanyaan = Math.max(...keys);
            }
        }
    }


    // 2. Ambil responden
    const responden = await prisma.respondenProfile.findFirst({
        where: { respondenId: rId, kuesionerId: kId },
        select: {
            respondenId: true, nama: true, email: true, usiaKategori: true,
            jenisKelamin: true, tingkatPendidikan: true, agama: true,
            pekerjaan: true, waktuMulai: true, waktuSelesai: true,
        },
    });

    if (!responden) {
        throw new ApiError(404, "Responden tidak ditemukan pada kuesioner ini");
    }

    // 3. Perhitungan Durasi (Detik)
    let durasiDetik = null;
    if (responden.waktuMulai && responden.waktuSelesai) {
        durasiDetik = Math.floor(
            (responden.waktuSelesai.getTime() - responden.waktuMulai.getTime()) / 1000
        );
    }

    // 4. Ambil Jawaban Lengkap (Untuk tampilan detail dan Ringkasan)
    const jawabanRaw = await prisma.jawaban.findMany({
        where: { respondenId: rId },
        include: {
            pertanyaan: {
                select: {
                    pertanyaanId: true,
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

    // 5. Ambil Skor dari RespondenScore
    const rawIndicatorScores = await prisma.respondenScore.findMany({
        where: { respondenId: rId, kuesionerId: kId },
        select: {
            indikatorId: true,
            scoreRaw: true,
            scoreNormalized: true
        },
    });

    // 6. HITUNG RINGKASAN SKOR TOTAL
    const totalJawaban = jawabanRaw.length;
    let totalNilaiDijawab = 0;

    jawabanRaw.forEach(j => {
        totalNilaiDijawab += j.nilai;
    });

    const maxTotalSkor = maxNilaiPertanyaan * totalJawaban;
    const rataRataSkor = totalJawaban > 0 ? (totalNilaiDijawab / totalJawaban) : 0;
    const pencapaian = maxNilaiPertanyaan > 0 ? (rataRataSkor / maxNilaiPertanyaan) * 100 : 0;


    const ringkasan = {
        teksRingkasan: `Total skor dari ${totalJawaban} pertanyaan kuesioner: ${kuesioner.judul}`,
        totalSkor: `${totalNilaiDijawab} / ${maxTotalSkor}`,
        rataRataSkor: `${rataRataSkor.toFixed(2)} dari ${maxNilaiPertanyaan.toFixed(2)}`,
        pencapaian: `${pencapaian.toFixed(1)}%`,
    };


    // 7. Map Skor Indikator untuk Frontend
    const indicatorScores = rawIndicatorScores.map(score => {
        const indicator = indicators.find(i => i.indikatorId === score.indikatorId);
        const numQuestions = indicator?.pertanyaan.length || 0;
        const maxScore = numQuestions * maxNilaiPertanyaan;

        return {
            indikatorId: score.indikatorId,
            namaIndikator: indicator?.nama || 'N/A',
            scoreRaw: score.scoreRaw,
            scoreNormalized: score.scoreNormalized,
            maxScore: maxScore,
        };
    });


    // 8. Format Jawaban Simpel
    const jawaban = jawabanRaw.map((j) => ({
        pertanyaanId: j.pertanyaan.pertanyaanId,
        teksPertanyaan: j.pertanyaan.teksPertanyaan,
        urutan: j.pertanyaan.urutan,
        labelSkala: j.pertanyaan.labelSkala,
        nilai: j.nilai,
        labelDipilih: j.pertanyaan.labelSkala?.[j.nilai.toString()] || null,
    }));


    return {
        responden: {
            ...responden,
            durasiDetik,
        },
        jawaban,
        ringkasan,
        indicatorScores,
    };
};
