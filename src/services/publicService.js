import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

// GET semua kuesioner Publish
export const getPublicKuesionerListService = async () => {
  const now = new Date();

  const list = await prisma.distribusiKuesioner.findMany({
    where: {
      kuesioner: { status: "Publish" },
      tanggalMulai: { lte: now },
      tanggalSelesai: { gte: now },
    },
    include: {
      kuesioner: {
        select: {
          judul: true,
          kuesionerId: true,
          kategori: true,
          tujuan: true
        }
      }
    },
    orderBy: { distribusiId: "desc" }
  });

  return list.map(item => ({
    distribusiId: item.distribusiId,
    kuesionerId: item.kuesioner.kuesionerId,
    kodeAkses: item.kodeAkses,
    urlLink: item.urlLink,
    kuesionerId: item.kuesioner.kuesionerId,
    judul: item.kuesioner.judul,
    tujuan: item.kuesioner.tujuan,
    kategori: item.kuesioner.kategori,
    tanggalMulai: item.tanggalMulai,
    tanggalSelesai: item.tanggalSelesai,
  }));
};


// GET Kuesioner Publish by ID (versi standar, bukan publik)
export const getPublicKuesionerDetailService = async (kuesionerId) => {
  const kuesioner = await prisma.kuesioner.findFirst({
    where: {
      kuesionerId: Number(kuesionerId),
      status: "Publish",
    },
    include: {
      kategori: {
        select: {
          nama: true
        }

      },
      distribusi: { 
        select: {
          kodeAkses: true,
        },
      },
    },
  });

  if (!kuesioner) {
    throw new ApiError(404, "Kuesioner tidak ditemukan atau belum publish");
  }

  const pertanyaan = await prisma.pertanyaan.findMany({
    where: {
      indikator: {
        variabel: { kuesionerId: Number(kuesionerId) }
      }
    },
    orderBy: { urutan: "asc" }
  });

  return {
    kuesioner,
    pertanyaan
  };
};



// GET Public Kuesioner
export const getPublicKuesionerService = async (kodeAkses) => {
  const distribusi = await prisma.distribusiKuesioner.findFirst({
    where: { kodeAkses },
    include: { kuesioner: true },
  });

  if (!distribusi) {
    throw new ApiError(404, "Kode akses tidak ditemukan");
  }

  const now = new Date();
  const kuesioner = distribusi.kuesioner;

  // status Arsip tidak boleh diakses
  if (kuesioner.status === "Arsip") {
    throw new ApiError(403, "Kuesioner sudah diarsipkan");
  }

  // cek tanggal aktif
  if (distribusi.tanggalMulai && now < distribusi.tanggalMulai) {
    throw new ApiError(403, "Kuesioner belum tersedia");
  }
  if (distribusi.tanggalSelesai && now > distribusi.tanggalSelesai) {
    throw new ApiError(403, "Kuesioner sudah ditutup");
  }

  const kuesionerId = kuesioner.kuesionerId;

  // indikator list
  const pertanyaan = await prisma.pertanyaan.findMany({
    where: {
      indikator: {
        variabel: { kuesionerId }
      }
    },
    orderBy: { urutan: "asc" }
  });

  return {
    distribusiId: distribusi.distribusiId,
    kuesioner,
    pertanyaan,
  };
};


