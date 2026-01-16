import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { extractScale } from "../utils/scaleUtils.js";
import { getInterpretasi } from "../utils/interpretasiUtils.js";


const validateAnalisisConfig = (config) => {
    if (!config) {
        throw new ApiError(400, "AnalisisConfig belum diatur. Silakan tambahkan konfigurasi terlebih dahulu.");
    }

    if (!Array.isArray(config.interpretasi) || config.interpretasi.length === 0) {
        throw new ApiError(400, "AnalisisConfig.interpretasi tidak valid atau belum diisi.");
    }

    for (const r of config.interpretasi) {
        if (typeof r.min !== "number" || typeof r.max !== "number" || !r.label) {
            throw new ApiError(400, "Setiap range harus memiliki { min, max, label } yang valid.");
        }
        if (r.min > r.max) {
            throw new ApiError(400, "Range min tidak boleh lebih besar dari max.");
        }
    }

    return true;
};


export const getAnalisisKuesionerListService = async ({
    search,
    kategori,
    page = 1,
    limit = 10
}) => {

    const skip = (page - 1) * limit;

    const where = {
        AND: [
            { status: { in: ["Publish", "Arsip"] } },
            search ? { judul: { contains: search } } : undefined,
            kategori ? { kategoriId: Number(kategori) } : undefined
        ].filter(Boolean)
    };


    const items = await prisma.kuesioner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        select: {
            kuesionerId: true,
            judul: true,
            kategori: { select: { nama: true } },
            createdAt: true,
            updatedAt: true,
            _count: {
                select: { responden: true, variabel: true }
            }
        }
    });

    const filteredItems = items.filter(i => i._count.responden > 0);

    const total = await prisma.kuesioner.count({ where });

    return {
        items: filteredItems,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            filtered: filteredItems.length
        }
    };
};


