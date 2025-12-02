import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

/**
 * GET Public Kuesioner by kode akses
 */
export const getPublicKuesionerService = async (kodeAkses) => {
  const distribusi = await prisma.distribusiKuesioner.findFirst({
    where: { kodeAkses },
    include: { kuesioner: true },
  });

  if (!distribusi) {
    throw new ApiError(404, "Kode akses tidak ditemukan");
  }

  const now = new Date();

  // status ARSIP tidak boleh diakses publik
  if (distribusi.kuesioner.status === "Arsip") {
    throw new ApiError(403, "Kuesioner sudah diarsipkan dan tidak dapat diakses");
  }

  // cek waktu aktif
  if (distribusi.tanggalMulai && now < distribusi.tanggalMulai) {
    throw new ApiError(403, "Kuesioner belum tersedia");
  }
  if (distribusi.tanggalSelesai && now > distribusi.tanggalSelesai) {
    throw new ApiError(403, "Kuesioner sudah ditutup");
  }

  const kuesionerId = distribusi.kuesioner.kuesionerId;

  // indikator
  const indikator = await prisma.indikator.findMany({
    where: { kuesionerId },
    orderBy: { indikatorId: "asc" },
  });

  // pertanyaan
  const pertanyaan = await prisma.pertanyaan.findMany({
    where: { indikator: { kuesionerId } },
    orderBy: { urutan: "asc" },
  });

  return {
    distribusiId: distribusi.distribusiId,
    kuesioner: distribusi.kuesioner,
    pertanyaan,
  };
};



/**
 * SUBMIT Kuesioner oleh responden
 */
export const submitKuesionerService = async (kodeAkses, profile, jawabanList) => {
  // 1) Cari distribusi
  const distribusi = await prisma.distribusiKuesioner.findFirst({
    where: { kodeAkses },
    include: { kuesioner: true },
  });

  if (!distribusi) throw new ApiError(404, "Kode akses tidak ditemukan");

  const now = new Date();

  // status ARSIP
  if (distribusi.kuesioner.status === "Arsip") {
    throw new ApiError(403, "Kuesioner sudah diarsipkan");
  }

  // cek waktu aktif
  if (distribusi.tanggalMulai && now < distribusi.tanggalMulai) {
    throw new ApiError(403, "Distribusi belum dimulai");
  }
  if (distribusi.tanggalSelesai && now > distribusi.tanggalSelesai) {
    throw new ApiError(403, "Distribusi sudah berakhir");
  }

  const kuesioner = distribusi.kuesioner;

  if (kuesioner.status !== "Publish") {
    throw new ApiError(403, "Kuesioner belum dipublikasikan");
  }

  const kuesionerId = kuesioner.kuesionerId;

  // 2) Validasi pertanyaan
  const pertanyaanAll = await prisma.pertanyaan.findMany({
    where: { indikator: { kuesionerId } },
    select: { pertanyaanId: true, indikatorId: true },
  });

  const totalPertanyaan = pertanyaanAll.length;

  const mapValid = new Map();
  for (const p of pertanyaanAll) mapValid.set(p.pertanyaanId, p.indikatorId);

  // Cek jumlah jawaban
  if (jawabanList.length !== totalPertanyaan) {
    throw new ApiError(400, "Semua pertanyaan harus dijawab");
  }

  // Cek duplikasi pertanyaanId
  const idSet = new Set(jawabanList.map(j => Number(j.pertanyaanId)));
  if (idSet.size !== jawabanList.length) {
    throw new ApiError(400, "Tidak boleh ada pertanyaan dijawab dua kali");
  }

  // cek pertanyaan dan nilai
  for (const a of jawabanList) {
    if (!mapValid.has(Number(a.pertanyaanId))) {
      throw new ApiError(400, `Pertanyaan ID ${a.pertanyaanId} tidak valid`);
    }
    const nilai = Number(a.nilai);
    if (nilai < 1 || nilai > 5) {
      throw new ApiError(400, `Nilai pertanyaan ${a.pertanyaanId} harus antara 1-5`);
    }
  }

  // 3) Validasi email unik
  if (profile.email) {
    const exist = await prisma.respondenProfile.findFirst({
      where: { email: profile.email, kuesionerId },
    });
    if (exist) throw new ApiError(400, "Email sudah digunakan pada kuesioner ini");
  }

  // 4) Transaction: create responden, jawaban, score
  const result = await prisma.$transaction(async (tx) => {
    const responden = await tx.respondenProfile.create({
      data: {
        kuesionerId,
        nama: profile.nama || null,
        email: profile.email || null,
        usiaKategori: profile.usiaKategori,
        jenisKelamin: profile.jenisKelamin,
        tingkatPendidikan: profile.tingkatPendidikan,
        agama: profile.agama,
        pekerjaan: profile.pekerjaan || null,
        waktuMulai: now,
      },
    });

    const respondenId = responden.respondenId;

    // insert jawaban
    for (const a of jawabanList) {
      await tx.jawaban.create({
        data: {
          respondenId,
          pertanyaanId: Number(a.pertanyaanId),
          nilai: Number(a.nilai),
        },
      });
    }

    // Hitung score per indikator
    const indikatorMap = new Map();
    for (const a of jawabanList) {
      const pid = Number(a.pertanyaanId);
      const indId = mapValid.get(pid);
      if (!indikatorMap.has(indId)) indikatorMap.set(indId, []);
      indikatorMap.get(indId).push(Number(a.nilai));
    }

    const scores = [];

    for (const [indikatorId, arr] of indikatorMap.entries()) {
      const raw = arr.reduce((s, x) => s + x, 0) / arr.length;

      // 1 → 0, 5 → 100
      const norm = ((raw - 1) / 4) * 100;

      const saved = await tx.respondenScore.create({
        data: {
          respondenId,
          kuesionerId,
          indikatorId,
          scoreRaw: raw,
          scoreNormalized: norm,
        },
      });

      scores.push({
        indikatorId,
        scoreRaw: raw,
        scoreNormalized: norm,
        respondenScoreId: saved.respondenScoreId,
      });
    }

    await tx.respondenProfile.update({
      where: { respondenId },
      data: { waktuSelesai: new Date() },
    });

    return { respondenId, scores };
  });

  return result;
};
