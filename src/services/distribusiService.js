// fileName: src/services/distribusiService.js

import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { generateAccessCode, generatePublicLink } from "../utils/generator.js";

/**
 * HELPER: Menyamakan jam, menit, detik, dan milidetik dari satu tanggal ke tanggal lain.
 */
const syncTime = (sourceDate, targetDate) => {
  const synced = new Date(targetDate);
  synced.setHours(
    sourceDate.getHours(),
    sourceDate.getMinutes(),
    sourceDate.getSeconds(),
    sourceDate.getMilliseconds()
  );
  return synced;
};

// GET DISTRIBUSI
export const getDistribusiService = async (kuesionerId) => {
  const id = Number(kuesionerId);

  await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id }
  });

  return prisma.distribusiKuesioner.findMany({
    where: { kuesionerId: id },
    orderBy: { distribusiId: "desc" }
  });
};

// CREATE DISTRIBUSI
export const createDistribusiService = async (kuesionerId, data) => {
  const id = Number(kuesionerId);

  if (!data.tanggalMulai || !data.tanggalSelesai) {
    throw new ApiError(400, "Tanggal mulai dan tanggal selesai wajib diisi.");
  }

  const kuesioner = await prisma.kuesioner.findUniqueOrThrow({
    where: { kuesionerId: id },
  });

  if (kuesioner.status === "Arsip") {
    throw new ApiError(400, "Kuesioner arsip tidak bisa dibuatkan distribusi.");
  }

  const now = new Date();

  const inputStart = new Date(data.tanggalMulai);
  const isStartToday = inputStart.toDateString() === now.toDateString();
  const start = isStartToday ? new Date() : inputStart;

  let end = new Date(data.tanggalSelesai);

  if (inputStart.toDateString() === end.toDateString()) {
    end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  } else {
    end = syncTime(start, end);
  }

  if (end < now) {
    throw new ApiError(400, "Waktu berakhir tidak boleh di masa lalu.");
  }

  const aktif = await prisma.distribusiKuesioner.findFirst({
    where: {
      kuesionerId: id,
      OR: [
        {
          AND: [
            { tanggalMulai: { lte: now } },
            { tanggalSelesai: { gte: now } },
          ],
        },
        {
          AND: [
            { tanggalMulai: { lte: now } },
            { tanggalSelesai: null },
          ],
        },
      ],
    },
  });

  if (aktif) {
    throw new ApiError(400, "Masih ada periode distribusi yang sedang aktif.");
  }

  
  let kodeAkses = generateAccessCode(8);
  let exist = await prisma.distribusiKuesioner.findFirst({ where: { kodeAkses } });

  while (exist) {
    kodeAkses = generateAccessCode(8);
    exist = await prisma.distribusiKuesioner.findFirst({ where: { kodeAkses } });
  }

  const urlLink = generatePublicLink(kodeAkses);

  return prisma.$transaction(async (tx) => {
    if (kuesioner.status === "Draft") {
      await tx.kuesioner.update({
        where: { kuesionerId: id },
        data: { status: "Publish" },
      });
    }

    return tx.distribusiKuesioner.create({
      data: {
        kuesionerId: id,
        kodeAkses,
        urlLink,
        tanggalMulai: start,
        tanggalSelesai: end,
        catatan: data.catatan || null,
      },
    });
  });
};

// UPDATE DISTRIBUSI
export const updateDistribusiService = async (id, data) => {
  const distribusiId = Number(id);

  const distribusi = await prisma.distribusiKuesioner.findUniqueOrThrow({
    where: { distribusiId },
  });

  const now = new Date();

  const start = data.tanggalMulai ? new Date(data.tanggalMulai) : distribusi.tanggalMulai;
  let end = data.tanggalSelesai ? new Date(data.tanggalSelesai) : distribusi.tanggalSelesai;


  if (data.tanggalMulai || data.tanggalSelesai) {
    if (start.toDateString() === end.toDateString()) {
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    } else {
      end = syncTime(start, end);
    }
  }

  if (end < now) {
    throw new ApiError(400, "Waktu berakhir tidak boleh di masa lalu.");
  }

  if (data.tanggalMulai) {
    const hasResponden = await prisma.respondenProfile.findFirst({
      where: { kuesionerId: distribusi.kuesionerId }
    });

    if (hasResponden) {
      throw new ApiError(400, "Tanggal mulai tidak bisa diubah karena kuesioner sudah mulai diisi.");
    }
  }

  return prisma.distribusiKuesioner.update({
    where: { distribusiId },
    data: {
      tanggalMulai: start,
      tanggalSelesai: end,
      catatan: data.catatan ?? distribusi.catatan,
    },
  });
};

// DELETE DISTRIBUSI
export const deleteDistribusiService = async (id) => {
  const distribusiId = Number(id);

  const distribusi = await prisma.distribusiKuesioner.findUniqueOrThrow({
    where: { distribusiId },
  });

  const used = await prisma.respondenProfile.findFirst({
    where: { kuesionerId: distribusi.kuesionerId },
  });

  if (used) {
    throw new ApiError(400, "Distribusi tidak dapat dihapus karena data responden sudah terekam.");
  }

  return prisma.distribusiKuesioner.delete({
    where: { distribusiId },
  });
};