export const getAnalisisService = async (kuesionerId, filters = {}) => {

    kuesionerId = Number(kuesionerId);

    // 1. Ambil Kuesioner dan Validasi
    const kues = await prisma.kuesioner.findUniqueOrThrow({
        where: { kuesionerId },
        select: {
            kuesionerId: true,
            judul: true,
            analisisConfig: true,
            distribusi: {
                select: {
                    tanggalSelesai: true
                }
            }
        }
    });

    validateAnalisisConfig(kues.analisisConfig);


    const cleanFilters = {};
    const filterKeys = ['usiaKategori', 'jenisKelamin', 'tingkatPendidikan', 'agama', 'pekerjaan'];

    filterKeys.forEach(key => {
        const value = filters[key]; 

        if (value) {
            let processedValue = value;

            if (!Array.isArray(processedValue)) {
                processedValue = [processedValue];
            }

           
            if (processedValue.length > 0) {
                cleanFilters[key] = processedValue.map(String);
            }
        }
    });


    const respondenWhere = {
        kuesionerId,
        ...(cleanFilters.usiaKategori && { usiaKategori: { in: cleanFilters.usiaKategori } }),
        ...(cleanFilters.jenisKelamin && { jenisKelamin: { in: cleanFilters.jenisKelamin } }),
        ...(cleanFilters.tingkatPendidikan && { tingkatPendidikan: { in: cleanFilters.tingkatPendidikan } }),
        ...(cleanFilters.agama && { agama: { in: cleanFilters.agama } }),
        ...(cleanFilters.pekerjaan && { pekerjaan: { in: cleanFilters.pekerjaan } })
    };

    const filteredResponden = await prisma.respondenProfile.findMany({
        where: respondenWhere,
        select: { respondenId: true }
    });

    const respondenIds = filteredResponden.map(r => r.respondenId);

    const totalResponden = respondenIds.length;

  
    if (totalResponden === 0) {
        return {
            kuesioner: kues,
            totalResponden: 0,
            pertanyaan: [],
            indikator: [],
            variabel: [],
            overall: null,
            overallInterpretasi: null
        };
    }



    const variabel = await prisma.variabel.findMany({
        where: { kuesionerId },
        orderBy: { variabelId: "asc" }
    });

    const indikator = await prisma.indikator.findMany({
        where: { variabelId: { in: variabel.map(v => v.variabelId) } },
        orderBy: { indikatorId: "asc" }
    });

    const pertanyaan = await prisma.pertanyaan.findMany({
        where: { indikatorId: { in: indikator.map(i => i.indikatorId) } },
        orderBy: [{ indikatorId: "asc" }, { urutan: "asc" }]
    });

    const pIds = pertanyaan.map(p => p.pertanyaanId);
    const indIds = indikator.map(i => i.indikatorId);

    // STATISTIK PER PERTANYAAN

    const stats = await prisma.jawaban.groupBy({
        by: ["pertanyaanId"],
        where: {
            pertanyaanId: { in: pIds },
            respondenId: { in: respondenIds }
        },
        _count: { nilai: true },
        _avg: { nilai: true }
    });

    const statsMap = new Map();
    stats.forEach(s => {
        statsMap.set(s.pertanyaanId, {
            count: s._count.nilai,
            avgRaw: s._avg.nilai ? Number(s._avg.nilai.toFixed(2)) : null
        });
    });

    // SCORE NORMALISASI PER INDIKATOR

    const indikatorScore = await prisma.respondenScore.groupBy({
        by: ["indikatorId"],
        where: {
            kuesionerId,
            indikatorId: { in: indIds },
            respondenId: { in: respondenIds }
        },
        _avg: { scoreNormalized: true, scoreRaw: true }
    });

    const indScoreMap = new Map();
    indikatorScore.forEach(s => {
        indScoreMap.set(s.indikatorId, {
            avgRaw: s._avg.scoreRaw ? Number(s._avg.scoreRaw.toFixed(2)) : null,
            avgNormalized: s._avg.scoreNormalized
                ? Number(s._avg.scoreNormalized.toFixed(2))
                : null
        });
    });

    // FORMAT PERTANYAAN

    const pertanyaanResponse = indikator.map(ind => {
        const list = pertanyaan.filter(p => p.indikatorId === ind.indikatorId);

        return {
            indikatorId: ind.indikatorId,
            kode: ind.kode,
            pertanyaan: list.map(p => {
                const st = statsMap.get(p.pertanyaanId) || {
                    count: 0,
                    avgRaw: null
                };

                const { min, max } = extractScale(p.labelSkala);
                const range = max - min;
                const avgNorm =
                    st.avgRaw !== null && range > 0
                        ? Number((((st.avgRaw - min) / range) * 100).toFixed(2))
                        : null;

                return {
                    pertanyaanId: p.pertanyaanId,
                    teksPertanyaan: p.teksPertanyaan,
                    urutan: p.urutan,
                    scale: { min, max },
                    stats: {
                        count: st.count,
                        avgRaw: st.avgRaw,
                        avgNormalized: avgNorm
                    },
                    interpretasi: getInterpretasi(avgNorm, kues.analisisConfig)
                };
            })
        };
    });

    // HASIL PER INDIKATOR

    const indikatorResult = indikator.map(i => {
        const sc = indScoreMap.get(i.indikatorId) || {
            avgRaw: null,
            avgNormalized: null
        };

        return {
            indikatorId: i.indikatorId,
            variabelId: i.variabelId,
            indikatorKode: i.kode,
            indikatorNama: i.nama,
            pertanyaanCount: pertanyaanResponse.find(x => x.indikatorId === i.indikatorId)?.pertanyaan.length || 0,
            avgRaw: sc.avgRaw,
            avgNormalized: sc.avgNormalized,
            interpretasi: getInterpretasi(sc.avgNormalized, kues.analisisConfig)
        };
    });

    // HASIL PER VARIABEL
    const variabelResult = variabel.map(v => {
        const inds = indikatorResult.filter(i => i.variabelId === v.variabelId);
        const valid = inds.filter(i => i.avgNormalized !== null);

        const avg =
            valid.length > 0
                ? Number(
                    (
                        valid.reduce((sum, x) => sum + x.avgNormalized, 0) /
                        valid.length
                    ).toFixed(2)
                )
                : null;

        return {
            variabelId: v.variabelId,
            nama: v.nama,
            kode: v.kode,
            indikatorCount: inds.length,
            avgNormalized: avg,
            interpretasi: getInterpretasi(avg, kues.analisisConfig)
        };
    });

    // OVERALL
    const validVars = variabelResult.filter(v => v.avgNormalized !== null);
    const overall =
        validVars.length > 0
            ? Number(
                (
                    validVars.reduce((a, b) => a + b.avgNormalized, 0) /
                    validVars.length
                ).toFixed(2)
            )
            : null;

    const overallInterpretasi = getInterpretasi(overall, kues.analisisConfig);

    return {
        kuesioner: kues,
        totalResponden,
        pertanyaan: pertanyaanResponse,
        indikator: indikatorResult,
        variabel: variabelResult,
        overall,
        overallInterpretasi
    };
};

export const updateAnalisisConfigService = async (kuesionerId, config) => {
    kuesionerId = Number(kuesionerId);

    await prisma.kuesioner.findUniqueOrThrow({ where: { kuesionerId } });
    validateAnalisisConfig(config);

    return prisma.kuesioner.update({
        where: { kuesionerId },
        data: { analisisConfig: config }
    });
};