// SUBMIT KUESIONER PUBLIC
export const submitKuesionerService = async (kodeAkses, profile, jawabanList) => {
  // Cari distribusi
  const distribusi = await prisma.distribusiKuesioner.findFirst({
    where: { kodeAkses },
    include: { kuesioner: true },
  });

  if (!distribusi) throw new ApiError(404, "Kode akses tidak ditemukan");

  const now = new Date();
  const kuesioner = distribusi.kuesioner;

  // Cek Status & Waktu Aktif
  if (kuesioner.status === "Arsip") throw new ApiError(403, "Kuesioner sudah diarsipkan");
  if (kuesioner.status !== "Publish") throw new ApiError(403, "Kuesioner belum dipublikasikan");
  if (distribusi.tanggalMulai && now < distribusi.tanggalMulai) throw new ApiError(403, "Distribusi belum dimulai");
  if (distribusi.tanggalSelesai && now > distribusi.tanggalSelesai) throw new ApiError(403, "Distribusi sudah berakhir");

  const kuesionerId = kuesioner.kuesionerId;

  // Ambil semua pertanyaan kuesioner 
  const pertanyaanAll = await prisma.pertanyaan.findMany({
    where: {
      indikator: { variabel: { kuesionerId: Number(kuesionerId) } }
    },
    select: {
      pertanyaanId: true,
      indikatorId: true,
      labelSkala: true
    }
  });

  const totalPertanyaan = pertanyaanAll.length;
  if (jawabanList.length !== totalPertanyaan) {
    throw new ApiError(400, `Semua pertanyaan harus dijawab (${jawabanList.length}/${totalPertanyaan})`);
  }

  const mapPertanyaan = new Map();
  pertanyaanAll.forEach(p => mapPertanyaan.set(p.pertanyaanId, p));

  for (const a of jawabanList) {
    const pId = Number(a.pertanyaanId);
    const dataAsli = mapPertanyaan.get(pId);

    if (!dataAsli) throw new ApiError(400, `Pertanyaan ID ${pId} tidak valid`);

    const keysSkala = Object.keys(dataAsli.labelSkala || {}).map(Number);
    const maxSkalaTersedia = Math.max(...keysSkala) || 5;

    const nilai = Number(a.nilai);
    if (nilai < 1 || nilai > maxSkalaTersedia) {
      throw new ApiError(400, `Nilai untuk pertanyaan ${pId} harus antara 1-${maxSkalaTersedia}`);
    }
  }

  if (profile.email) {
    const exist = await prisma.respondenProfile.findFirst({
      where: { email: profile.email, kuesionerId },
    });
    if (exist) throw new ApiError(400, "Email sudah digunakan pada kuesioner ini");
  }

  return await prisma.$transaction(async (tx) => {
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

    // Simpan jawaban
    for (const a of jawabanList) {
      await tx.jawaban.create({
        data: {
          respondenId,
          pertanyaanId: Number(a.pertanyaanId),
          nilai: Number(a.nilai),
        },
      });
    }

    // hitung skor per indikator (DINAMIS)
    const indikatorMap = new Map();
    jawabanList.forEach(a => {
      const pId = Number(a.pertanyaanId);
      const indId = mapPertanyaan.get(pId).indikatorId;
      if (!indikatorMap.has(indId)) indikatorMap.set(indId, []);
      indikatorMap.get(indId).push(Number(a.nilai));
    });

    const scores = [];
    for (const [indikatorId, listNilai] of indikatorMap.entries()) {
      const raw = listNilai.reduce((s, x) => s + x, 0) / listNilai.length;

      // Ambil max scale
      const contohP = pertanyaanAll.find(p => p.indikatorId === indikatorId);
      const keysSkala = Object.keys(contohP.labelSkala || {}).map(Number);
      const maxScale = Math.max(...keysSkala) || 5;

      // RUMUS NORMALISASI DINAMIS: ((Raw - 1) / (Max - 1)) * 100
      const pembagi = maxScale - 1 > 0 ? maxScale - 1 : 1;
      const norm = ((raw - 1) / pembagi) * 100;

      const saved = await tx.respondenScore.create({
        data: {
          respondenId,
          kuesionerId,
          indikatorId,
          scoreRaw: raw,
          scoreNormalized: norm,
        },
      });

      scores.push({ indikatorId, scoreRaw: raw, scoreNormalized: norm });
    }

    await tx.respondenProfile.update({
      where: { respondenId },
      data: { waktuSelesai: new Date() },
    });

    return { respondenId, scores };
  });
};


export const checkEmailDuplicateService = async (email, kuesionerId) => {
  const existingResponden = await prisma.respondenProfile.findUnique({
    where: {
      email_kuesionerId: {
        email: email,
        kuesionerId: Number(kuesionerId),
      },
    },
    select: {
      respondenId: true, 
    },
  });

  return !!existingResponden;
};